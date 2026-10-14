/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\n@request.auth.id = @request.body.owner",
    "viewRule": "visibility = \"public\" ||\n(\n  @request.auth.id != \"\" &&\n  (\n    visibility = \"members\" ||\n    @request.auth.id = owner ||\n    @request.auth.id ?= editors ||\n    @request.auth.id ?= viewers\n  )\n)"
  }, collection)

  // remove field
  collection.fields.removeById("bool3523658193")

  // add field
  collection.fields.addAt(4, new Field({
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
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\n@request.auth.id = owner",
    "viewRule": "@request.auth.id != \"\" &&\n(\n  public = true ||\n  @request.auth.id = owner ||\n  @request.auth.id ?= editors ||\n  @request.auth.id ?= viewers\n)"
  }, collection)

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool3523658193",
    "name": "public",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // remove field
  collection.fields.removeById("select1368277760")

  return app.save(collection)
})
