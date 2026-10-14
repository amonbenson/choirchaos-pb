/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3709660955",
    "hidden": false,
    "id": "relation3762918058",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "permission",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // remove field
  collection.fields.removeById("relation3762918058")

  return app.save(collection)
})
