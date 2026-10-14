/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.id != \"\" &&\n\n// Requester must be owner or editor of the current show\n(\n  @request.auth.id = show.owner ||\n  show.editors.id ?= @request.auth.id\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "deleteRule": null
  }, collection)

  return app.save(collection)
})
