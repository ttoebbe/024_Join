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
 * Erstellt Request-Optionen für Firebase-Anfragen.
 * @param {string} method - HTTP-Methode
 * @param {any} data - Zu sendende Daten
 * @param {Object} headers - Zusätzliche Header
 * @returns {Object} Request-Optionen
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
 * Behandelt Response-Verarbeitung für Firebase-Anfragen.
 * @param {Response} response - Fetch Response-Objekt
 * @returns {Promise<any|null>} Verarbeitete Antwort oder null
 */
async function processFirebaseResponse(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.log(response);
    console.log(`Fehler (${response.status}): ${text || response.statusText}`);
    return null;
  }

  const contentType = response.headers.get("Content-Type") || "";
  return contentType.includes("application/json") ? await response.json() : null;
}

/**
 * Zentraler Firebase-Request mit gemeinsamer Fehlerbehandlung.
 * @param {string} path - Firebase-Pfad
 * @param {{method?: string, data?: any, headers?: Object}} options - Request-Optionen
 * @returns {Promise<any|null>} Response-Daten oder null
 */
async function firebaseRequest(path = "", { method = "GET", data, headers } = {}) {
  const url = `${BASE_URL}${path}.json`;
  const requestOptions = createRequestOptions(method, data, headers);

  try {
    const response = await fetch(url, requestOptions);
    return await processFirebaseResponse(response);
  } catch (err) {
    console.log(`Netzwerkfehler: ${err.message}`);
    return null;
  }
}

/**
 * Lädt Daten auf den angegebenen Firebase-Pfad.
 * @param {string} path - Zielpfad relativ zur Datenbankwurzel.
 * @param {Object} data - Zu speichernde Daten.
 * @returns {Promise<Object>} Serverantwort als JSON.
 */
async function uploadData(path = "", data = {}) {
  return firebaseRequest(path, { method: "PUT", data });
}

/**
 * Lädt die vordefinierten Tasks in Firebase.
 * @returns {Promise<void>}
 */
function uploadTasks() {
  return uploadData("tasks", tasks);
}

/**
 * Lädt die vordefinierten Kontakte in Firebase.
 * @returns {Promise<void>}
 */
function uploadContacts() {
  return uploadData("contacts", contacts);
}

/**
 * Lädt die vordefinierten Benutzer in Firebase.
 * @returns {Promise<void>}
 */
function uploadUsers() {
  return uploadData("users", users);
}

/**
 * Lädt alle Dummy-Daten (users, contacts, tasks) in Firebase.
 * @returns {Promise<void>}
 */
async function uploadAllData() {
  await uploadUsers();
  await uploadContacts();
  await uploadTasks();
}

/**
 * Ruft Daten von Firebase ab.
 * @param {string} path - Pfad relativ zur Datenbankwurzel.
 * @returns {Promise<Object>} Empfangene JSON-Daten.
 */
async function getData(path = "") {
  return firebaseRequest(path, { method: "GET" });
}

/**
 * Holt alle Tasks und schreibt sie in die Konsole.
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
 * Löscht Daten von einem Firebase-Pfad.
 * @param {string} path - Pfad relativ zur Datenbankwurzel.
 * @returns {Promise<any>} Serverantwort.
 */
async function deleteData(path = "") {
  return firebaseRequest(path, { method: "DELETE" });
}

/**
 * Ermittelt den Datentyp anhand der ID.
 * @param {string} id - Element-ID
 * @returns {string|null} Datentyp oder null bei ungültiger ID
 */
function determineDataTypeFromId(id) {
  if (!id || typeof id !== "string") {
    console.error("Eine gültige ID muss angegeben werden");
    return null;
  }

  if (id.startsWith("t")) return "tasks";
  if (id.startsWith("c")) return "contacts";

  console.error("ID muss mit 't' (Task) oder 'c' (Contact) beginnen");
  return null;
}

/**
 * Sucht Index eines Elements im Datenarray anhand der ID.
 * @param {Array} dataArray - Array der Daten
 * @param {string} id - Gesuchte ID
 * @returns {number} Index oder -1 wenn nicht gefunden
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
 * Entfernt Element aus Datenarray und lädt aktualisierte Daten hoch.
 * @param {string} dataType - Datentyp (tasks/contacts)
 * @param {Array} dataArray - Datenarray
 * @param {number} elementIndex - Index des zu löschenden Elements
 * @param {string} id - Element-ID
 * @returns {Promise<boolean>} Erfolg der Operation
 */
async function removeElementAndUpdate(dataType, dataArray, elementIndex, id) {
  dataArray.splice(elementIndex, 1);
  await uploadData(dataType, dataArray);

  console.log(`${dataType.slice(0, -1)} mit ID '${id}' erfolgreich gelöscht`);

  const updatedData = await getData(dataType);
  console.table(updatedData);

  return true;
}

/**
 * Sucht und löscht einen Task oder Contact anhand der ID.
 * @param {string} id - Die ID des zu löschenden Elements
 * @returns {Promise<boolean>} true wenn erfolgreich gelöscht
 */
async function deleteById(id) {
  const dataType = determineDataTypeFromId(id);
  if (!dataType) return false;

  try {
    const data = await getData(dataType);
    if (!data) {
      console.error(`Keine ${dataType} gefunden`);
      return false;
    }

    const dataArray = Object.values(data);
    const elementIndex = findElementIndex(dataArray, id);

    if (elementIndex === -1) {
      console.error(`${dataType.slice(0, -1)} mit ID '${id}' nicht gefunden`);
      return false;
    }

    return await removeElementAndUpdate(dataType, dataArray, elementIndex, id);
  } catch (error) {
    console.error("Fehler beim Löschen:", error);
    return false;
  }
}

/**
 * Löscht einen Task anhand der ID.
 * @param {string} taskId - Die ID des zu löschenden Tasks (z.B. "t0")
 * @returns {Promise<boolean>} true wenn erfolgreich gelöscht
 */
async function deleteTaskById(taskId) {
  return await deleteById(taskId);
}

/**
 * Löscht einen Contact anhand der ID.
 * @param {string} contactId - Die ID des zu löschenden Contacts (z.B. "c0")
 * @returns {Promise<boolean>} true wenn erfolgreich gelöscht
 */
async function deleteContactById(contactId) {
  return await deleteById(contactId);
}

/**************************************************************************** */

// Benutzerverwaltung
/**
 * Liest Benutzerdaten aus HTML-Formular.
 * @returns {{username: string, password: string}|null} Benutzerdaten oder null
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
 * Sucht Benutzer in Firebase-Daten.
 * @param {Array} users - Benutzer-Array
 * @param {string} username - Benutzername
 * @param {string} password - Passwort
 * @returns {boolean} true wenn Benutzer gefunden
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
 * Validiert einen Benutzer mit Daten aus dem HTML-Formular.
 * @returns {Promise<void>}
 */
async function validateUserForm() {
  const credentials = getUserCredentialsFromForm();
  if (!credentials) return;

  try {
    const users = await getData("users");
    const isValid = findUserInData(users, credentials.username, credentials.password);

    if (isValid) {
      console.log("Benutzer validiert");
      alert("Benutzer validiert");
    } else {
      console.log("Benutzername oder Passwort falsch");
      alert("Benutzername oder Passwort falsch");
    }
  } catch (error) {
    console.error("Fehler bei der Validierung:", error);
    alert("Fehler bei der Validierung: " + error.message);
  }
}
