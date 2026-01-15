/**
 * Firebase service for data persistence (centralized Firebase access)
 * Replaces localStorage usage throughout the application
 */

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
    return null;
  }
}

/**
 * Gets current user from session storage (temporary fallback)
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
 * Sets current user in session storage (temporary fallback)
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

// Collection-specific helper functions
const UserService = {
/**
 * @returns {*}
 */
  getAll: () => loadData(COLLECTIONS.USERS),
/**
 * @param {*} id
 * @returns {*}
 */
  get: (id) => loadData(COLLECTIONS.USERS, id),
/**
 * @param {*} userData
 * @returns {*}
 */
  create: (userData) => saveData(COLLECTIONS.USERS, userData, userData.id),
/**
 * @param {*} id
 * @param {*} userData
 * @returns {*}
 */
  update: (id, userData) => updateData(COLLECTIONS.USERS, id, userData),
/**
 * @param {*} id
 * @returns {*}
 */
  delete: (id) => deleteData(COLLECTIONS.USERS, id),
};

const TaskService = {
/**
 * @returns {*}
 */
  getAll: () => loadData(COLLECTIONS.TASKS),
/**
 * @param {*} id
 * @returns {*}
 */
  get: (id) => loadData(COLLECTIONS.TASKS, id),
/**
 * @param {*} taskData
 * @returns {*}
 */
  create: (taskData) => saveData(COLLECTIONS.TASKS, taskData, taskData.id),
/**
 * @param {*} id
 * @param {*} taskData
 * @returns {*}
 */
  update: (id, taskData) => updateData(COLLECTIONS.TASKS, id, taskData),
/**
 * @param {*} id
 * @returns {*}
 */
  delete: (id) => deleteData(COLLECTIONS.TASKS, id),
};

const ContactService = {
/**
 * @returns {*}
 */
  getAll: () => loadData(COLLECTIONS.CONTACTS),
/**
 * @param {*} id
 * @returns {*}
 */
  get: (id) => loadData(COLLECTIONS.CONTACTS, id),
/**
 * @param {*} contactData
 * @returns {*}
 */
  create: (contactData) =>
    saveData(COLLECTIONS.CONTACTS, contactData, contactData.id),
/**
 * @param {*} id
 * @param {*} contactData
 * @returns {*}
 */
  update: (id, contactData) =>
    updateData(COLLECTIONS.CONTACTS, id, contactData),
/**
 * @param {*} id
 * @returns {*}
 */
  delete: (id) => deleteData(COLLECTIONS.CONTACTS, id),
};

// Expose to global scope for console access and debugging
window.firebase = {
  UserService,
  TaskService,
  ContactService,
  getCurrentUser,
  setCurrentUser,
};

/**
 * DEVELOPMENT HELPER: Load dummy data into Firebase 
 * will be deleted later 
 * Usage: Open browser console and run: loadDummyDataToFirebase()
 */
