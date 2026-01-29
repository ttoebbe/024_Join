let currentEditId = null;
let contacts = [];

async function initContactsPage() {
  const listElement = document.querySelector(".contact-list");
  if (!listElement) {
    return;
  }
  await loadContactsFromFirebase();
  renderContactList(listElement, getContactData());
  setupAddContactOverlay(listElement);
  setupHeaderBackButton();
  onPageVisible(() => reloadContactsData(listElement));
}

/**
 * Reloads contacts from Firebase and updates the list.
 */
async function reloadContactsData(listElement) {
  try {
    await loadContactsFromFirebase();
    renderContactList(listElement, getContactData());
  } catch (error) {
    console.error("Error reloading contacts:", error);
  }
}

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
 * Checks if any contacts are loaded.
 * @returns {boolean}
 */
function hasContacts() {
  return Array.isArray(contacts) && contacts.length > 0;
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

// Run contacts init when the DOM is ready.
document.addEventListener("DOMContentLoaded", handleContactsReady);

function handleContactsReady() {
  withPageReady(initContactsPage);
}

/**
 * Renders the contact list and wires entries.
 */
function renderContactList(container, data) {
  if (!hasContacts(data)) return clearContactList(container);
  const sorted = sortContacts(data);
  container.innerHTML = buildContactMarkup(sorted);
  wireContactEntries(container);
}

/**
 * Checks whether the provided list has contacts.
 * @param {Array} data
 * @returns {boolean}
 */
function hasContacts(data) {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Clears the contact list container.
 */
function clearContactList(container) {
  container.innerHTML = "";
}

/**
 * Sorts contacts by name.
 * @param {Array} data
 * @returns {Array}
 */
function sortContacts(data) {
  return [...data].sort((a, b) => {
    return (a?.name || "").localeCompare(b?.name || "", "de", {
      sensitivity: "base",
    });
  });
}

/**
 * Builds the HTML markup for the contact list.
 * @param {Array} sorted
 * @returns {string}
 */
function buildContactMarkup(sorted) {
  let currentGroup = "";
  const markup = [];
  sorted.forEach((contact) => {
    const groupKey = getContactGroupKey(contact?.name);
    if (groupKey !== currentGroup) {
      currentGroup = groupKey;
      markup.push(getContactGroupHeaderTemplate(groupKey));
    }
    markup.push(getContactTemplate(contact));
  });
  return markup.join("");
}

/**
 * Wires click handlers for contact entries.
 */
function wireContactEntries(container) {
  const contactEntries = container.querySelectorAll(".contact-entry");
  contactEntries.forEach((entry) => {
    entry.addEventListener("click", () => handleContactEntryClick(entry));
  });
}

/**
 * Handles a contact entry click.
 */
function handleContactEntryClick(entry) {
  const contactId = entry.getAttribute("data-contact-id");
  const contact = getContactById(contactId);
  if (contact) selectContact(contact, entry);
}

/**
 * Gets the group key for a contact name.
 * @param {string} name
 * @returns {string}
 */
function getContactGroupKey(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "#";
  const firstChar = trimmed[0].toUpperCase();
  return /[A-Z]/.test(firstChar) ? firstChar : "#";
}

/**
 * Selects a contact and renders details.
 */
function selectContact(contact, element) {
  removeActiveStates();
  element.classList.add("is-active");
  renderContactDetail(contact);
  openMobileDetailView();
}

/**
 * Selects a contact by ID.
 */
function selectContactById(contactId) {
  const contact = getContactById(contactId);
  if (!contact) return;
  const element = document.querySelector(`[data-contact-id="${contactId}"]`);
  if (!element) return;
  selectContact(contact, element);
}

function removeActiveStates() {
  document.querySelectorAll(".contact-entry").forEach((entry) => {
    entry.classList.remove("is-active");
  });
}

/**
 * Renders the contact detail view.
 */
function renderContactDetail(contact) {
  const container = document.getElementById("contact-detail-injection");
  if (!container) return;
  container.innerHTML = getContactDetailTemplate(contact);
  setupDetailActions(contact?.id);
  setupMobileDetailButtons(contact?.id);
}

/**
 * Wires edit/delete actions in the detail view.
 */
function setupDetailActions(contactId) {
  const container = document.getElementById("contact-detail-injection");
  if (!container || !contactId) return;
  const { editButton, deleteButton } = getDetailActionButtons(container);
  editButton?.addEventListener("click", () => {
    openEditContact(contactId);
  });
  deleteButton?.addEventListener("click", () => {
    confirmDeleteContact(contactId);
  });
}

/**
 * Gets detail action buttons from the container.
 * @param {HTMLElement} container
 * @returns {{ editButton: HTMLElement, deleteButton: HTMLElement }}
 */
function getDetailActionButtons(container) {
  const actionButtons = container.querySelectorAll(
    ".detail-actions .secondary-button",
  );
  const editButton = actionButtons[0];
  const deleteButton = actionButtons[1];
  return { editButton, deleteButton };
}

/**
 * Confirms contact deletion.
 */
async function confirmDeleteContact(contactId) {
  const confirmed = await showConfirmOverlay({
    title: "Delete contact?",
    message: "Do you really want to delete this contact?",
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  if (!confirmed) return;
  deleteContact(contactId);
}

/**
 * Wires mobile detail buttons.
 */
function setupMobileDetailButtons(contactId) {
  const container = document.getElementById("contact-detail-injection");
  if (!container || !contactId) return;
  const menuButton = container.querySelector(".contact-menu-button");
  menuButton?.addEventListener("click", () => {
    openEditContact(contactId);
  });
}

function setupHeaderBackButton() {
  const headerBackButton = document.querySelector(
    ".contacts-header .contact-back-button",
  );
  if (!headerBackButton) return;
  headerBackButton.addEventListener("click", closeMobileDetailView);
}

/**
 * Checks whether the layout is mobile.
 * @returns {boolean}
 */
function isMobileLayout() {
  return window.matchMedia("(max-width: 800px)").matches;
}

/**
 * Sets the mobile detail panel state.
 */
function setMobileDetailState(isActive) {
  const page = document.querySelector(".contacts-page");
  if (!page) return;
  page.classList.toggle("is-detail-open", isActive);
}

function openMobileDetailView() {
  if (isMobileLayout()) setMobileDetailState(true);
}

function closeMobileDetailView() {
  if (isMobileLayout()) setMobileDetailState(false);
}
