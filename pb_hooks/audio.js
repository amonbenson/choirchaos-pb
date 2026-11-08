// Transcodes recordings to mono Ogg Opus and maintains the song's seek index, for audio.pb.js and the
// Opus migration. The player streams recordings by byte range, so it needs to know where each Ogg
// page starts and up to which sample it decodes.

const AUDIO_FIELD = "audioFiles";
const INDEX_FIELD = "audioIndex";
const INDEX_FILE_NAME = "audio_index.json";
const OPUS_EXTENSION = ".opus";

// Mono, because the player mixes every track down to mono anyway. Half-second pages keep the index
// small while a range request fetches at most half a second more than it needs.
const DECODE_ARGS = ["-nostdin", "-hide_banner", "-loglevel", "error"];
const ENCODE_ARGS = ["-vn", "-ac", "1", "-ar", "48000", "-c:a", "libopus", "-b:a", "64k", "-application", "audio", "-page_duration", "500000", "-f", "ogg"];

const OGG_HEADER_SIZE = 27;
const OPUS_HEADER_PACKETS = 2;

function saveWithTranscodedAudio(e) {
  const files = e.record.getUnsavedFiles(AUDIO_FIELD);
  if (files.length === 0 && !hasAudioFilesChanged(e.record)) {
    return e.next();
  }

  // goja loses closure variables in a finally block after the try block returned, so no try block
  // here or below returns.
  const workDir = makeWorkDir();
  let result;
  try {
    const index = readStoredIndex(e.app, e.record);
    files.forEach((file, i) => {
      const outputPath = transcodeUpload(e.app, file, $filepath.join(workDir, String(i)));
      index[file.name] = buildIndex($os.readFile(outputPath));
    });

    setIndex(e.record, index, getFileNames(e.record));
    result = e.next();
  } finally {
    $os.removeAll(workDir);
  }

  return result;
}

/**
 * Converts the stored recordings of a song that has no index yet. The recordings keep their order and
 * base names, and the tracks follow the new file names. Returns whether the song changed.
 *
 * Migrations have no $filesystem to build upload files, so the converted files are staged in storage
 * and handed to the record as reuploadable files.
 */
function convertStoredAudio(app, record) {
  const names = record.getStringSlice(AUDIO_FIELD);
  if (names.length === 0 || record.getString(INDEX_FIELD)) {
    return false;
  }

  const workDir = makeWorkDir();
  const stagingDir = `${record.baseFilesPath()}/opus_conversion_${$security.randomString(10).toLowerCase()}`;
  const fsys = app.newFilesystem();
  const staged = [];
  const stage = (bytes, name) => {
    const key = `${stagingDir}/${name}`;
    fsys.upload(bytes, key);
    staged.push(key);
    return fsys.getReuploadableFile(key, true);
  };

  try {
    const index = {};
    const renamed = {};
    const files = names.map((name, i) => {
      const pathPrefix = $filepath.join(workDir, String(i));
      const inputPath = `${pathPrefix}-stored${$filepath.ext(name)}`;
      const reader = fsys.getReader(`${record.baseFilesPath()}/${name}`);
      try {
        writeReader(reader, inputPath);
      } finally {
        reader.close();
      }

      const bytes = $os.readFile(encode(app, name, inputPath, pathPrefix));
      const opusName = withOpusExtension(name);
      renamed[name] = opusName;
      index[opusName] = buildIndex(bytes);
      return stage(bytes, opusName);
    });

    const indexName = `audio_index_${$security.randomString(10).toLowerCase()}.json`;
    const entries = pickEntries(index, files.map(file => file.name));

    record.set(AUDIO_FIELD, files);
    record.set(INDEX_FIELD, stage(toBytes(JSON.stringify(entries)), indexName));
    record.set("tracks", renameTrackFiles(record, renamed));
    app.save(record);
  } finally {
    staged.forEach(key => fsys.delete(key));
    fsys.close();
    $os.removeAll(workDir);
    removeEmptyLocalDir(app, stagingDir);
  }

  return true;
}

// Local storage keeps the emptied staging directory.
function removeEmptyLocalDir(app, key) {
  try {
    $os.remove($filepath.join(app.dataDir(), "storage", key));
  } catch {}
}

function makeWorkDir() {
  const workDir = $filepath.join($os.tempDir(), `choirchaos-audio-${$security.randomString(16)}`);
  $os.mkdirAll(workDir, 0o700);
  return workDir;
}

function hasAudioFilesChanged(record) {
  const before = record.original().getStringSlice(AUDIO_FIELD);
  const after = getFileNames(record);
  return before.length !== after.length || before.some((name, i) => name !== after[i]);
}

// The field holds stored names and, before the save, the upload files, which getStringSlice() skips.
function getFileNames(record) {
  const value = record.get(AUDIO_FIELD);
  const names = [];
  for (let i = 0; i < (value ? value.length : 0); i++) {
    names.push(typeof value[i] === "string" ? value[i] : value[i].name);
  }

  return names;
}

