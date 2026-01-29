let currentEditId = null;
let contacts = [];

/**
 * Gets the current contacts array.
 * @returns {Array}
 */
function getContactData() {
  if (typeof contacts !== "undefined" && Array.isArray(contacts)) {
    return contacts;
  }
  console.warn("No contact data available.");
  return [];
}

/**
 * Loads contacts from Firebase.
 * @returns {Promise<Array>}
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
 * Normalizes contact data into a sorted array.
 * @param {any} data
 * @returns {Array}
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
 * Builds a numeric sort value for a contact.
 * @param {Object} contact
 * @returns {number}
 */
function getContactSortValue(contact) {
  const numericPart = parseInt(
    String(contact?.id || "").replace(/\D/g, ""),
    10,
  );
  return Number.isFinite(numericPart) ? numericPart : Number.MAX_SAFE_INTEGER;
}

/**
 * Finds a contact by ID.
 * @param {string} contactId
 * @returns {Object|null}
 */
function getContactById(contactId) {
  if (!Array.isArray(contacts)) return null;
  return contacts.find((contact) => contact.id === contactId) || null;
}

/**
 * Extracts the numeric part of a contact ID.
 * @param {Object} contact
 * @returns {number}
 */
function getContactIdNumber(contact) {
  const rawId = String(contact?.id || "");
  const numericPart = parseInt(rawId.replace(/\D/g, ""), 10);
  return Number.isFinite(numericPart) ? numericPart : -1;
}

/**
 * Gets the highest numeric contact ID.
 * @returns {number}
 */
function getHighestContactNumber() {
  return contacts.reduce((max, contact) => {
    const numericPart = getContactIdNumber(contact);
    return Math.max(max, numericPart);
  }, -1);
}

/**
 * Generates the next contact ID.
 * @returns {Promise<string>}
 */
async function getNextContactId() {
  try {
    const data = await ContactService.getAll();
    return buildNextContactId(data);
  } catch (error) {
    console.error("Error generating contact ID:", error);
    return `c${Date.now()}`;
  }
}

/**
 * Builds the next contact ID from data.
 * @param {any} data
 * @returns {string}
 */
function buildNextContactId(data) {
  const firebaseContacts = normalizeContacts(data);
  if (!Array.isArray(firebaseContacts) || firebaseContacts.length === 0)
    return "c0";
  const highest = getHighestContactNumberFrom(firebaseContacts);
  return `c${highest + 1}`;
}

/**
 * Gets the highest numeric contact ID from a list.
 * @param {Array} list
 * @returns {number}
 */
function getHighestContactNumberFrom(list) {
  return list.reduce((max, contact) => {
    const numericPart = getContactIdNumber(contact);
    return Math.max(max, numericPart);
  }, -1);
}

/**
 * Adds a contact to the local list.
 * @param {Object} contact
 */
function addContact(contact) {
  if (Array.isArray(contacts)) {
    contacts.push(contact);
  }
}

/**
 * Gets the array index for a contact ID.
 * @param {string} contactId
 * @returns {number}
 */
function getContactIndex(contactId) {
  if (!Array.isArray(contacts)) return -1;
  return contacts.findIndex((contact) => {
    return contact.id === contactId;
  });
}

/**
 * Removes a contact by array index.
 * @param {number} index
 */
function removeContactAtIndex(index) {
  contacts.splice(index, 1);
}

/**
 * Validates a contact name.
 * @param {string} name
 * @returns {boolean}
 */
function isValidContactName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return false;
  const namePattern = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
  return namePattern.test(trimmed);
}

/**
 * Validates a phone number.
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const trimmed = (phone || "").trim();
  if (!trimmed) return false;
  const phonePattern = /^[0-9+\-\s()]+$/;
  if (!phonePattern.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
}

/**
 * Returns a validation error message for contact values.
 * @param {{ name: string, email: string, phone: string }} values
 * @returns {string}
 */
function getContactValidationError(values) {
  if (!values.name || !isValidContactName(values.name)) {
    return "Please enter your full name. Only letters are allowed.";
  }
  if (!values.email || !isValidEmail(values.email)) {
    return "Please enter a valid email address.";
  }
  if (!values.phone || !isValidPhone(values.phone)) {
    return "Between 6 and 15 digits required.";
  }
  return "";
}

/**
 * Sets the current edit contact ID.
 * @param {string|null} id
 */
function setCurrentEditId(id) {
  currentEditId = id;
}

/**
 * Gets the current edit contact ID.
 * @returns {string|null}
 */
function getCurrentEditId() {
  return currentEditId;
}
