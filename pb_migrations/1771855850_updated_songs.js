/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "updateRule": null
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "updateRule": ""
  }, collection)

  return app.save(collection)
})
