/// <reference path="../pb_data/types.d.ts" />

// Replaces the song fields measures, unnumberedBoxes, warpMarkers and events with the three layer
// fields score, recording and arrangement, and converts every song.
//
// Old format: measures are identified by their numbering ("12", "12a", "12-2"), and markers, vamps
// and warp markers reference them by that numbering. A MIDI song stores one measure per beat map
// label, including the terminal bar and the "-k" labels of recorded repeats.
//
// New format: measures have stable IDs (m1..mn) and free text labels. The recording lists the order
// in which the backing track plays them as inclusive spans of measure IDs. Every reference is a
// measure ID plus the occurrence of that measure in the recording.

const SONGS = "pbc_1906970480"

const LEGACY_FIELDS = [
  { index: 9, id: "json1351228501", name: "measures" },
  { index: 10, id: "json1401378634", name: "events" },
  { index: 11, id: "json3414674270", name: "warpMarkers" },
  { index: 14, id: "json1857462093", name: "unnumberedBoxes" },
]

const LAYER_FIELDS = [
  { id: "json2391283186", name: "score" },
  { id: "json3612954412", name: "recording" },
  { id: "json1069213742", name: "arrangement" },
]

const VAMP_OUTS = ["onEnd", "anyBar", "anyBeat"]
const VAMP_VOCALS = ["all", "first", "last", "split"]

function jsonField(id, name) {
  return new Field({
    "hidden": false,
    "id": id,
    "maxSize": 0,
    "name": name,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json",
  })
}

