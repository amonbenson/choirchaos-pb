/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation800476",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "viewers",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation800476",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "viewers",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
