const UserService = {
  getAll: () => loadData(COLLECTIONS.USERS),
  get: (id) => loadData(COLLECTIONS.USERS, id),
  create: (userData) => saveData(COLLECTIONS.USERS, userData, userData.id),
  update: (id, userData) => updateData(COLLECTIONS.USERS, id, userData),
  delete: (id) => deleteData(COLLECTIONS.USERS, id),
};

const TaskService = {
  getAll: () => loadData(COLLECTIONS.TASKS),
  get: (id) => loadData(COLLECTIONS.TASKS, id),
  create: (taskData) => saveData(COLLECTIONS.TASKS, taskData, taskData.id),
  update: (id, taskData) => updateData(COLLECTIONS.TASKS, id, taskData),
  delete: (id) => deleteData(COLLECTIONS.TASKS, id),
};

const ContactService = {
  getAll: () => loadData(COLLECTIONS.CONTACTS),
  get: (id) => loadData(COLLECTIONS.CONTACTS, id),
  create: (contactData) =>
    saveData(COLLECTIONS.CONTACTS, contactData, contactData.id),
  update: (id, contactData) =>
    updateData(COLLECTIONS.CONTACTS, id, contactData),
  delete: (id) => deleteData(COLLECTIONS.CONTACTS, id),
};

/**
 * Creates request options for Firebase requests.
 * @param {string} method - HTTP method
 * @param {any} data - Data to send
 * @param {Object} headers - Additional headers
 * @returns {Object} Request options
 */
function createRequestOptions(method, data, headers) {
  const options = {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
  };

  if (data !== undefined && method !== "GET" && method !== "DELETE") {
    options.body = JSON.stringify(data);
  }

  return options;
}

/**
 * Handles response processing for Firebase requests.
 * @param {Response} response - Fetch Response object
 * @returns {Promise<any|null>} Processed response or null
 */
async function processFirebaseResponse(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(
      `Firebase Error (${response.status}): ${text || response.statusText}`
    );
    showErrorToast("Connection error. Try again.");
    return null;
  }

  const contentType = response.headers.get("Content-Type") || "";
  return contentType.includes("application/json")
    ? await response.json()
    : null;
}

/**
 * Central Firebase request with shared error handling.
 * @param {string} path - Firebase path
 * @param {Object} options - Request options
 * @returns {Promise<any|null>} Response data or null
 */
async function firebaseRequest(path, { method = "GET", data, headers } = {}) {
  const url = `${API_CONFIG.BASE_URL}/${path}.json`;
  const requestOptions = createRequestOptions(method, data, headers);

  try {
    const response = await fetch(url, requestOptions);
    return await processFirebaseResponse(response);
  } catch (error) {
    console.error(`Firebase request failed for ${path}:`, error);
    showErrorToast("Connection error. Try again.");
    return null;
  }
}

/**
 * Gets current user from session storage (temporary fallback).
 * @returns {Object|null} Current user or null
 */
function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

/**
 * Sets current user in session storage (temporary fallback).
 * @param {Object} user - User object to store
 */
function setCurrentUser(user) {
  if (user) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(CURRENT_USER_KEY);
  }
}

/**
 * Loads data from Firebase.
 * @param {string} collection - Collection name
 * @param {string} id - Optional document ID
 * @returns {Promise<any|null>} Data or null
 */
async function loadData(collection, id = null) {
  const path = id ? `${collection}/${id}` : collection;
  return await firebaseRequest(path);
}

/**
 * Saves data to Firebase.
 * @param {string} collection - Collection name
 * @param {any} data - Data to save
 * @param {string} id - Optional document ID
 * @returns {Promise<any|null>} Response or null
 */
async function saveData(collection, data, id = null) {
  const path = id ? `${collection}/${id}` : collection;
  const method = id ? "PUT" : "POST";
  return await firebaseRequest(path, { method, data });
}

/**
 * Updates data in Firebase.
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @param {any} data - Data to update
 * @returns {Promise<any|null>} Response or null
 */
async function updateData(collection, id, data) {
  return await firebaseRequest(`${collection}/${id}`, { method: "PUT", data });
}

/**
 * Deletes data from Firebase.
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<any|null>} Response or null
 */
async function deleteData(collection, id) {
  return await firebaseRequest(`${collection}/${id}`, { method: "DELETE" });
}

window.firebase = {
  UserService,
  TaskService,
  ContactService,
  getCurrentUser,
  setCurrentUser,
};


