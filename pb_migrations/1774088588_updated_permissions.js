/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update collection data
  unmarshal({
    "viewRule": "@request.auth.id != \"\" &&\n(\n  public = true ||\n  @request.auth.id = owner ||\n  @request.auth.id ?= editors ||\n  @request.auth.id ?= viewers\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709660955")

  // update collection data
  unmarshal({
    "viewRule": "@request.auth.id != \"\" &&\n(\n  public = true ||\n  @request.auth.id = owner.id ||\n  @request.auth.id ?= editors.id ||\n  @request.auth.id ?= viewers.id\n)"
  }, collection)

  return app.save(collection)
})
