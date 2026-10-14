/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // remove field
  collection.fields.removeById("relation3136074139")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1906970480",
    "hidden": false,
    "id": "relation3136074139",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "songs",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
