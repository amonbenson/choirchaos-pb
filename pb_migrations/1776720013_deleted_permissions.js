/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\" &&\n@request.auth.id = @request.body.owner",
    "deleteRule": "@request.auth.id != \"\" &&\n@request.auth.id = owner",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
        "hidden": false,
        "id": "select1368277760",
        "maxSelect": 1,
        "name": "visibility",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "public",
          "members",
          "private"
        ]
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_3709660955",
    "indexes": [],
    "listRule": null,
    "name": "permissions",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != \"\" &&\n@request.auth.id = owner",
    "viewRule": "visibility = \"public\" ||\n(\n  @request.auth.id != \"\" &&\n  (\n    visibility = \"members\" ||\n    @request.auth.id = owner ||\n    @request.auth.id ?= editors ||\n    @request.auth.id ?= viewers\n  )\n)"
  });

  return app.save(collection);
})
