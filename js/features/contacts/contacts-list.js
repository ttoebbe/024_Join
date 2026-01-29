/**
 * Renders the contact list and wires entries.
 * @param {HTMLElement} container
 * @param {Array} data
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
 * @param {HTMLElement} container
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
 * @param {HTMLElement} container
 */
function wireContactEntries(container) {
  const contactEntries = container.querySelectorAll(".contact-entry");
  contactEntries.forEach((entry) => {
    entry.addEventListener("click", () => handleContactEntryClick(entry));
  });
}

/**
 * Handles a contact entry click.
 * @param {HTMLElement} entry
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
 * Selects a contact by ID.
 * @param {string} contactId
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
