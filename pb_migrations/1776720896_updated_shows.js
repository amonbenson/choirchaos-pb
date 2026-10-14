/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "deleteRule": "// Must be logged in and be the owner\n@request.auth.id != \"\" &&\n@request.auth.id = owner"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "deleteRule": null
  }, collection)

  return app.save(collection)
})
