/**************************************************************************** */
// Firebase dummy data and utility functions
/**************************************************************************** */

/**
 * Dummy data Users
 * id description: u0 --> u = user, 0 = ID
 */
const users = [
  {
    id: "u0",
    name: "admin",
    password: "admin",
    email: "admin@admin.de",
    color: "#FF7A00",
  },
  {
    id: "u1",
    name: "Team Member",
    password: "teamMember",
    email: "team@example.com",
    color: "#29ABE2",
  },
];

/**
 * Dummy data Contacts
 * id description: c0 --> c = contact, 0 = ID
 */
const contacts = [
  {
    id: "c0",
    name: "Anna Schmidt",
    email: "anna.schmidt@example.com",
    phone: "+49 170 1234567",
    color: "#FF7A00",
  },
  {
    id: "c1",
    name: "Max Meyer",
    email: "max.meyer@example.com",
    phone: "+49 171 7654321",
    color: "#29ABE2",
  },
  {
    id: "c2",
    name: "Julia Klein",
    email: "julia.klein@example.com",
    phone: "+49 172 1112233",
    color: "#FF5EB3",
  },
];

/**
 * Dummy data Tasks
 * id description: t0 --> t = task, 0 = ID
 */
const tasks = [
  {
    id: "t0",
    title: "User Onboarding planen",
    description: "Texte und Screens für das Join Onboarding erstellen.",
    category: "Design",
    priority: "high",
    dueDate: "2026-01-10",
    status: "todo",
    assignedContactIds: ["c0", "c1"],
    createdBy: "u0",
    createdAt: "2026-01-02T08:00:00.000Z",
  },
  {
    id: "t1",
    title: "Drag & Drop für Board",
    description:
      "Drag & Drop Funktionalität für Kanban-Spalten implementieren.",
    category: "Technical Task",
    priority: "medium",
    dueDate: "2026-01-12",
    status: "in-progress",
    assignedContactIds: ["c1"],
    createdBy: "u0",
    createdAt: "2026-01-02T08:10:00.000Z",
  },
  {
    id: "t2",
    title: "Contacts CRUD fertigstellen",
    description: "Kontakte anlegen, bearbeiten und löschen inkl. Validierung.",
    category: "Technical Task",
    priority: "low",
    dueDate: "2026-01-15",
    status: "await-feedback",
    assignedContactIds: ["c2"],
    createdBy: "u1",
    createdAt: "2026-01-02T08:20:00.000Z",
  },
  {
    id: "t3",
    title: "Summary KPIs anzeigen",
    description:
      "Anzahl Tasks pro Status und nächste Deadlines auf Summary-Seite.",
    category: "Task",
    priority: "high",
    dueDate: "2026-01-18",
    status: "done",
    assignedContactIds: ["c0"],
    createdBy: "u1",
    createdAt: "2026-01-01T12:00:00.000Z",
  },
];

const BASE_URL =
  "https://remotestorage-67778-default-rtdb.europe-west1.firebasedatabase.app/";

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
    console.log(response);
    console.log(`Error (${response.status}): ${text || response.statusText}`);
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
 * @param {{method?: string, data?: any, headers?: Object}} options - Request options
 * @returns {Promise<any|null>} Response data or null
 */
async function firebaseRequest(
  path = "",
  { method = "GET", data, headers } = {}
) {
  const url = `${BASE_URL}${path}.json`;
  const requestOptions = createRequestOptions(method, data, headers);

  try {
    const response = await fetch(url, requestOptions);
    return await processFirebaseResponse(response);
  } catch (err) {
    console.log(`Network error: ${err.message}`);
    return null;
  }
}

/**
 * Uploads data to the specified Firebase path.
 * @param {string} path - Target path relative to database root.
 * @param {Object} data - Data to store.
 * @returns {Promise<Object>} Server response as JSON.
 */
async function uploadData(path = "", data = {}) {
  return firebaseRequest(path, { method: "PUT", data });
}

/**
 * Uploads the predefined tasks to Firebase.
 * @returns {Promise<void>}
 */
function uploadTasks() {
  return uploadData("tasks", tasks);
}

/**
 * Uploads the predefined contacts to Firebase.
 * @returns {Promise<void>}
 */
function uploadContacts() {
  return uploadData("contacts", contacts);
}

/**
 * Uploads the predefined users to Firebase.
 * @returns {Promise<void>}
 */
function uploadUsers() {
  return uploadData("users", users);
}

/**
 * Uploads all dummy data (users, contacts, tasks) to Firebase.
 * @returns {Promise<void>}
 */
async function uploadAllData() {
  await uploadUsers();
  await uploadContacts();
  await uploadTasks();
}

/**
 * Retrieves data from Firebase.
 * @param {string} path - Path relative to database root.
 * @returns {Promise<Object>} Received JSON data.
 */