// TODO: delete and remove this function before production release
window.loadDummyDataToFirebase = async function () {
  try {
    console.log("🔄 Loading dummy data to Firebase...");

    // Dummy Users
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
        name: "Michael Schmidt",
        pw: "password123",
        email: "michael.schmidt@example.com",
        color: "#29ABE2",
      },
      {
        id: "u2",
        name: "Sarah Müller",
        pw: "password123",
        email: "sarah.mueller@example.com",
        color: "#FF5EB3",
      },
      {
        id: "u3",
        name: "Thomas Weber",
        pw: "password123",
        email: "thomas.weber@example.com",
        color: "#9B51E0",
      },
      {
        id: "u4",
        name: "Julia Fischer",
        pw: "password123",
        email: "julia.fischer@example.com",
        color: "#2ECC71",
      },
    ];

    // Dummy Contacts
    const contacts = [
      {
        id: "c0",
        name: "Alexander König",
        email: "alexander.koenig@example.com",
        phone: "+49 170 1234567",
        color: "#FF7A00",
      },
      {
        id: "c1",
        name: "Beatrice Bauer",
        email: "beatrice.bauer@example.com",
        phone: "+49 170 1234568",
        color: "#29ABE2",
      },
      {
        id: "c2",
        name: "Christian Christensen",
        email: "christian.christensen@example.com",
        phone: "+49 170 1234569",
        color: "#FF5EB3",
      },
      {
        id: "c3",
        name: "Diana Dietrich",
        email: "diana.dietrich@example.com",
        phone: "+49 170 1234570",
        color: "#9B51E0",
      },
      {
        id: "c4",
        name: "Elias Eberhardt",
        email: "elias.eberhardt@example.com",
        phone: "+49 170 1234571",
        color: "#2ECC71",
      },
      {
        id: "c5",
        name: "Franziska Friedrich",
        email: "franziska.friedrich@example.com",
        phone: "+49 170 1234572",
        color: "#F2994A",
      },
      {
        id: "c6",
        name: "Gregor Gross",
        email: "gregor.gross@example.com",
        phone: "+49 170 1234573",
        color: "#EB5757",
      },
      {
        id: "c7",
        name: "Helena Hartmann",
        email: "helena.hartmann@example.com",
        phone: "+49 170 1234574",
        color: "#56CCF2",
      },
      {
        id: "c8",
        name: "Ivan Ivanov",
        email: "ivan.ivanov@example.com",
        phone: "+49 170 1234575",
        color: "#6FCF97",
      },
      {
        id: "c9",
        name: "Josephine Jacobs",
        email: "josephine.jacobs@example.com",
        phone: "+49 170 1234576",
        color: "#BB6BD9",
      },
      {
        id: "c10",
        name: "Klaus Krause",
        email: "klaus.krause@example.com",
        phone: "+49 170 1234577",
        color: "#1ABC9C",
      },
      {
        id: "c11",
        name: "Laura Lehmann",
        email: "laura.lehmann@example.com",
        phone: "+49 170 1234578",
        color: "#3498DB",
      },
      {
        id: "c12",
        name: "Martin Mayer",
        email: "martin.mayer@example.com",
        phone: "+49 170 1234579",
        color: "#9B59B6",
      },
      {
        id: "c13",
        name: "Natalie Neumann",
        email: "natalie.neumann@example.com",
        phone: "+49 170 1234580",
        color: "#E74C3C",
      },
      {
        id: "c14",
        name: "Oliver Obermann",
        email: "oliver.obermann@example.com",
        phone: "+49 170 1234581",
        color: "#F39C12",
      },
    ];

    // Dummy Tasks - Website Redesign Project
    const tasks = [
      {
        id: "t0",
        title: "Homepage Design Mockups erstellen",
        description: "Detaillierte Design-Mockups für die neue Homepage mit allen Komponenten.",
        category: "Design",
        priority: "high",
        dueDate: "2026-01-20",
        status: "in-progress",
        assignedContactIds: ["c0", "c1"],
        createdBy: "u0",
        createdAt: "2026-01-08T08:00:00.000Z",
        subtasks: [
          { title: "Header und Hero-Section entwerfen", done: true },
          { title: "Feature Cards designen", done: true },
          { title: "Design Review durchführen", done: false },
        ],
      },
      {
        id: "t1",
        title: "Navigation HTML umsetzen",
        description: "Responsive Navigation Bar in HTML/CSS implementieren.",
        category: "Technical Task",
        priority: "high",
        dueDate: "2026-01-18",
        status: "in-progress",
        assignedContactIds: ["c2"],
        createdBy: "u1",
        createdAt: "2026-01-08T09:00:00.000Z",
        subtasks: [
          { title: "HTML-Struktur aufbauen", done: true },
          { title: "CSS Styling durchführen", done: true },
          { title: "Mobile-Responsive testen", done: false },
        ],
      },
      {
        id: "t2",
        title: "Form Validierung implementieren",
        description: "Client-seitige Validierung für Kontaktformular mit Fehlerbehandlung.",
        category: "Technical Task",
        priority: "medium",
        dueDate: "2026-01-22",
        status: "todo",
        assignedContactIds: ["c3"],
        createdBy: "u2",
        createdAt: "2026-01-08T10:00:00.000Z",
        subtasks: [
          { title: "Validierungsregeln definieren", done: false },
          { title: "Error-Messages implementieren", done: false },
          { title: "Styling der Fehler", done: false },
        ],
      },
      {
        id: "t3",
        title: "Farbpalette festlegen",
        description: "Zentrale Farbpalette und CSS-Variablen für das gesamte Design.",
        category: "Design",
        priority: "high",
        dueDate: "2026-01-16",
        status: "done",
        assignedContactIds: ["c1"],
        createdBy: "u0",
        createdAt: "2026-01-07T14:00:00.000Z",
        subtasks: [
          { title: "Farben auswählen", done: true },
          { title: "CSS-Variablen erstellen", done: true },
          { title: "Accessibility-Check durchführen", done: true },
        ],
      },
      {
        id: "t4",
        title: "Footer-Section gestalten",
        description: "Design und Implementierung des Website-Footers.",
        category: "Design",
        priority: "medium",
        dueDate: "2026-01-25",
        status: "todo",
        assignedContactIds: ["c4"],
        createdBy: "u3",
        createdAt: "2026-01-08T11:00:00.000Z",
        subtasks: [
          { title: "Footer-Layout planen", done: false },
          { title: "Links und Struktur aufbauen", done: false },
        ],
      },
      {
        id: "t5",
        title: "Button-Komponente entwickeln",
        description: "Wiederverwendbare Button-Komponente mit verschiedenen Varianten.",
        category: "Technical Task",
        priority: "medium",
        dueDate: "2026-01-20",
        status: "in-progress",
        assignedContactIds: ["c5"],
        createdBy: "u1",
        createdAt: "2026-01-08T12:00:00.000Z",
        subtasks: [
          { title: "Button-Typen definieren", done: true },
          { title: "Hover-States implementieren", done: true },
          { title: "Accessibility-Attribute hinzufügen", done: false },
        ],
      },
      {
        id: "t6",
        title: "Bilder optimieren und komprimieren",
        description: "Alle Bilder für Web optimieren und verschiedene Größen erstellen.",
        category: "Optimization",
        priority: "low",
        dueDate: "2026-02-01",
        status: "todo",
        assignedContactIds: ["c6"],
        createdBy: "u2",
        createdAt: "2026-01-09T08:00:00.000Z",
        subtasks: [
          { title: "Bilder komprimieren", done: false },
          { title: "WebP-Format erstellen", done: false },
          { title: "Responsive Images umsetzen", done: false },
        ],
      },
      {
        id: "t7",
        title: "Schriftarten integrieren",
        description: "Google Fonts oder Custom Fonts in die Website einbinden.",
        category: "Design",
        priority: "medium",
        dueDate: "2026-01-19",
        status: "todo",
        assignedContactIds: ["c7"],
        createdBy: "u3",
        createdAt: "2026-01-09T09:00:00.000Z",
        subtasks: [
          { title: "Fonts auswählen", done: false },
          { title: "Font-Files einbinden", done: false },
          { title: "Font-Loading optimieren", done: false },
        ],
      },
      {
        id: "t8",
        title: "Responsive Breakpoints testen",
        description: "Testen der Website auf verschiedenen Bildschirmgrößen.",
        category: "Testing",
        priority: "high",
        dueDate: "2026-01-24",
        status: "await-feedback",
        assignedContactIds: ["c8"],
        createdBy: "u4",
        createdAt: "2026-01-09T10:00:00.000Z",
        subtasks: [
          { title: "Desktop (1920px) testen", done: true },
          { title: "Tablet (768px) testen", done: true },
          { title: "Mobile (375px) testen", done: false },
        ],
      },
      {
        id: "t9",
        title: "Accessibility Audit durchführen",
        description: "WCAG 2.1 Compliance überprüfen und Fehler beheben.",
        category: "Quality",
        priority: "medium",
        dueDate: "2026-01-28",
        status: "todo",
        assignedContactIds: ["c9"],
        createdBy: "u1",
        createdAt: "2026-01-09T11:00:00.000Z",
        subtasks: [
          { title: "ARIA-Labels prüfen", done: false },
          { title: "Keyboard Navigation testen", done: false },
          { title: "Kontrastverhältnisse überprüfen", done: false },
        ],
      },
      {
        id: "t10",
        title: "SEO Meta-Tags hinzufügen",
        description: "Meta-Beschreibungen und OpenGraph Tags für alle Seiten.",
        category: "Technical Task",
        priority: "medium",
        dueDate: "2026-01-23",
        status: "todo",
        assignedContactIds: ["c10"],
        createdBy: "u2",
        createdAt: "2026-01-09T12:00:00.000Z",
        subtasks: [
          { title: "Meta-Tags pro Seite erstellen", done: false },
          { title: "OpenGraph Images vorbereiten", done: false },
        ],
      },
      {
        id: "t11",
        title: "Mobile Navigation Hamburger-Menü",
        description: "Hamburger-Menü für mobile Geräte implementieren.",
        category: "Technical Task",
        priority: "high",
        dueDate: "2026-01-21",
        status: "in-progress",
        assignedContactIds: ["c11"],
        createdBy: "u3",
        createdAt: "2026-01-09T13:00:00.000Z",
        subtasks: [
          { title: "HTML-Struktur erstellen", done: true },
          { title: "JavaScript Interaktivität", done: true },
          { title: "Animation hinzufügen", done: false },
        ],
      },
      {
        id: "t12",
        title: "Loading-Animation implementieren",
        description: "Smooth Loading-Animation beim Seitenwechsel.",
        category: "Design",
        priority: "low",
        dueDate: "2026-02-05",
        status: "todo",
        assignedContactIds: ["c12"],
        createdBy: "u4",
        createdAt: "2026-01-10T08:00:00.000Z",
        subtasks: [
          { title: "Animation-Design erstellen", done: false },
          { title: "CSS Keyframes implementieren", done: false },
        ],
      },
      {
        id: "t13",
        title: "Browser-Kompatibilität testen",
        description: "Testen auf Chrome, Firefox, Safari und Edge.",
        category: "Testing",
        priority: "high",
        dueDate: "2026-01-27",
        status: "todo",
        assignedContactIds: ["c13"],
        createdBy: "u1",
        createdAt: "2026-01-10T09:00:00.000Z",
        subtasks: [
          { title: "Chrome testen", done: false },
          { title: "Firefox testen", done: false },
          { title: "Safari und Edge testen", done: false },
        ],
      },
      {
        id: "t14",
        title: "Performance Optimierung - Lazy Loading",
        description: "Bilder und Komponenten mit Lazy Loading optimieren.",
        category: "Optimization",
        priority: "medium",
        dueDate: "2026-02-02",
        status: "todo",
        assignedContactIds: ["c14"],
        createdBy: "u2",
        createdAt: "2026-01-10T10:00:00.000Z",
        subtasks: [
          { title: "Lazy Loading implementieren", done: false },
          { title: "Lighthouse Audit durchführen", done: false },
        ],
      },
    ];

    // Upload to Firebase
    for (const user of users) await UserService.create(user);
    for (const contact of contacts) await ContactService.create(contact);
    for (const task of tasks) await TaskService.create(task);

    console.log("✅ Dummy data loaded successfully!");
    console.log("📊 Data:", {
      users: users.length,
      contacts: contacts.length,
      tasks: tasks.length,
    });
  } catch (error) {
    console.error("❌ Error loading dummy data:", error);
  }
};

