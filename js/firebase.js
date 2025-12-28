const sampleTasks = {
    task1: {
        title: "Marketing-Review",
        content: "Präsentation final prüfen",
        date: "2025-01-05",
        state: "todo",
        isOpen: true,
        isClosed: false
    },
    task2: {
        title: "Bugfix Sprint",
        content: "Login-Fehler analysieren",
        date: "2025-01-08",
        state: "inProgress",
        isOpen: true,
        isClosed: false
    },
    task3: {
        title: "Release Notes",
        content: "Version 2.3 dokumentieren",
        date: "2025-01-10",
        state: "done",
        isOpen: false,
        isClosed: true
    }
};


const BASE_URL ="https://remotestorage-67778-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Lädt Daten auf den angegebenen Firebase-Pfad.
 * @param {string} path - Zielpfad relativ zur Datenbankwurzel.
 * @param {Object} data - Zu speichernde Daten.
 * @returns {Promise<Object>} Serverantwort als JSON.
 */
async function uploadData(path = "", data = {}) {
    const response = await fetch(`${BASE_URL}${path}.json`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        console.log(response);
        throw new Error("Fehler beim Hochladen der Daten.");    
    }

    return await response.json();
}

/**
 * Lädt die vordefinierten Beispielaufgaben in Firebase.
 * @returns {Promise<void>}
 */
function uploadSampleTasks() {
    uploadData("tasks", sampleTasks);
}

/**
 * Ruft Daten von Firebase ab.
 * @param {string} path - Pfad relativ zur Datenbankwurzel.
 * @returns {Promise<Object>} Empfangene JSON-Daten.
 */
async function getData(path = "") {
    const response = await fetch(`${BASE_URL}${path}.json`);
    if (!response.ok) {
        console.log(response);
        throw new Error("Fehler beim Abrufen der Daten.");
    }

    return await response.json();
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
    const response = await fetch(`${BASE_URL}${path}.json`, {
        method: "DELETE"
    });

    if (!response.ok) {
        console.log(response);
        throw new Error("Fehler beim Löschen der Daten.");
    }

    return await response.json();
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