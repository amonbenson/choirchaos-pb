/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "file254316151",
    "maxSelect": 1,
    "maxSize": 0,
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

  // remove field
  collection.fields.removeById("file254316151")

  return app.save(collection)
})
