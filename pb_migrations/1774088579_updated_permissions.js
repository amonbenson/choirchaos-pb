/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\n@request.auth.id = owner",
    "deleteRule": "@request.auth.id != \"\" &&\n@request.auth.id = owner"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\nowner.id = @request.auth.id",
    "deleteRule": "@request.auth.id != \"\" &&\n@request.auth.id = owner.id"
  }, collection)

  return app.save(collection)
})
