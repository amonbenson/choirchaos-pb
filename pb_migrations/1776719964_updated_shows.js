/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\n@request.auth.id = @request.body.permission.owner",
    "deleteRule": "@request.auth.id != \"\" &&\n@request.auth.id = permission.owner",
    "listRule": "permission.visibility = \"public\" ||\n(\n  @request.auth.id != \"\" &&\n  (\n    permission.visibility = \"members\" ||\n    permission.owner = @request.auth.id ||\n    permission.editors.id ?= @request.auth.id ||\n    permission.viewers.id ?= @request.auth.id\n  )\n)",
    "updateRule": "@request.auth.id != \"\" &&\n(\n  permission.owner = @request.auth.id ||\n  permission.editors ?= @request.auth.id\n)",
    "viewRule": "// Allow guests to view CFA (dev compatibility)\nid = \"ufdze5y4yx1yror\" || (\n  permission.visibility = \"public\" ||\n  (\n    @request.auth.id != \"\" &&\n    (\n      permission.visibility = \"members\" ||\n      permission.owner = @request.auth.id ||\n      permission.editors ?= @request.auth.id ||\n      permission.viewers ?= @request.auth.id\n    )\n  )\n)"
  }, collection)

  return app.save(collection)
})
