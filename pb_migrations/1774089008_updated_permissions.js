/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3479234172",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "owner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation813065320",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "editors",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

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

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool3523658193",
    "name": "public",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3479234172",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "owner",
    "presentable": true,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation813065320",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "editors",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "relation"
  }))

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

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool3523658193",
    "name": "public",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
