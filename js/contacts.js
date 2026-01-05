/**
 * Initializes the contact list once the page is ready.
 */
function initContactsPage() {
  const listElement = document.querySelector(".contact-list");
  if (!listElement) {
    return;
  }
  renderContactList(listElement, getContactData());
}

/**
 * Returns available contacts from the dummy dataset.
 * @returns {Array<Object>}
 */
function getContactData() {
  if (typeof contacts !== "undefined" && Array.isArray(contacts)) {
    return contacts;
  }
  console.warn("Keine Kontaktdaten verfügbar.");
  return [];
}

/**
 * Renders all contacts into the target container.
 * @param {HTMLElement} container
 * @param {Array<Object>} data
 */
function renderContactList(container, data) {
  if (!Array.isArray(data) || !data.length) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = data.map(getContactTemplate).join("");
}

/**
 * Builds the HTML template for a single contact entry.
 * @param {Object} contact
 * @returns {string}
 */
function getContactTemplate(contact) {
  const initials = getInitials(contact.name);
  const avatarColor = contact.color || "#2a3647";
  return /* html */ `<article class="contact-entry" 
  data-contact-id="${contact.id}">
  <span class="contact-avatar" 
  style="background:${avatarColor}">
  ${initials}</span>
  <div class="contact-meta"><p 
  class="contact-name">${contact.name}</p>
  <p class="contact-email">${contact.email}</p>
  </div></article>`;
}

/**
 * Calculates initials for a given name.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) {
    return "";
  }
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("");
}
