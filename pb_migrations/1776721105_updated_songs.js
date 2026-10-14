/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id != \"\" &&\n\n// Prevent re-parenting the song to a different show\n@request.body.show:isset = false &&\n\n// Requester must be owner or editor of the current show\n(\n  @request.auth.id = show.owner ||\n  show.editors.id ?= @request.auth.id\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "updateRule": null
  }, collection)

  return app.save(collection)
})
