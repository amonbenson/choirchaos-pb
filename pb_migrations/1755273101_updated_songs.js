/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2810007471",
    "hidden": false,
    "id": "relation839833857",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "show",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // remove field
  collection.fields.removeById("relation839833857")

  return app.save(collection)
})
