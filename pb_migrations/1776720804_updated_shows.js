/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "viewRule": "// Public or unlisted: anyone can view directly\nvisibility = \"public\" ||\nvisibility = \"unlisted\" ||\n\n// Private: only owner, editors, or viewers\n(\n  visibility = \"private\" &&\n  (\n    @request.auth.id = owner ||\n    editors.id ?= @request.auth.id ||\n    viewers.id ?= @request.auth.id\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
