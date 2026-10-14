/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "viewRule": "// Identical logic to List/Search rule:\n// The linked show is public or unlisted: anyone can see the songs\nshow.visibility = \"public\" ||\nshow.visibility = \"unlisted\" ||\n\n// The linked show is private: only owner, editors, or viewers of that show\n(\n  show.visibility = \"private\" &&\n  (\n    @request.auth.id = show.owner ||\n    show.editors.id ?= @request.auth.id ||\n    show.viewers.id ?= @request.auth.id\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1906970480")

  // update collection data
  unmarshal({
    "viewRule": "// Identical logic to list\nshow.visibility = \"public\" ||\nshow.visibility = \"unlisted\" ||\n\n(\n  show.visibility = \"private\" &&\n  (\n    @request.auth.id = show.owner ||\n    show.editors.id ?= @request.auth.id ||\n    show.viewers.id ?= @request.auth.id\n  )\n)"
  }, collection)

  return app.save(collection)
})
