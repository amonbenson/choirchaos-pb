/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "createRule": "// Must be logged in\n@request.auth.id != \"\" &&\n\n// The owner field must be set to the creating user\n@request.body.owner = @request.auth.id",
    "updateRule": "// Must be logged in\n@request.auth.id != \"\" &&\n\n// Owner field must never be changed by anyone\n@request.body.owner:isset = false &&\n\n// Either the requester is the owner (can change anything except owner)...\n(\n  @request.auth.id = owner ||\n\n  // ...or an editor, but only if they are NOT touching permission fields\n  (\n    editors.id ?= @request.auth.id &&\n    @request.body.editors:isset = false &&\n    @request.body.viewers:isset = false &&\n    @request.body.visibility:isset = false\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "createRule": null,
    "updateRule": null
  }, collection)

  return app.save(collection)
})
