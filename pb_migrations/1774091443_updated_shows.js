/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id != \"\" &&\n(\n  permission.owner = @request.auth.id ||\n  permission.editors ?= @request.auth.id\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "updateRule": ""
  }, collection)

  return app.save(collection)
})
