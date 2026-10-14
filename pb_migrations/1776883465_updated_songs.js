/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "json3414674270",
    "maxSize": 0,
    "name": "warpMarkers",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "json3414674270",
    "maxSize": 0,
    "name": "warpMap",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
