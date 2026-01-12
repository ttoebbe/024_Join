/**
 * Firebase service for data persistence (centralized Firebase access)
 * Replaces localStorage usage throughout the application
 */

import { API_CONFIG, COLLECTIONS, CURRENT_USER_KEY } from './constants.js';

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
    console.error(`Firebase Error (${response.status}): ${text || response.statusText}`);
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
export function getCurrentUser() {
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
export function setCurrentUser(user) {
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
export async function loadData(collection, id = null) {
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
export async function saveData(collection, data, id = null) {
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
export async function updateData(collection, id, data) {
  return await firebaseRequest(`${collection}/${id}`, { method: "PUT", data });
}

/**
 * Deletes data from Firebase.
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<any|null>} Response or null
 */
export async function deleteData(collection, id) {
  return await firebaseRequest(`${collection}/${id}`, { method: "DELETE" });
}

// Collection-specific helper functions
export const UserService = {
  getAll: () => loadData(COLLECTIONS.USERS),
  get: (id) => loadData(COLLECTIONS.USERS, id),
  create: (userData) => saveData(COLLECTIONS.USERS, userData),
  update: (id, userData) => updateData(COLLECTIONS.USERS, id, userData),
  delete: (id) => deleteData(COLLECTIONS.USERS, id)
};

export const TaskService = {
  getAll: () => loadData(COLLECTIONS.TASKS),
  get: (id) => loadData(COLLECTIONS.TASKS, id),
  create: (taskData) => saveData(COLLECTIONS.TASKS, taskData),
  update: (id, taskData) => updateData(COLLECTIONS.TASKS, id, taskData),
  delete: (id) => deleteData(COLLECTIONS.TASKS, id)
};

export const ContactService = {
  getAll: () => loadData(COLLECTIONS.CONTACTS),
  get: (id) => loadData(COLLECTIONS.CONTACTS, id),
  create: (contactData) => saveData(COLLECTIONS.CONTACTS, contactData),
  update: (id, contactData) => updateData(COLLECTIONS.CONTACTS, id, contactData),
  delete: (id) => deleteData(COLLECTIONS.CONTACTS, id)
};

// Expose to global scope for console access and debugging
window.firebase = { UserService, TaskService, ContactService, getCurrentUser, setCurrentUser };

/**
 * DEVELOPMENT HELPER: Load dummy data into Firebase
 * Usage: Open browser console and run: loadDummyDataToFirebase()
 */
window.loadDummyDataToFirebase = async function() {
  try {
    console.log('🔄 Loading dummy data to Firebase...');
    
    // Dummy Users
    const users = [
      { id: "u0", name: "admin", password: "admin", email: "admin@admin.de", color: "#FF7A00" },
      { id: "u1", name: "Team Member", password: "teamMember", email: "team@example.com", color: "#29ABE2" }
    ];
    
    // Dummy Contacts  
    const contacts = [
      { id: "c0", name: "Donald Duck", email: "donald.duck@example.com", phone: "+49 170 0000001", color: "#FF7A00" },
      { id: "c1", name: "Daisy Duck", email: "daisy.duck@example.com", phone: "+49 170 0000002", color: "#29ABE2" },
      { id: "c2", name: "Dagobert Duck", email: "dagobert.duck@example.com", phone: "+49 170 0000003", color: "#FF5EB3" },
      { id: "c3", name: "Tick Duck", email: "tick.duck@example.com", phone: "+49 170 0000004", color: "#9B51E0" },
      { id: "c4", name: "Trick Duck", email: "trick.duck@example.com", phone: "+49 170 0000005", color: "#2ECC71" },
      { id: "c5", name: "Track Duck", email: "track.duck@example.com", phone: "+49 170 0000006", color: "#F2994A" },
      { id: "c6", name: "Gustav Gans", email: "gustav.gans@example.com", phone: "+49 170 0000007", color: "#EB5757" },
      { id: "c7", name: "Daniel DOsentrieb", email: "daniel.duesentrieb@example.com", phone: "+49 170 0000008", color: "#56CCF2" },
      { id: "c8", name: "Gitta Gans", email: "gitta.gans@example.com", phone: "+49 170 0000009", color: "#6FCF97" },
      { id: "c9", name: "Klaas Klever", email: "klaas.klever@example.com", phone: "+49 170 0000010", color: "#BB6BD9" },
      { id: "c10", name: "Mickey Mouse", email: "mickey.mouse@example.com", phone: "+49 170 0000011", color: "#1ABC9C" },
      { id: "c11", name: "Minnie Mouse", email: "minnie.mouse@example.com", phone: "+49 170 0000012", color: "#3498DB" },
      { id: "c12", name: "Goofy Goof", email: "goofy.goof@example.com", phone: "+49 170 0000013", color: "#9B59B6" }
    ];
    
    // Dummy Tasks
    const tasks = [
      { id: "t0", title: "User Onboarding planen", description: "Texte und Screens für das Join Onboarding erstellen.", category: "Design", priority: "high", dueDate: "2026-01-10", status: "todo", assignedContactIds: ["c0", "c1"], createdBy: "u0", createdAt: "2026-01-02T08:00:00.000Z", subtasks: [{ title: "Wireframes erstellen", done: true }, { title: "Texte schreiben", done: false }, { title: "Design reviewen", done: false }] },
      { id: "t1", title: "Drag & Drop für Board", description: "Drag & Drop Funktionalität für Kanban-Spalten implementieren.", category: "Technical Task", priority: "medium", dueDate: "2026-01-12", status: "in-progress", assignedContactIds: ["c1"], createdBy: "u0", createdAt: "2026-01-02T08:10:00.000Z", subtasks: [{ title: "Drag Events implementieren", done: true }, { title: "Drop Zones definieren", done: true }, { title: "Testing durchführen", done: false }] },
      { id: "t2", title: "Contacts CRUD fertigstellen", description: "Kontakte anlegen, bearbeiten und löschen inkl. Validierung.", category: "Technical Task", priority: "low", dueDate: "2026-01-15", status: "await-feedback", assignedContactIds: ["c2"], createdBy: "u1", createdAt: "2026-01-02T08:20:00.000Z", subtasks: [{ title: "Create Funktion", done: true }, { title: "Update Funktion", done: true }, { title: "Delete Funktion", done: true }, { title: "Validierung einbauen", done: false }] },
      { id: "t3", title: "Summary KPIs anzeigen", description: "Anzahl Tasks pro Status und nächste Deadlines auf Summary-Seite.", category: "Task", priority: "high", dueDate: "2026-01-18", status: "done", assignedContactIds: ["c0"], createdBy: "u1", createdAt: "2026-01-01T12:00:00.000Z", subtasks: [{ title: "KPI Komponente erstellen", done: true }, { title: "Daten aggregieren", done: true }, { title: "Styling anpassen", done: true }] },
      { id: "t4", title: "Login validation", description: "Add client-side validation for login form fields.", category: "Technical Task", priority: "medium", dueDate: "2026-01-11", status: "todo", assignedContactIds: ["c2"], createdBy: "u0", createdAt: "2026-01-03T09:00:00.000Z", subtasks: [{ title: "Email validation", done: false }, { title: "Password validation", done: false }] },
      { id: "t5", title: "Implement notifications", description: "Show in-app notifications for task updates.", category: "Feature", priority: "high", dueDate: "2026-01-20", status: "in-progress", assignedContactIds: ["c1", "c2"], createdBy: "u1", createdAt: "2026-01-03T10:15:00.000Z", subtasks: [{ title: "Notification component", done: true }, { title: "Event system", done: false }, { title: "Animation", done: false }] },
      { id: "t6", title: "Optimize images", description: "Compress and serve responsive images for performance.", category: "Optimization", priority: "low", dueDate: "2026-01-25", status: "todo", assignedContactIds: ["c0"], createdBy: "u0", createdAt: "2026-01-04T11:00:00.000Z", subtasks: [{ title: "Bilder komprimieren", done: false }, { title: "WebP Format erstellen", done: false }] },
      { id: "t7", title: "Accessibility audit", description: "Run basic accessibility checks and fix issues.", category: "Quality", priority: "medium", dueDate: "2026-01-22", status: "todo", assignedContactIds: ["c1"], createdBy: "u1", createdAt: "2026-01-04T12:00:00.000Z", subtasks: [{ title: "ARIA labels prüfen", done: false }, { title: "Keyboard navigation testen", done: false }, { title: "Contrast ratio checken", done: false }] },
      { id: "t8", title: "Add unit tests", description: "Write unit tests for storage utilities.", category: "Testing", priority: "medium", dueDate: "2026-01-30", status: "todo", assignedContactIds: ["c2"], createdBy: "u0", createdAt: "2026-01-04T13:30:00.000Z", subtasks: [{ title: "Test für getData", done: false }, { title: "Test für uploadData", done: false }, { title: "Test für deleteData", done: false }] },
      { id: "t9", title: "Design update header", description: "Refresh header styles and mobile behavior.", category: "Design", priority: "low", dueDate: "2026-02-01", status: "todo", assignedContactIds: ["c0", "c1"], createdBy: "u1", createdAt: "2026-01-05T08:00:00.000Z", subtasks: [] },
      { id: "t10", title: "Implement search", description: "Add search across tasks and contacts.", category: "Feature", priority: "high", dueDate: "2026-02-05", status: "todo", assignedContactIds: ["c1"], createdBy: "u0", createdAt: "2026-01-05T09:00:00.000Z", subtasks: [{ title: "Search input UI", done: false }, { title: "Filter Logik", done: false }, { title: "Highlight matches", done: false }] },
      { id: "t11", title: "Fix mobile layout", description: "Resolve overlapping elements on small screens.", category: "Bugfix", priority: "high", dueDate: "2026-01-14", status: "in-progress", assignedContactIds: ["c2"], createdBy: "u1", createdAt: "2026-01-05T10:30:00.000Z", subtasks: [{ title: "Navigation anpassen", done: true }, { title: "Cards responsive machen", done: false }] },
      { id: "t12", title: "Export tasks CSV", description: "Allow users to export task list as CSV.", category: "Feature", priority: "medium", dueDate: "2026-02-10", status: "todo", assignedContactIds: ["c0"], createdBy: "u0", createdAt: "2026-01-06T07:45:00.000Z", subtasks: [{ title: "CSV Generator Funktion", done: false }, { title: "Download Button", done: false }] },
      { id: "t13", title: "Email templates", description: "Create templates for automated emails.", category: "Task", priority: "low", dueDate: "2026-02-15", status: "todo", assignedContactIds: ["c1", "c2"], createdBy: "u1", createdAt: "2026-01-06T08:15:00.000Z", subtasks: [] },
      { id: "t14", title: "Refactor components", description: "Simplify shared components and props.", category: "Refactor", priority: "medium", dueDate: "2026-02-20", status: "todo", assignedContactIds: ["c0"], createdBy: "u0", createdAt: "2026-01-06T09:00:00.000Z", subtasks: [{ title: "Header component refactoren", done: false }, { title: "Card component vereinfachen", done: false }] },
      { id: "t15", title: "Improve onboarding copy", description: "Rewrite onboarding text for clarity.", category: "Content", priority: "low", dueDate: "2026-01-28", status: "await-feedback", assignedContactIds: ["c1"], createdBy: "u1", createdAt: "2026-01-06T10:00:00.000Z", subtasks: [{ title: "Texte überarbeiten", done: true }, { title: "Feedback einholen", done: false }] },
      { id: "t16", title: "Performance profiling", description: "Profile slow pages and identify bottlenecks.", category: "Optimization", priority: "high", dueDate: "2026-02-01", status: "todo", assignedContactIds: ["c2"], createdBy: "u0", createdAt: "2026-01-06T11:30:00.000Z", subtasks: [{ title: "Lighthouse Audit durchführen", done: false }, { title: "Bottlenecks identifizieren", done: false }, { title: "Optimierungen umsetzen", done: false }] },
      { id: "t17", title: "Add keyboard shortcuts", description: "Support shortcuts for common actions.", category: "Feature", priority: "low", dueDate: "2026-02-12", status: "todo", assignedContactIds: ["c0", "c1"], createdBy: "u1", createdAt: "2026-01-07T08:00:00.000Z", subtasks: [] },
      { id: "t18", title: "Localization review", description: "Review German translations for consistency.", category: "Quality", priority: "medium", dueDate: "2026-02-18", status: "todo", assignedContactIds: ["c2"], createdBy: "u0", createdAt: "2026-01-07T09:15:00.000Z", subtasks: [{ title: "Alle Texte durchgehen", done: false }, { title: "Inkonsistenzen korrigieren", done: false }] },
      { id: "t19", title: "Release checklist", description: "Prepare checklist for next release deployment.", category: "Task", priority: "high", dueDate: "2026-02-25", status: "todo", assignedContactIds: ["c0"], createdBy: "u1", createdAt: "2026-01-07T10:00:00.000Z", subtasks: [{ title: "Changelog erstellen", done: false }, { title: "Tests durchführen", done: false }, { title: "Deployment dokumentieren", done: false }] }
    ];
    
    // Upload to Firebase
    for (const user of users) await UserService.create(user);
    for (const contact of contacts) await ContactService.create(contact);  
    for (const task of tasks) await TaskService.create(task);
    
    console.log('✅ Dummy data loaded successfully!');
    console.log('📊 Data:', { users: users.length, contacts: contacts.length, tasks: tasks.length });
    
  } catch (error) {
    console.error('❌ Error loading dummy data:', error);
  }
};

/**
 * DEVELOPMENT HELPER: Clear all Firebase data
 * Usage: Open browser console and run: clearFirebaseData()
 */
window.clearFirebaseData = async function() {
  try {
    console.log('🔄 Clearing Firebase data...');
    
    const collections = ['users', 'contacts', 'tasks'];
    for (const collection of collections) {
      await firebaseRequest(collection, { method: 'DELETE' });
    }
    
    console.log('✅ Firebase data cleared!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};