/// <reference path="../pb_data/types.d.ts" />

// Lists everyone with explicit access to a show. Available to the owner and editors.
routerAdd("GET", "/api/choirchaos/shows/{id}/members", (e) => {
  const members = require(`${__hooks}/members.js`);
  const show = members.findShow(e.app, e.request.pathValue("id"));
  const role = members.getRole(show, e.auth.id);

  if (role !== "owner" && role !== "editor") {
    throw new ForbiddenError("Only the owner and editors can see who has access.");
  }

  return e.json(200, members.listMembers(e.app, show, e.auth.id));
}, $apis.requireAuth("users"));

// Gives an existing user access to a show by email address. Only the owner may do this, matching
// the shows update rule. Changing roles and removing people goes through the regular update API.
routerAdd("POST", "/api/choirchaos/shows/{id}/members", (e) => {
  const members = require(`${__hooks}/members.js`);
  const show = members.findShow(e.app, e.request.pathValue("id"));

  if (members.getRole(show, e.auth.id) !== "owner") {
    throw new ForbiddenError("Only the owner can add people.");
  }

  const body = e.requestInfo().body;
  members.addMember(e.app, show, String(body.email ?? ""), String(body.role ?? ""));

  return e.json(200, members.listMembers(e.app, show, e.auth.id));
}, $apis.requireAuth("users"));
