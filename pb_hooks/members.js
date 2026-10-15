// Shared helpers for members.pb.js. PocketBase runs each route handler in its own isolated
// scope, so handlers load this module with require() instead of sharing top-level functions.

const ROLES = ["editor", "viewer"];

function findShow(app, showId) {
  try {
    return app.findRecordById("shows", showId);
  } catch {
    throw new NotFoundError("Show not found.");
  }
}

function getRole(show, userId) {
  if (show.getString("owner") === userId) {
    return "owner";
  }

  if (show.getStringSlice("editors").includes(userId)) {
    return "editor";
  }

  if (show.getStringSlice("viewers").includes(userId)) {
    return "viewer";
  }

  return undefined;
}

// Users may only read their own record, so members are listed here on behalf of the client.
// Email addresses are only shown to the owner, who is the only one allowed to add people.
function listMembers(app, show, requesterId) {
  const includeEmail = getRole(show, requesterId) === "owner";
  const entries = [
    [show.getString("owner"), "owner"],
    ...show.getStringSlice("editors").map(id => [id, "editor"]),
    ...show.getStringSlice("viewers").map(id => [id, "viewer"]),
  ];

  const users = app.findRecordsByIds("users", entries.map(([id]) => id));
  const usersById = {};
  users.forEach((user) => {
    usersById[user.id] = user;
  });

  return entries
    .filter(([id]) => usersById[id])
    .map(([id, role]) => {
      const user = usersById[id];
      return {
        id,
        role,
        name: user.getString("name"),
        avatar: user.getString("avatar"),
        email: includeEmail ? user.email() : "",
      };
    });
}

function addMember(app, show, email, role) {
  if (!ROLES.includes(role)) {
    throw new BadRequestError("Role must be 'editor' or 'viewer'.");
  }

  let user;
  try {
    user = app.findAuthRecordByEmail("users", email.trim());
  } catch {
    throw new NotFoundError("There is no account with this email address.");
  }

  if (user.id === show.getString("owner")) {
    throw new BadRequestError("The owner already has access.");
  }

  const editors = show.getStringSlice("editors").filter(id => id !== user.id);
  const viewers = show.getStringSlice("viewers").filter(id => id !== user.id);
  (role === "editor" ? editors : viewers).push(user.id);

  show.set("editors", editors);
  show.set("viewers", viewers);
  app.save(show);
}

module.exports = { findShow, getRole, listMembers, addMember };