function readJson(record, field, fallback) {
  const raw = record.getString(field)
  if (!raw) {
    return fallback
  }

  const value = JSON.parse(raw)
  return value === null || value === undefined ? fallback : value
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function isPositiveInteger(value) {
  return typeof value === "number" && Number.isInteger(value) && value > 0
}

function updateSong(app, id, fields) {
  const params = { id: id }
  const assignments = Object.keys(fields).map((name) => {
    params[name] = JSON.stringify(fields[name])
    return `[[${name}]] = {:${name}}`
  })

  app.db().newQuery(`UPDATE {{songs}} SET ${assignments.join(", ")} WHERE [[id]] = {:id}`).bind(params).execute()
}

// ── Old numbering order (src/core/utils/numbering.ts before the redesign) ─────────────────────

const NUMBERING_REGEX = /^(\d+)?([a-zA-Z])?(-(\d+))?$/

function compareNumberings(a, b) {
  const matchA = a.match(NUMBERING_REGEX)
  const matchB = b.match(NUMBERING_REGEX)
  const numA = parseInt(matchA[1] || "0", 10)
  const numB = parseInt(matchB[1] || "0", 10)
  if (numA !== numB) {
    return numA - numB
  }

  const iterA = parseInt(matchA[4] || "0", 10)
  const iterB = parseInt(matchB[4] || "0", 10)
  if (iterA !== iterB) {
    return iterA - iterB
  }

  return (matchA[2] || "").localeCompare(matchB[2] || "")
}

// The old client kept measures sorted by numbering. Stored lists are already in that order, so this
// only matters for data written by hand. Lists with values that are no numbering stay as stored.
function sortLegacyMeasures(measures) {
  const valid = measures.every((measure) => typeof measure.value === "string" && NUMBERING_REGEX.test(measure.value) && measure.value !== "")
  if (!valid) {
    return measures.slice()
  }

  return measures
    .map((measure, index) => ({ measure: measure, index: index }))
    .sort((a, b) => compareNumberings(a.measure.value, b.measure.value) || a.index - b.index)
    .map((entry) => entry.measure)
}

// ── MIDI import (plan A4, the rules of src/core/midi/beatMap.ts) ──────────────────────────────

// "N-k" is the k-th recorded pass of written measure N, and "N" followed by R's is a written
// repeat of N. Every other label is a written measure of its own.
function writtenLabel(label) {
  const pass = label.match(/^(.+)-\d+$/)
  if (pass) {
    return pass[1]
  }

  const repeat = label.match(/^(\d+)R+$/)
  if (repeat) {
    return repeat[1]
  }

  return label
}

// The beat map's measures in tick order, including the terminal bar.
function readBeatMapSequence(beatMap) {
  const beats = asArray(beatMap && beatMap.score && beatMap.score.events)
    .filter((event) => event && event.type === "BEAT" && event.value)
    .map((event, index) => ({ tick: event.tickcount, label: String(event.value.meas), beat: event.value.beat, index: index }))
    .sort((a, b) => a.tick - b.tick || a.index - b.index)

  const sequence = []
  for (const event of beats) {
    const last = sequence[sequence.length - 1]
    if (!last || last.label !== event.label) {
      sequence.push({ label: event.label, beats: 0 })
    }

    const current = sequence[sequence.length - 1]
    current.beats = Math.max(current.beats, event.beat)
  }

  return sequence
}

function readBeatMap(app, record) {
  const key = record.baseFilesPath() + "/" + record.getString("jsonFile")
  const fs = app.newFilesystem()
  try {
    const reader = fs.getReader(key)
    try {
      return JSON.parse(toString(reader))
    } finally {
      reader.close()
    }
  } finally {
    fs.close()
  }
}

// ── Building the layers ──────────────────────────────────────────────────────────────────────

// Score, recording and the old labels of every timeline position. `positions` maps an old measure
// value to its timeline position. `terminal` is the position right after the recording that the
// old exclusive vamp ends may point at.
function buildMidiLayers(beatMap, legacyMeasures) {
  const sequence = readBeatMapSequence(beatMap)
  const terminal = sequence.length > 0 ? sequence.pop() : undefined

  const layouts = new Map()
  for (const measure of legacyMeasures) {
    if (measure && measure.layout && !layouts.has(String(measure.value))) {
      layouts.set(String(measure.value), measure.layout)
    }
  }

  const measures = []
  const indexByLabel = new Map()
  const scoreIndices = sequence.map((entry) => {
    const label = writtenLabel(entry.label)
    if (!indexByLabel.has(label)) {
      indexByLabel.set(label, measures.length)
      measures.push({ id: `m${measures.length + 1}`, label: label, beats: Math.max(1, entry.beats) })
    }

    const index = indexByLabel.get(label)
    const layout = layouts.get(entry.label) || layouts.get(label)
    if (!measures[index].layout && layout) {
      measures[index].layout = layout
    }

    return index
  })

  const spans = []
  scoreIndices.forEach((index, position) => {
    const span = spans[spans.length - 1]
    if (span && index === scoreIndices[position - 1] + 1) {
      span.to = index
    } else {
      spans.push({ from: index, to: index })
    }
  })

  // Old references use beat map labels. Written labels resolve to their first occurrence, which
  // covers data that the down migration restored without the "-k" labels.
  const positions = new Map()
  sequence.forEach((entry, position) => {
    if (!positions.has(entry.label)) {
      positions.set(entry.label, position)
    }
  })

  sequence.forEach((entry, position) => {
    const label = writtenLabel(entry.label)
    if (!positions.has(label)) {
      positions.set(label, position)
    }
  })

  if (terminal && !positions.has(terminal.label)) {
    positions.set(terminal.label, sequence.length)
  }

  return {
    measures: measures,
    spans: spans.map((span) => ({ from: measures[span.from].id, to: measures[span.to].id })),
    positions: positions,
  }
}

function buildAudioLayers(legacyMeasures) {
  const measures = []
  const positions = new Map()

  for (const old of legacyMeasures) {
    const label = old.value === undefined || old.value === null ? "" : String(old.value)
    if (label === "" || positions.has(label)) {
      continue
    }

    const measure = { id: `m${measures.length + 1}`, label: label, beats: isPositiveInteger(old.beats) ? old.beats : 1 }
    if (old.layout) {
      measure.layout = old.layout
    }

    positions.set(label, measures.length)
    measures.push(measure)
  }

  const first = measures[0]
  const last = measures[measures.length - 1]
  return {
    measures: measures,
    spans: first ? [{ from: first.id, to: last.id }] : [],
    positions: positions,
  }
}

// The recording as `{ measure, occurrence, beats }` per position, like expandRecording().
function expandRecording(measures, spans) {
  const indices = new Map(measures.map((measure, index) => [measure.id, index]))
  const occurrences = new Map()
  const timeline = []

  for (const span of spans) {
    for (let index = indices.get(span.from); index <= indices.get(span.to); index++) {
      const measure = measures[index]
      const occurrence = (occurrences.get(measure.id) || 0) + 1
      occurrences.set(measure.id, occurrence)
      timeline.push({ measure: measure.id, occurrence: occurrence, beats: measure.beats })
    }
  }

  return timeline
}

function isBeatAt(timeline, position, beat) {
  return position !== undefined && position >= 0 && position < timeline.length
    && Number.isInteger(beat) && beat >= 0 && beat < timeline[position].beats
}

function toLocation(timeline, position, beat) {
  const entry = timeline[position]
  return entry.occurrence === 1
    ? { measure: entry.measure, beat: beat }
    : { measure: entry.measure, beat: beat, occurrence: entry.occurrence }
}

function isBefore(a, b) {
  return a.position < b.position || (a.position === b.position && a.beat < b.beat)
}

// The positions a section covers, counting every back-to-back repetition of its first pass
// (findRecordedPasses() and getSectionExtent()).
function sectionExtent(timeline, from, to) {
  const pass = timeline.slice(from.position, to.position + 1).map((entry) => entry.measure)
  let last = to.position
  for (let start = to.position + 1; pass.every((measure, offset) => timeline[start + offset] && timeline[start + offset].measure === measure); start += pass.length) {
    last = start + pass.length - 1
  }

  return { from: from, to: { position: last, beat: to.beat } }
}

function convertReference(layers, timeline, reference) {
  if (!Array.isArray(reference)) {
    return undefined
  }

  const position = layers.positions.get(String(reference[0]))
  return { position: position, beat: reference[1] }
}

function convertMarkers(layers, timeline, oldMarkers) {
  const markers = []
  for (const old of oldMarkers) {
    const start = old && convertReference(layers, timeline, old.start)
    if (!start || !isBeatAt(timeline, start.position, start.beat)) {
      continue
    }

    markers.push({ start: start, marker: { at: toLocation(timeline, start.position, start.beat), text: String(old.marker || "") } })
  }

  return markers
    .map((entry, index) => ({ entry: entry, index: index }))
    .sort((a, b) => (isBefore(a.entry.start, b.entry.start) ? -1 : isBefore(b.entry.start, a.entry.start) ? 1 : a.index - b.index))
    .map((sorted) => sorted.entry.marker)
}

// Old vamps end on an exclusive [measure, beat]. Sections end on their last beat instead. Every vamp
// plays until released, so the old iteration count is dropped.
function convertVamps(layers, timeline, oldVamps) {
  const candidates = []
  for (const old of oldVamps) {
    const from = old && convertReference(layers, timeline, old.start)
    const end = old && convertReference(layers, timeline, old.end)
    if (!from || !end || !isBeatAt(timeline, from.position, from.beat)) {
      continue
    }

    if (end.position === undefined || end.position < 0 || end.position > timeline.length || !Number.isInteger(end.beat)) {
      continue
    }

    const endBeat = end.position < timeline.length ? Math.min(end.beat, timeline[end.position].beats) : 0
    const to = endBeat > 0
      ? { position: end.position, beat: endBeat - 1 }
      : { position: end.position - 1, beat: end.position > 0 ? timeline[end.position - 1].beats - 1 : -1 }

    if (!isBeatAt(timeline, to.position, to.beat) || !isBefore(from, to)) {
      continue
    }

    candidates.push({
      from: from,
      to: to,
      section: {
        kind: "vamp",
        from: toLocation(timeline, from.position, from.beat),
        to: toLocation(timeline, to.position, to.beat),
        out: VAMP_OUTS.indexOf(old.out) !== -1 ? old.out : "onEnd",
        vocals: VAMP_VOCALS.indexOf(old.vocals) !== -1 ? old.vocals : "all",
      },
    })
  }

  candidates.sort((a, b) => (isBefore(a.from, b.from) ? -1 : isBefore(b.from, a.from) ? 1 : 0))

  // Sections must not overlap, counting all their recorded passes. The earlier one wins.
  const extents = []
  const sections = []
  for (const candidate of candidates) {
    const extent = sectionExtent(timeline, candidate.from, candidate.to)
    if (extents.some((other) => !isBefore(extent.to, other.from) && !isBefore(other.to, extent.from))) {
      continue
    }

    extents.push(extent)
    sections.push(candidate.section)
  }

  return sections
}

// Warp markers used to reference measures by index before they used numberings.
function convertWarpMarkers(layers, timeline, legacyMeasures, oldMarkers) {
  const markers = []
  for (const old of oldMarkers) {
    if (!old || typeof old.time !== "number" || !isFinite(old.time)) {
      continue
    }

    const value = typeof old.measure === "number"
      ? (legacyMeasures[old.measure] ? legacyMeasures[old.measure].value : String(old.measure))
      : old.measure
    const position = layers.positions.get(String(value))
    if (position === undefined || position >= timeline.length) {
      continue
    }

    markers.push({ position: position, marker: { measure: timeline[position].measure, occurrence: timeline[position].occurrence, time: old.time } })
  }

  markers.sort((a, b) => a.position - b.position || a.marker.time - b.marker.time)

  // Times must strictly increase in timeline order and every position has at most one anchor.
  const kept = []
  for (const entry of markers) {
    const previous = kept[kept.length - 1]
    if (previous && (previous.position === entry.position || previous.marker.time >= entry.marker.time)) {
      continue
    }

    kept.push(entry)
  }

  return kept.map((entry) => entry.marker)
}

function migrateSong(app, record, stats) {
  const legacyMeasures = sortLegacyMeasures(asArray(readJson(record, "measures", [])).filter((measure) => measure && typeof measure === "object"))
  const events = readJson(record, "events", {})
  const oldWarpMarkers = asArray(readJson(record, "warpMarkers", []))
  const unnumberedBoxes = asArray(readJson(record, "unnumberedBoxes", []))

  const isMidi = record.getString("midiFile") !== ""
  if (isMidi && record.getString("jsonFile") === "") {
    console.log(`[songs layers] MIDI song ${record.id} has no beat map, converting its measures like an audio song.`)
  }

  const layers = isMidi && record.getString("jsonFile") !== ""
    ? buildMidiLayers(readBeatMap(app, record), legacyMeasures)
    : buildAudioLayers(legacyMeasures)
  const timeline = expandRecording(layers.measures, layers.spans)

  const oldMarkers = asArray(events && events.markers)
  const oldVamps = asArray(events && events.vamps)
  const markers = convertMarkers(layers, timeline, oldMarkers)
  const sections = convertVamps(layers, timeline, oldVamps)
  const warpMarkers = isMidi ? [] : convertWarpMarkers(layers, timeline, legacyMeasures, oldWarpMarkers)

  stats.songs++
  stats.droppedMarkers += oldMarkers.length - markers.length
  stats.droppedVamps += oldVamps.length - sections.length
  stats.droppedWarpMarkers += oldWarpMarkers.length - warpMarkers.length
  if (oldMarkers.length !== markers.length || oldVamps.length !== sections.length || oldWarpMarkers.length !== warpMarkers.length) {
    console.log(`[songs layers] ${record.id}: dropped ${oldMarkers.length - markers.length} markers, ${oldVamps.length - sections.length} vamps, ${oldWarpMarkers.length - warpMarkers.length} warp markers that no longer resolve`)
  }

  updateSong(app, record.id, {
    score: { measures: layers.measures, unnumberedBoxes: unnumberedBoxes },
    recording: { spans: layers.spans, warpMarkers: warpMarkers },
    arrangement: { markers: markers, sections: sections, segue: !!(events && events.segue) },
  })
}

// ── Down: back to the old fields ─────────────────────────────────────────────────────────────

function restoreSong(app, record) {
  const score = readJson(record, "score", {})
  const recording = readJson(record, "recording", {})
  const arrangement = readJson(record, "arrangement", {})

  const measures = asArray(score.measures)
  const byId = new Map(measures.map((measure) => [measure.id, measure]))
  const spans = asArray(recording.spans).filter((span) => byId.has(span.from) && byId.has(span.to))
  const timeline = expandRecording(measures, spans)
  const position = (location) => timeline.findIndex((entry) => entry.measure === location.measure && entry.occurrence === (location.occurrence || 1))
  const reference = (location) => [byId.get(location.measure).label, location.beat]

  // The old vamp end is the beat after the section's last beat.
  const endReference = (location) => {
    const measure = byId.get(location.measure)
    if (location.beat + 1 < measure.beats) {
      return [measure.label, location.beat + 1]
    }

    const next = timeline[position(location) + 1]
    return next ? [byId.get(next.measure).label, 0] : [measure.label, measure.beats]
  }

  const markers = asArray(arrangement.markers)
    .filter((marker) => marker && marker.at && byId.has(marker.at.measure))
    .map((marker) => ({ type: "marker", start: reference(marker.at), marker: marker.text }))

  // Cuts and repeats did not exist before. Zero iterations is how the old format plays until released.
  const vamps = asArray(arrangement.sections)
    .filter((section) => section && section.kind === "vamp" && byId.has(section.from.measure) && byId.has(section.to.measure))
    .map((section) => ({
      type: "vamp",
      start: reference(section.from),
      end: endReference(section.to),
      iterations: 0,
      out: section.out,
      vocals: section.vocals,
    }))

  // The old format anchors each measure once, so later occurrences are lost.
  const warpMarkers = asArray(recording.warpMarkers)
    .filter((marker) => byId.has(marker.measure) && (marker.occurrence || 1) === 1)
    .map((marker) => ({ measure: byId.get(marker.measure).label, time: marker.time }))
    .sort((a, b) => a.time - b.time)

  updateSong(app, record.id, {
    measures: measures.map((measure) => {
      const old = { value: measure.label, beats: measure.beats }
      if (measure.layout) {
        old.layout = measure.layout
      }

      return old
    }),
    events: { markers: markers, vamps: vamps, segue: !!arrangement.segue },
    warpMarkers: warpMarkers,
    unnumberedBoxes: asArray(score.unnumberedBoxes),
  })
}

migrate((app) => {
  const collection = app.findCollectionByNameOrId(SONGS)
  for (const field of LAYER_FIELDS) {
    collection.fields.add(jsonField(field.id, field.name))
  }

  app.save(collection)

  const stats = { songs: 0, droppedMarkers: 0, droppedVamps: 0, droppedWarpMarkers: 0 }
  for (const record of app.findAllRecords(SONGS)) {
    migrateSong(app, record, stats)
  }

  console.log(`[songs layers] converted ${stats.songs} songs, dropped ${stats.droppedMarkers} markers, ${stats.droppedVamps} vamps and ${stats.droppedWarpMarkers} warp markers`)

  const updated = app.findCollectionByNameOrId(SONGS)
  for (const field of LEGACY_FIELDS) {
    updated.fields.removeById(field.id)
  }

  return app.save(updated)
}, (app) => {
  const collection = app.findCollectionByNameOrId(SONGS)
  for (const field of LEGACY_FIELDS) {
    collection.fields.addAt(field.index, jsonField(field.id, field.name))
  }

  app.save(collection)

  for (const record of app.findAllRecords(SONGS)) {
    restoreSong(app, record)
  }

  const updated = app.findCollectionByNameOrId(SONGS)
  for (const field of LAYER_FIELDS) {
    updated.fields.removeById(field.id)
  }

  return app.save(updated)
})
