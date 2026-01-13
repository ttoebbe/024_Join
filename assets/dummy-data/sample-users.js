/**
 * Dummy data Users
 * id description: u0 --> u = user, 0 = ID
 */
const users = [
  {
    id: "u0",
    name: "admin",
    pw: "admin",
    email: "admin@admin.de",
    color: "#FF7A00",
  },
  {
    id: "u1",
    name: "Team Member",
    pw: "teamMember",
    email: "team@example.com",
    color: "#29ABE2",
  },
];



/**aktuelle angemeldeter User */
let currentUserName = null;
let currentUserId = null;

/** Boolean, "istGuest oder nicht" */
let isGuest = true;
