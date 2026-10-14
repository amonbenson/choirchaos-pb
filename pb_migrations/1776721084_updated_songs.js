/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "createRule": "// Must be logged in\n@request.auth.id != \"\" &&\n\n// The show field must be provided\n@request.body.show != \"\" &&\n\n// Requester must be the owner or an editor of the target show\n(\n  @request.body.show.owner = @request.auth.id ||\n  @request.body.show.editors.id ?= @request.auth.id\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "createRule": null
  }, collection)

  return app.save(collection)
})
