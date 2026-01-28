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

async function reloadContactsData(listElement) {
  try {
    await loadContactsFromFirebase();
    renderContactList(listElement, getContactData());
  } catch (error) {
    console.error("Error reloading contacts:", error);
  }
}

function getContactData() {
  if (typeof contacts !== "undefined" && Array.isArray(contacts)) {
    return contacts;
  }
  console.warn("No contact data available.");
  return [];
}

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

function normalizeContacts(data) {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.filter(Boolean);
  }
  const values = Object.values(data).filter(Boolean);
  values.sort((a, b) => getContactSortValue(a) - getContactSortValue(b));
  return values;
}

function getContactSortValue(contact) {
  const numericPart = parseInt(
    String(contact?.id || "").replace(/\D/g, ""),
    10
  );
  return Number.isFinite(numericPart) ? numericPart : Number.MAX_SAFE_INTEGER;
}

function getContactById(contactId) {
  if (!Array.isArray(contacts)) return null;
  return contacts.find((contact) => contact.id === contactId) || null;
}

function hasContacts() {
  return Array.isArray(contacts) && contacts.length > 0;
}

function getContactIdNumber(contact) {
  const rawId = String(contact?.id || "");
  const numericPart = parseInt(rawId.replace(/\D/g, ""), 10);
  return Number.isFinite(numericPart) ? numericPart : -1;
}

function getHighestContactNumber() {
  return contacts.reduce((max, contact) => {
    const numericPart = getContactIdNumber(contact);
    return Math.max(max, numericPart);
  }, -1);
}

async function getNextContactId() {
  try {
    const data = await ContactService.getAll();
    return buildNextContactId(data);
  } catch (error) {
    console.error("Error generating contact ID:", error);
    return `c${Date.now()}`;
  }
}

function buildNextContactId(data) {
  const firebaseContacts = normalizeContacts(data);
  if (!Array.isArray(firebaseContacts) || firebaseContacts.length === 0) return "c0";
  const highest = getHighestContactNumberFrom(firebaseContacts);
  return `c${highest + 1}`;
}

function getHighestContactNumberFrom(list) {
  return list.reduce((max, contact) => {
    const numericPart = getContactIdNumber(contact);
    return Math.max(max, numericPart);
  }, -1);
}

function addContact(contact) {
  if (Array.isArray(contacts)) {
    contacts.push(contact);
  }
}

function getContactIndex(contactId) {
  if (!Array.isArray(contacts)) return -1;
  return contacts.findIndex((contact) => {
    return contact.id === contactId;
  });
}

function removeContactAtIndex(index) {
  contacts.splice(index, 1);
}

function isValidContactName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return false;
  const namePattern = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
  return namePattern.test(trimmed);
}

function isValidPhone(phone) {
  const trimmed = (phone || "").trim();
  if (!trimmed) return false;
  const phonePattern = /^[0-9+\-\s()]+$/;
  if (!phonePattern.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
}

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

function setCurrentEditId(id) {
  currentEditId = id;
}

function getCurrentEditId() {
  return currentEditId;
}

document.addEventListener("DOMContentLoaded", handleContactsReady); // Init contacts page

function handleContactsReady() {
  withPageReady(initContactsPage);
}

function renderContactList(container, data) {
  if (!hasContacts(data)) return clearContactList(container);
  const sorted = sortContacts(data);
  container.innerHTML = buildContactMarkup(sorted);
  wireContactEntries(container);
}

function hasContacts(data) {
  return Array.isArray(data) && data.length > 0;
}

function clearContactList(container) {
  container.innerHTML = "";
}

function sortContacts(data) {
  return [...data].sort((a, b) => {
    return (a?.name || "").localeCompare(b?.name || "", "de", { sensitivity: "base" });
  });
}

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

function wireContactEntries(container) {
  const contactEntries = container.querySelectorAll(".contact-entry");
  contactEntries.forEach((entry) => {
    entry.addEventListener("click", () => handleContactEntryClick(entry));
  });
}

function handleContactEntryClick(entry) {
  const contactId = entry.getAttribute("data-contact-id");
  const contact = getContactById(contactId);
  if (contact) selectContact(contact, entry);
}

function getContactGroupKey(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "#";
  const firstChar = trimmed[0].toUpperCase();
  return /[A-Z]/.test(firstChar) ? firstChar : "#";
}

function selectContact(contact, element) {
  removeActiveStates();
  element.classList.add("is-active");
  renderContactDetail(contact);
  openMobileDetailView();
}

function selectContactById(contactId) {
  const contact = getContactById(contactId);
  if (!contact) return;
  const element = document.querySelector(`[data-contact-id="${contactId}"]`);
  if (!element) return;
  selectContact(contact, element);
}

function removeActiveStates() {
  document
    .querySelectorAll(".contact-entry")
    .forEach((entry) => {
      entry.classList.remove("is-active");
    });
}

function renderContactDetail(contact) {
  const container = document.getElementById("contact-detail-injection");
  if (!container) return;
  container.innerHTML = getContactDetailTemplate(contact);
  setupDetailActions(contact?.id);
  setupMobileDetailButtons(contact?.id);
}

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

function getDetailActionButtons(container) {
  const actionButtons = container.querySelectorAll(".detail-actions .secondary-button");
  const editButton = actionButtons[0];
  const deleteButton = actionButtons[1];
  return { editButton, deleteButton };
}

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
    ".contacts-header .contact-back-button"
  );
  if (!headerBackButton) return;
  headerBackButton.addEventListener("click", closeMobileDetailView);
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 800px)").matches;
}

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
