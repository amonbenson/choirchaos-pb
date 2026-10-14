/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id != \"\" &&\n@request.auth.id = owner"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id != \"\" &&\n@request.auth.id = owner &&\n@request.body.owner:changed = false"
  }, collection)

  return app.save(collection)
})
