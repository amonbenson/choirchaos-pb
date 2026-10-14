/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "listRule": "permission.visibility = \"public\" ||\n(\n  @request.auth.id != \"\" &&\n  (\n    permission.visibility = \"members\" ||\n    permission.owner = @request.auth.id ||\n    permission.editors.id ?= @request.auth.id ||\n    permission.viewers.id ?= @request.auth.id\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "listRule": null
  }, collection)

  return app.save(collection)
})
