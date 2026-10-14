/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "file254316151",
    "maxSelect": 1,
    "maxSize": 10000000,
    "mimeTypes": [
      "audio/mpeg"
    ],
    "name": "audioFile",
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
    "maxSelect": 1,
    "maxSize": 10,
    "mimeTypes": [
      "audio/mpeg"
    ],
    "name": "audioFile",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
