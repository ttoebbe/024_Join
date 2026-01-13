/**
 * Contacts Data Management Module
 * Handles Firebase operations, data normalization, validation, and initialization
 */

// Global state
let currentEditId = null;
let contacts = [];

/**
 * Initializes the contact list once the page is ready.
 */
async function initContactsPage() {
  const listElement = document.querySelector(".contact-list");
  if (!listElement) {
    return;
  }
  await loadContactsFromFirebase();
  renderContactList(listElement, getContactData());
  setupAddContactOverlay(listElement);
  setupHeaderBackButton();
}

/**
 * Returns available contacts from the dataset.
 * @returns {Array<Object>}
 */
function getContactData() {
  if (typeof contacts !== "undefined" && Array.isArray(contacts)) {
    return contacts;
  }
  console.warn("Keine Kontaktdaten verfugbar.");
  return [];
}

/**
 * Loads contacts from Firebase and normalizes them into an array.
 * @returns {Promise<Array<Object>>}
 */
async function loadContactsFromFirebase() {
  try {
    const data = await ContactService.getAll();
    contacts = normalizeContacts(data);
    return contacts;
  } catch (error) {
    console.error("Error loading contacts from Firebase:", error);
    contacts = [];
    return contacts;
  }
}

/**
 * Normalizes Firebase contact data into a sorted array.
 * @param {any} data
 * @returns {Array<Object>}
 */
function normalizeContacts(data) {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.filter(Boolean);
  }
  const values = Object.values(data).filter(Boolean);
  values.sort((a, b) => getContactSortValue(a) - getContactSortValue(b));
  return values;
}

/**
 * Returns sortable numeric contact id value.
 * @param {Object} contact
 * @returns {number}
 */
function getContactSortValue(contact) {
  const numericPart = parseInt(
    String(contact?.id || "").replace(/\D/g, ""),
    10
  );
  return Number.isFinite(numericPart) ? numericPart : Number.MAX_SAFE_INTEGER;
}

/**
 * Finds a contact by id.
 * @param {string} contactId
 * @returns {Object|null}
 */
function getContactById(contactId) {
  if (!Array.isArray(contacts)) return null;
  return contacts.find((contact) => contact.id === contactId) || null;
}

/**
 * Checks whether contacts array has entries.
 * @returns {boolean}
 */
function hasContacts() {
  return Array.isArray(contacts) && contacts.length > 0;
}

/**
 * Extracts numeric id part from a contact.
 * @param {Object} contact
 * @returns {number}
 */
function getContactIdNumber(contact) {
  const rawId = String(contact?.id || "");
  const numericPart = parseInt(rawId.replace(/\D/g, ""), 10);
  return Number.isFinite(numericPart) ? numericPart : -1;
}

/**
 * Returns the highest numeric contact id.
 * @returns {number}
 */
function getHighestContactNumber() {
  return contacts.reduce((max, contact) => {
    const numericPart = getContactIdNumber(contact);
    return Math.max(max, numericPart);
  }, -1);
}

/**
 * Generates the next contact id based on existing entries.
 * @returns {string}
 */
function getNextContactId() {
  if (!hasContacts()) return "c0";
  const highest = getHighestContactNumber();
  return `c${highest + 1}`;
}

/**
 * Adds a contact to the in-memory list.
 * @param {Object} contact
 */
function addContact(contact) {
  if (Array.isArray(contacts)) {
    contacts.push(contact);
  }
}

/**
 * Finds the contact index by id.
 * @param {string} contactId
 * @returns {number}
 */
function getContactIndex(contactId) {
  if (!Array.isArray(contacts)) return -1;
  return contacts.findIndex((contact) => contact.id === contactId);
}

/**
 * Removes a contact at the given index.
 * @param {number} index
 */
function removeContactAtIndex(index) {
  contacts.splice(index, 1);
}

/**
 * Validates phone format (allows digits, spaces, +, -, (, )).
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const trimmed = (phone || "").trim();
  if (!trimmed) return false;
  const phonePattern = /^[0-9+\-\s()]+$/;
  return phonePattern.test(trimmed);
}

/**
 * Returns a validation error message or an empty string.
 * @param {{name: string, email: string, phone: string}} values
 * @returns {string}
 */
function getContactValidationError(values) {
  if (!values.name) return "Please enter a name.";
  if (!values.email) return "Please enter an email address.";
  if (!isValidEmail(values.email)) {
    return "Please enter a valid email address.";
  }
  if (!values.phone) return "Please enter a phone number.";
  if (!isValidPhone(values.phone)) {
    return "Please enter a valid phone number.";
  }
  return "";
}

/**
 * Sets the current edit ID.
 * @param {string|null} id
 */
function setCurrentEditId(id) {
  currentEditId = id;
}

/**
 * Gets the current edit ID.
 * @returns {string|null}
 */
function getCurrentEditId() {
  return currentEditId;
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initContactsPage);