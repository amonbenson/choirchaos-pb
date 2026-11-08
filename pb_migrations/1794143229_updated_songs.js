/// <reference path="../pb_data/types.d.ts" />

// Recordings are stored as Ogg Opus with a seek index per song, so the player can stream them.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  collection.fields.getByName("audioFiles").mimeTypes = ["audio/ogg", "audio/opus"]
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "file2937415066",
    "maxSelect": 1,
    "maxSize": 10000000,
    "mimeTypes": ["application/json"],
    "name": "audioIndex",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file",
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  collection.fields.getByName("audioFiles").mimeTypes = ["audio/mpeg"]
  collection.fields.removeById("file2937415066")

  return app.save(collection)
})
