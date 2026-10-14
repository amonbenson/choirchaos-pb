/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "file4193945286",
    "maxSelect": 1,
    "maxSize": 50000000,
    "mimeTypes": [
      "application/pdf"
    ],
    "name": "pdfFile",
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
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "file4193945286",
    "maxSelect": 1,
    "maxSize": 50000000000,
    "mimeTypes": [
      "application/pdf"
    ],
    "name": "pdfFile",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
