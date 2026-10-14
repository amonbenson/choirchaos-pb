/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2810007471")

  // update collection data
  unmarshal({
    "viewRule": "// Backwards compatibility during development: allow guests to view shows if the know their ID\n@request.auth.id = \"\" || @request.auth.id != \"\""
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
