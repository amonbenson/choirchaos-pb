/// <reference path="../pb_data/types.d.ts" />

// Converts every stored recording to Ogg Opus and builds the songs' audio index. This takes a few
// seconds per recording, so the first start after deploying it takes minutes. There is no down
// migration: the MP3s are gone, and the earlier migration's down only restores the schema.
migrate((app) => {
  // Migrations have no __hooks; PocketBase looks for pb_hooks next to pb_data by default.
  const { convertStoredAudio } = require($filepath.join(app.dataDir(), "..", "pb_hooks", "audio.js"))

  const songs = app.findAllRecords("songs")
  let converted = 0
  songs.forEach((song) => {
    if (convertStoredAudio(app, song)) {
      converted++
      app.logger().info("Converted song recordings to Opus", "song", song.id, "title", song.getString("title"))
    }
  })

  app.logger().info("Converted song recordings to Opus", "songs", converted)
}, () => {})
