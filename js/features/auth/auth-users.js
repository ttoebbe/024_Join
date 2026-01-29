/**
 * Saves the current user.
 * @param {Object} user
 */
async function saveCurrentUser(user) {
  setCurrentUser(user);
}

/**
 * Loads users from storage.
 * @returns {Promise<Array>}
 */
async function loadUsers() {
  try {
    const users = await UserService.getAll();
    return users ? Object.values(users) : [];
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}
