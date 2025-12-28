const sampleTasks = {
  task1: {
    title: "Marketing-Review",
    content: "Präsentation final prüfen",
    date: "2025-01-05",
    state: "todo",
    isOpen: true,
    isClosed: false,
  },
  task2: {
    title: "Bugfix Sprint",
    content: "Login-Fehler analysieren",
    date: "2025-01-08",
    state: "inProgress",
    isOpen: true,
    isClosed: false,
  },
  task3: {
    title: "Release Notes",
    content: "Version 2.3 dokumentieren",
    date: "2025-01-10",
    state: "done",
    isOpen: false,
    isClosed: true,
  },
};

const userList = {
  user1: { name: "Thomas", password: "12345" },
  user2: {
    name: "Anna",
    password: "password",
  },
  user3: { name: "admin", password: "admin" },
};

const BASE_URL =
  "https://remotestorage-67778-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Zentraler Firebase-Request mit gemeinsamer Fehlerbehandlung.
 * @param {string} path
 * @param {{method?: string, data?: any, headers?: Object}} options
 * @returns {Promise<any|null>}
 */
async function firebaseRequest(
  path = "",
  { method = "GET", data, headers } = {}
) {
  const url = `${BASE_URL}${path}.json`;
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
  };

  // Nur bei schreibenden Methoden einen Body senden
  if (data !== undefined && method !== "GET" && method !== "DELETE") {
    opts.body = JSON.stringify(data);
  }

  let response;
  try {
    response = await fetch(url, opts);
  } catch (err) {
    throw new Error(`Netzwerkfehler: ${err.message}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.log(response);
    throw new Error(
      `Fehler (${response.status}): ${text || response.statusText}`
    );
  }

  const ct = response.headers.get("Content-Type") || ""; // Inhaltstyp prüfen und nur bei JSON parsen, andernfalls wird ein leerer String zurückgeben
  return ct.includes("application/json") ? await response.json() : null; // prüfen ob Inhaltstyp JSON ist, wenn ja, dann parsen, sonst null zurückgeben
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
 * Lädt die vordefinierten Beispielaufgaben in Firebase.
 * @returns {Promise<void>}
 */
function uploadSampleTasks() {
  return uploadData("tasks", sampleTasks);
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
 * Holt alle Beispielaufgaben und schreibt sie in die Konsole.
 * @returns {Promise<void>}
 */
async function fetchAndLogSampleTasks() {
  const tasks = await getData("tasks");
  console.table(tasks);
}

/**
 * Löscht Daten am angegebenen Firebase-Pfad.
 * @param {string} path - Pfad relativ zur Datenbankwurzel.
 * @returns {Promise<Object|null>} Firebase-Response oder null.
 */
async function deleteData(path = "") {
  return firebaseRequest(path, { method: "DELETE" });
}

/**
 * Entfernt task2 aus den Beispieldaten und prüft das Ergebnis.
 * @returns {Promise<void>}
 */
async function deleteSampleTask() {
  await deleteData("tasks/task2");
  const tasksAfterDeletion = await getData("tasks");
  console.table(tasksAfterDeletion);
}

// Benutzerverwaltung
/**
 * Lädt die vordefinierten Benutzer in Firebase.
 * @returns {Promise<void>}
 */

function uploadUserList() {
  return uploadData("users", userList);
}

/**
 * Validiert einen Benutzer mit Daten aus dem HTML-Formular.
 * @returns {Promise<void>}
 */
async function validateUserForm() {
  // Werte aus den Input-Feldern lesen
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Prüfen ob beide Felder ausgefüllt sind
  if (!username || !password) {
    alert("Bitte beide Felder ausfüllen!");
    return;
  }

  try {
    // Firebase-Daten abrufen
    const users = await getData("users");

    // Benutzer validieren
    for (const userId in users) {
      const user = users[userId];
      if (user.name === username && user.password === password) {
        console.log("Benutzer validiert");
        alert("Benutzer validiert");
        return;
      }
    }

    // Wenn kein passender Benutzer gefunden wurde
    console.log("Benutzername oder Passwort falsch");
    alert("Benutzername oder Passwort falsch");
  } catch (error) {
    console.error("Fehler bei der Validierung:", error);
    alert("Fehler bei der Validierung: " + error.message);
  }
}
