/// <reference path="../pb_data/types.d.ts" />

// Converts every stored recording to Ogg Opus and builds the songs' audio index. This takes a few
// seconds per recording, so the first start after deploying it takes minutes, during which
// PocketBase does not serve yet. Progress goes to stdout, since the app logger only writes to the
// database once the server runs. Killing it rolls the database back; the recordings converted so
// far stay in storage unused and are overwritten by the next run. There is no down migration: the
// MP3s are gone, and the earlier migration's down only restores the schema.
migrate((app) => {
  // Migrations have no __hooks; PocketBase looks for pb_hooks next to pb_data by default.
  const { convertStoredAudio } = require($filepath.join(app.dataDir(), "..", "pb_hooks", "audio.js"))

  const songs = app.findAllRecords("songs").filter(song => song.getStringSlice("audioFiles").length > 0)
  console.log(`Converting the recordings of ${songs.length} songs to Opus. This takes a few seconds per recording; do not stop the server.`)

  songs.forEach((song, i) => {
    const recordings = song.getStringSlice("audioFiles").length
    if (convertStoredAudio(app, song)) {
      console.log(`Converted song ${i + 1}/${songs.length} (${recordings} recordings): ${song.getString("title")}`)
    }
  })

  console.log("Converted all recordings to Opus.")
}, () => {})