/**
 * DEVELOPMENT HELPER: Clear all Firebase data
 * Usage: Open browser console and run: clearFirebaseData()
 */
window.clearFirebaseData = async function () {
  try {
    console.log("🔄 Clearing Firebase data...");

    const collections = ["users", "contacts", "tasks"];
    for (const collection of collections) {
      await firebaseRequest(collection, { method: "DELETE" });
    }

    console.log("✅ Firebase data cleared!");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
  }
};

/**
 * DEVELOPMENT HELPER: Show all Firebase data as table in console
 * Usage: Open browser console and run: showFirebaseDataTable()
 */
window.showFirebaseDataTable = async function () {
  try {
    console.log("📊 Loading all Firebase data...");

    // Load all collections
    const users = await UserService.getAll();
    const contacts = await ContactService.getAll();
    const tasks = await TaskService.getAll();

    // Convert Firebase objects to arrays if needed
    const usersArray = users
      ? Array.isArray(users)
        ? users
        : Object.values(users)
      : [];
    const contactsArray = contacts
      ? Array.isArray(contacts)
        ? contacts
        : Object.values(contacts)
      : [];
    const tasksArray = tasks
      ? Array.isArray(tasks)
        ? tasks
        : Object.values(tasks)
      : [];

    // Display as console tables
    console.group("🔥 Firebase Data Overview");

    if (usersArray.length > 0) {
      console.log("👥 Users:");
      console.table(usersArray);
    } else {
      console.log("👥 Users: No data");
    }

    if (contactsArray.length > 0) {
      console.log("📱 Contacts:");
      console.table(contactsArray);
    } else {
      console.log("📱 Contacts: No data");
    }

    if (tasksArray.length > 0) {
      console.log("📋 Tasks:");
      console.table(tasksArray);
    } else {
      console.log("📋 Tasks: No data");
    }

    console.groupEnd();

    // Summary
    const total = usersArray.length + contactsArray.length + tasksArray.length;
    console.log(
      `📈 Summary: ${total} total entries (${usersArray.length} users, ${contactsArray.length} contacts, ${tasksArray.length} tasks)`
    );
  } catch (error) {
    console.error("❌ Error loading Firebase data:", error);
  }
};
