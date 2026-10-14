/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "file254316151",
    "maxSelect": 99,
    "maxSize": 1000000000,
    "mimeTypes": [
      "audio/mpeg"
    ],
    "name": "audioFiles",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "file254316151",
    "maxSelect": 99,
    "maxSize": 100000000,
    "mimeTypes": [
      "audio/mpeg"
    ],
    "name": "audioFiles",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