async function getData(path = "") {
  return firebaseRequest(path, { method: "GET" });
}

/**
 * Fetches all tasks and logs them to console.
 * @returns {Promise<void>}
 */
async function fetchAndLogAllData() {
  const tasks = await getData("tasks");
  console.log("Tasks:");
  console.table(tasks);
  const contacts = await getData("contacts");
  console.log("Contacts:");
  console.table(contacts);
  const users = await getData("users");
  console.log("Users:");
  console.table(users);
}

/**
 * Deletes data from a Firebase path.
 * @param {string} path - Path relative to database root.
 * @returns {Promise<any>} Server response.
 */
async function deleteData(path = "") {
  return firebaseRequest(path, { method: "DELETE" });
}

/**
 * Determines data type based on ID.
 * @param {string} id - Element ID
 * @returns {string|null} Data type or null for invalid ID
 */
function determineDataTypeFromId(id) {
  if (!id || typeof id !== "string") {
    console.error("A valid ID must be provided");
    return null;
  }

  if (id.startsWith("t")) return "tasks";
  if (id.startsWith("c")) return "contacts";

  console.error("ID must start with 't' (Task) or 'c' (Contact)");
  return null;
}

/**
 * Searches for element index in data array by ID.
 * @param {Array} dataArray - Data array
 * @param {string} id - Searched ID
 * @returns {number} Index or -1 if not found
 */
function findElementIndex(dataArray, id) {
  for (let i = 0; i < dataArray.length; i++) {
    if (dataArray[i] && dataArray[i].id === id) {
      return i;
    }
  }
  return -1;
}

/**
 * Removes element from data array and uploads updated data.
 * @param {string} dataType - Data type (tasks/contacts)
 * @param {Array} dataArray - Data array
 * @param {number} elementIndex - Index of element to delete
 * @param {string} id - Element ID
 * @returns {Promise<boolean>} Success of operation
 */
async function removeElementAndUpdate(dataType, dataArray, elementIndex, id) {
  dataArray.splice(elementIndex, 1);
  await uploadData(dataType, dataArray);

  console.log(`${dataType.slice(0, -1)} with ID '${id}' successfully deleted`);

  const updatedData = await getData(dataType);
  console.table(updatedData);

  return true;
}

/**
 * Searches and deletes a task or contact by ID.
 * @param {string} id - ID of element to delete
 * @returns {Promise<boolean>} true if successfully deleted
 */
async function deleteById(id) {
  const dataType = determineDataTypeFromId(id);
  if (!dataType) return false;

  try {
    const data = await getData(dataType);
    if (!data) {
      console.error(`No ${dataType} found`);
      return false;
    }

    const dataArray = Object.values(data);
    const elementIndex = findElementIndex(dataArray, id);

    if (elementIndex === -1) {
      console.error(`${dataType.slice(0, -1)} with ID '${id}' not found`);
      return false;
    }

    return await removeElementAndUpdate(dataType, dataArray, elementIndex, id);
  } catch (error) {
    console.error("Error during deletion:", error);
    return false;
  }
}

/**
 * Deletes a task by ID.
 * @param {string} taskId - ID of task to delete (e.g. "t0")
 * @returns {Promise<boolean>} true if successfully deleted
 */
async function deleteTaskById(taskId) {
  return await deleteById(taskId);
}

/**
 * Deletes a contact by ID.
 * @param {string} contactId - ID of contact to delete (e.g. "c0")
 * @returns {Promise<boolean>} true if successfully deleted
 */
async function deleteContactById(contactId) {
  return await deleteById(contactId);
}

/**************************************************************************** */

// User management
/**
 * Reads user data from HTML form.
 * @returns {{username: string, password: string}|null} User data or null
 */
function getUserCredentialsFromForm() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Bitte beide Felder ausfüllen!");
    return null;
  }

  return { username, password };
}

/**
 * Searches for user in Firebase data.
 * @param {Array} users - User array
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {boolean} true if user found
 */
function findUserInData(users, username, password) {
  for (const user of users) {
    if (user.name === username && user.password === password) {
      return true;
    }
  }
  return false;
}

/**
 * Validates a user with data from HTML form.
 * @returns {Promise<void>}
 */
async function validateUserForm() {
  const credentials = getUserCredentialsFromForm();
  if (!credentials) return;

  try {
    const users = await getData("users");
    const isValid = findUserInData(
      users,
      credentials.username,
      credentials.password
    );

    if (isValid) {
      console.log("User validated");
      alert("Benutzer validiert");
    } else {
      console.log("Username or password incorrect");
      alert("Benutzername oder Passwort falsch");
    }
  } catch (error) {
    console.error("Error during validation:", error);
    alert("Fehler bei der Validierung: " + error.message);
  }
}
