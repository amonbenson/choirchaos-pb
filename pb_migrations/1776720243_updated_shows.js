/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // add field
  collection.fields.addAt(3, new Field({
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

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation813065320",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "editors",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(5, new Field({
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

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select1368277760",
    "maxSelect": 1,
    "name": "visibility",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "private",
      "unlisted",
      "public"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // remove field
  collection.fields.removeById("relation3479234172")

  // remove field
  collection.fields.removeById("relation813065320")

  // remove field
  collection.fields.removeById("relation800476")

  // remove field
  collection.fields.removeById("select1368277760")

  return app.save(collection)
})
