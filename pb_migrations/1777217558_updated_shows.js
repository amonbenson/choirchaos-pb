/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "listRule": "// Public: visible to everyone\nvisibility = \"public\" ||\n\n// Private: only owner, editors, or viewers can see it\n(\n  visibility = \"private\" &&\n  @request.auth.id != \"\" &&\n  (\n    @request.auth.id = owner ||\n    editors.id ?= @request.auth.id ||\n    viewers.id ?= @request.auth.id\n  )\n)",
    "viewRule": "// Public or unlisted: anyone can view directly\nvisibility = \"public\" ||\nvisibility = \"unlisted\" ||\n\n// Private: only owner, editors, or viewers\n(\n  visibility = \"private\" &&\n  @request.auth.id != \"\" &&\n  (\n    @request.auth.id = owner ||\n    editors.id ?= @request.auth.id ||\n    viewers.id ?= @request.auth.id\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "listRule": "// Public: visible to everyone\nvisibility = \"public\" ||\n\n// Private: only owner, editors, or viewers can see it\n(\n  visibility = \"private\" &&\n  (\n    @request.auth.id = owner ||\n    editors.id ?= @request.auth.id // ||\n    // viewers.id ?= @request.auth.id\n  )\n)",
    "viewRule": "// Public or unlisted: anyone can view directly\nvisibility = \"public\" ||\nvisibility = \"unlisted\" ||\n\n// Private: only owner, editors, or viewers\n(\n  visibility = \"private\" &&\n  (\n    @request.auth.id = owner ||\n    editors.id ?= @request.auth.id ||\n    viewers.id ?= @request.auth.id\n  )\n)"
  }, collection)

  return app.save(collection)
})
