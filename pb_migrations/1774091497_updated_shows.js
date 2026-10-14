/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\n@request.auth.id = @request.body.permission.owner",
    "deleteRule": "@request.auth.id != \"\" &&\n@request.auth.id = permission.owner"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\n@request.body.permission.owner = @request.auth.id",
    "deleteRule": null
  }, collection)

  return app.save(collection)
})
