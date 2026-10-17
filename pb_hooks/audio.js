// Transcodes uploaded recordings to VBR MP3 for audio.pb.js. The encoder settings match the
// manual workflow the existing recordings were made with.

const AUDIO_FIELD = "audioFiles";

const DECODE_ARGS = ["-nostdin", "-hide_banner", "-loglevel", "error"];
const ENCODE_ARGS = ["--vbr-new", "-V", "5", "--noreplaygain", "--silent"];

function saveWithTranscodedAudio(e) {
  const files = e.record.getUnsavedFiles(AUDIO_FIELD);
  if (files.length === 0) {
    return e.next();
  }

  const workDir = $filepath.join($os.tempDir(), `choirchaos-audio-${$security.randomString(16)}`);
  $os.mkdirAll(workDir, 0o700);

  try {
    files.forEach((file, index) => transcode(e.app, file, $filepath.join(workDir, String(index))));
    return e.next();
  } finally {
    $os.removeAll(workDir);
  }
}

// The converted file replaces the upload in place, so the record keeps the upload order. Its
// reader points into the work dir, which therefore has to outlive the save.
function transcode(app, file, pathPrefix) {
  const inputPath = `${pathPrefix}-upload${$filepath.ext(file.originalName)}`;
  const wavPath = `${pathPrefix}-decoded.wav`;
  const mp3Path = `${pathPrefix}-encoded.mp3`;

  writeUpload(file, inputPath);
  run(app, file, "ffmpeg", ...DECODE_ARGS, "-i", inputPath, "-vn", "-f", "wav", wavPath);
  $os.remove(inputPath);
  run(app, file, "lame", ...ENCODE_ARGS, wavPath, mp3Path);
  $os.remove(wavPath);

  const converted = $filesystem.fileFromPath(mp3Path);
  file.reader = converted.reader;
  file.size = converted.size;
  file.name = withMp3Extension(file.name);
  file.originalName = withMp3Extension(file.originalName);
}

// Piping through cp streams the upload to disk. Reading it with toBytes() would hold the whole
// file in memory a second time, on top of the copy PocketBase already buffers for the request.
function writeUpload(file, path) {
  const reader = file.reader.open();
  try {
    const cmd = $os.cmd("cp", "/dev/stdin", path);
    cmd.stdin = reader;
    cmd.run();
  } finally {
    reader.close();
  }
}

function run(app, file, ...args) {
  try {
    $os.cmd(...args).combinedOutput();
  } catch (err) {
    app.logger().warn("Audio transcoding failed", "file", file.originalName, "command", args[0], "error", String(err));
    throw new BadRequestError(`Could not read '${file.originalName}' as audio.`);
  }
}

function withMp3Extension(name) {
  return `${name.slice(0, name.length - $filepath.ext(name).length)}.mp3`;
}

module.exports = { saveWithTranscodedAudio };
