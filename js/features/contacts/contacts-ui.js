/**
 * Contacts UI Module  
 * Handles rendering, display logic, mobile layouts, and contact selection
 */

/**
 * Renders all contacts into the target container.
 * @param {HTMLElement} container
 * @param {Array<Object>} data
 */
function renderContactList(container, data) {
  if (!hasContacts(data)) return clearContactList(container);
  const sorted = sortContacts(data);
  container.innerHTML = buildContactMarkup(sorted);
  wireContactEntries(container);
}

/**
 * @param {*} data
 * @returns {*}
 */
function hasContacts(data) {
  return Array.isArray(data) && data.length > 0;
}

/**
 * @param {*} container
 * @returns {*}
 */
function clearContactList(container) {
  container.innerHTML = "";
}

/**
 * @param {*} data
 * @returns {*}
 */
function sortContacts(data) {
  return [...data].sort((a, b) => {
    return (a?.name || "").localeCompare(b?.name || "", "de", { sensitivity: "base" });
  });
}

/**
 * @param {*} sorted
 * @returns {*}
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
 * @param {*} container
 * @returns {*}
 */
function wireContactEntries(container) {
  const contactEntries = container.querySelectorAll(".contact-entry");
  contactEntries.forEach((entry) => {
    entry.addEventListener("click", () => handleContactEntryClick(entry));
  });
}

/**
 * @param {*} entry
 * @returns {*}
 */
function handleContactEntryClick(entry) {
  const contactId = entry.getAttribute("data-contact-id");
  const contact = getContactById(contactId);
  if (contact) selectContact(contact, entry);
}

/**
 * Extracts a grouping key based on the contact's name.
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
 * Handles contact selection and updates UI state.
 * @param {Object} contact
 * @param {HTMLElement} element
 */
function selectContact(contact, element) {
  removeActiveStates();
  element.classList.add("is-active");
  renderContactDetail(contact);
  openMobileDetailView();
}

/**
 * Removes active state from all contact entries.
 */
function removeActiveStates() {
  document
    .querySelectorAll(".contact-entry")
    .forEach((entry) => entry.classList.remove("is-active"));
}

/**
 * Renders contact detail view in injection area.
 * @param {Object} contact
 */
function renderContactDetail(contact) {
  const container = document.getElementById("contact-detail-injection");
  if (!container) return;
  container.innerHTML = getContactDetailTemplate(contact);
  setupDetailActions(contact?.id);
  setupMobileDetailButtons(contact?.id);
}

/**
 * Wires up edit/delete actions for the detail view.
 * @param {string} contactId
 */
function setupDetailActions(contactId) {
  const container = document.getElementById("contact-detail-injection");
  if (!container || !contactId) return;
  const { editButton, deleteButton } = getDetailActionButtons(container);
  editButton?.addEventListener("click", () => openEditContact(contactId));
  deleteButton?.addEventListener("click", () => confirmDeleteContact(contactId));
}

/**
 * @param {*} container
 * @returns {*}
 */
function getDetailActionButtons(container) {
  const actionButtons = container.querySelectorAll(".detail-actions .secondary-button");
  const editButton = actionButtons[0];
  const deleteButton = actionButtons[1];
  return { editButton, deleteButton };
}

/**
 * @param {*} contactId
 * @returns {*}
 */
function confirmDeleteContact(contactId) {
  const confirmed = window.confirm("Do you really want to delete this contact?");
  if (!confirmed) return;
  deleteContact(contactId);
}

/**
 * Wires up mobile-specific detail buttons.
 * @param {string} contactId
 */
function setupMobileDetailButtons(contactId) {
  const container = document.getElementById("contact-detail-injection");
  if (!container || !contactId) return;
  const menuButton = container.querySelector(".contact-menu-button");
  menuButton?.addEventListener("click", () => openEditContact(contactId));
}

/**
 * Wires the header back button to close the detail view.
 */
function setupHeaderBackButton() {
  const headerBackButton = document.querySelector(
    ".contacts-header .contact-back-button"
  );
  if (!headerBackButton) return;
  headerBackButton.addEventListener("click", closeMobileDetailView);
}

/**
 * Returns true when the mobile layout is active.
 * @returns {boolean}
 */
function isMobileLayout() {
  return window.matchMedia("(max-width: 800px)").matches;
}

/**
 * Toggles the mobile detail view state.
 * @param {boolean} isActive
 */
function setMobileDetailState(isActive) {
  const page = document.querySelector(".contacts-page");
  if (!page) return;
  page.classList.toggle("is-detail-open", isActive);
}

/**
 * Opens the detail view on mobile layouts.
 */
function openMobileDetailView() {
  if (isMobileLayout()) setMobileDetailState(true);
}

/**
 * Closes the detail view on mobile layouts.
 */
function closeMobileDetailView() {
  if (isMobileLayout()) setMobileDetailState(false);
}