// The converted file replaces the upload in place, so the record keeps the upload order. Its
// reader points into the work dir, which therefore has to outlive the save.
function transcodeUpload(app, file, pathPrefix) {
  const inputPath = `${pathPrefix}-upload${$filepath.ext(file.originalName)}`;
  const reader = file.reader.open();
  try {
    writeReader(reader, inputPath);
  } finally {
    reader.close();
  }

  const outputPath = encode(app, file.originalName, inputPath, pathPrefix);
  const converted = $filesystem.fileFromPath(outputPath);
  file.reader = converted.reader;
  file.size = converted.size;
  file.name = withOpusExtension(file.name);
  file.originalName = withOpusExtension(file.originalName);
  return outputPath;
}

function encode(app, displayName, inputPath, pathPrefix) {
  const outputPath = `${pathPrefix}-encoded${OPUS_EXTENSION}`;
  run(app, displayName, "ffmpeg", ...DECODE_ARGS, "-i", inputPath, ...ENCODE_ARGS, outputPath);
  $os.remove(inputPath);
  return outputPath;
}

// Piping through cp streams the file to disk. Reading it with toBytes() would hold the whole
// file in memory a second time, on top of the copy PocketBase already buffers for the request.
function writeReader(reader, path) {
  const cmd = $os.cmd("cp", "/dev/stdin", path);
  cmd.stdin = reader;
  cmd.run();
}

function run(app, displayName, ...args) {
  try {
    $os.cmd(...args).combinedOutput();
  } catch (err) {
    app.logger().warn("Audio transcoding failed", "file", displayName, "command", args[0], "error", String(err));
    throw new BadRequestError(`Could not read '${displayName}' as audio.`);
  }
}

function readStoredIndex(app, record) {
  const stored = record.original().getString(INDEX_FIELD);
  if (!stored) {
    return {};
  }

  const fsys = app.newFilesystem();
  let raw;
  try {
    const reader = fsys.getReader(`${record.baseFilesPath()}/${stored}`);
    try {
      raw = toString(reader);
    } finally {
      reader.close();
    }
  } finally {
    fsys.close();
  }

  return JSON.parse(raw);
}

// Only the entries of `names` are kept, so removed recordings drop out of the index.
function setIndex(record, index, names) {
  if (names.length === 0) {
    record.set(INDEX_FIELD, null);
    return;
  }

  const entries = pickEntries(index, names);
  record.set(INDEX_FIELD, $filesystem.fileFromBytes(toBytes(JSON.stringify(entries)), INDEX_FILE_NAME));
}

function pickEntries(index, names) {
  const entries = {};
  names.forEach((name) => {
    if (!index[name]) {
      throw new BadRequestError(`The recording '${name}' has no audio index.`);
    }

    entries[name] = index[name];
  });
  return entries;
}

function renameTrackFiles(record, renamed) {
  const raw = record.getString("tracks");
  const tracks = raw ? JSON.parse(raw) : [];
  return (Array.isArray(tracks) ? tracks : []).map(track => (
    track && renamed[track.audioFile] ? Object.assign({}, track, { audioFile: renamed[track.audioFile] }) : track
  ));
}

function withOpusExtension(name) {
  return `${name.slice(0, name.length - $filepath.ext(name).length)}${OPUS_EXTENSION}`;
}

/**
 * The seek index of an Ogg Opus file: the size of its header pages, then the size of every audio page
 * and how far its granule position advances. Granule positions count the pre-skip.
 */
function buildIndex(bytes) {
  const pageBytes = [];
  const pageSamples = [];
  let pos = 0;
  let headerPackets = 0;
  let headerBytes = 0;
  let preSkip = 0;
  let lastGranule = 0;

  while (pos + OGG_HEADER_SIZE <= bytes.length) {
    if (bytes[pos] !== 0x4f || bytes[pos + 1] !== 0x67 || bytes[pos + 2] !== 0x67 || bytes[pos + 3] !== 0x53) {
      throw new Error(`Invalid Ogg page at byte ${pos}`);
    }

    const segments = bytes[pos + 26];
    let bodySize = 0;
    let completePackets = 0;
    for (let i = 0; i < segments; i++) {
      const lacing = bytes[pos + OGG_HEADER_SIZE + i];
      bodySize += lacing;
      if (lacing < 255) {
        completePackets++;
      }
    }

    const size = OGG_HEADER_SIZE + segments + bodySize;
    if (headerPackets < OPUS_HEADER_PACKETS) {
      if (headerPackets === 0) {
        const body = pos + OGG_HEADER_SIZE + segments;
        preSkip = bytes[body + 10] | (bytes[body + 11] << 8);
      }

      headerPackets += completePackets;
      headerBytes = pos + size;
    } else {
      const granule = readGranule(bytes, pos + 6);
      const advance = granule < 0 ? 0 : granule - lastGranule;
      pageBytes.push(size);
      pageSamples.push(advance);
      lastGranule += advance;
    }

    pos += size;
  }

  if (pos !== bytes.length || pageBytes.length === 0) {
    throw new Error("Truncated Ogg Opus file");
  }

  return { preSkip, headerBytes, pageBytes, pageSamples };
}

// Reads the 64-bit little-endian granule position. -1 marks a page on which no packet ends.
function readGranule(bytes, offset) {
  let low = 0;
  let high = 0;
  for (let i = 3; i >= 0; i--) {
    low = low * 256 + bytes[offset + i];
    high = high * 256 + bytes[offset + 4 + i];
  }

  return high === 0xffffffff && low === 0xffffffff ? -1 : high * 4294967296 + low;
}

module.exports = { saveWithTranscodedAudio, convertStoredAudio };
