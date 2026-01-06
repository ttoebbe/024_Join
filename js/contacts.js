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

// /**
//  * Builds the HTML template for a single contact entry.
//  * @param {Object} contact
//  * @returns {string}
//  */
// function getContactTemplate(contact) {
//   const initials = getInitials(contact.name);
//   const avatarColor = contact.color || "#2a3647";
//   return /* html */ `<article class="contact-entry" 
//   data-contact-id="${contact.id}">
//   <span class="contact-avatar" 
//   style="background:${avatarColor}">
//   ${initials}</span>
//   <div class="contact-meta"><p 
//   class="contact-name">${contact.name}</p>
//   <p class="contact-email">${contact.email}</p>
//   </div></article>`;
// }

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

/** Contact Detail Functions */

/**
 * Builds the HTML template for a single contact entry.
 * @param {Object} contact
 * @returns {string}
 */
function getContactTemplate(contact) {
  const initials = getInitials(contact.name);
  const avatarColor = contact.color || "#2a3647";
  const contactData = JSON.stringify(contact).replace(/"/g, '&quot;');
  return /* html */ `<article class="contact-entry" 
  data-contact-id="${contact.id}"
  onclick="selectContact(${contactData}, this)">
  <span class="contact-avatar" 
  style="background:${avatarColor}">
  ${initials}</span>
  <div class="contact-meta"><p 
  class="contact-name">${contact.name}</p>
  <p class="contact-email">${contact.email}</p>
  </div></article>`;
}

/**
 * Handles contact selection and updates UI state.
 * @param {Object} contact 
 * @param {HTMLElement} element 
 */
function selectContact(contact, element) {
  removeActiveStates();
  element.classList.add('is-active');
  renderContactDetail(contact);
}

/**
 * Removes active state from all contact entries.
 */
function removeActiveStates() {
  document.querySelectorAll('.contact-entry')
    .forEach(entry => entry.classList.remove('is-active'));
}

/**
 * Renders contact detail view in injection area.
 * @param {Object} contact 
 */
function renderContactDetail(contact) {
  const container = document.getElementById('contact-detail-injection');
  if (!container) return;
  container.innerHTML = getContactDetailTemplate(contact);
}

/**
 * Creates HTML template for contact detail view.
 * @param {Object} contact 
 * @returns {string}
 */
function getContactDetailTemplate(contact) {
  const initials = getInitials(contact.name);
  return /* html */ `
    <div class="contact-hero">
      <div class="contact-avatar contact-avatar-large" 
           style="background-color: ${contact.color}">
        ${initials}
      </div>
      <div class="contact-info">
        <h2>${contact.name}</h2>
        <div class="detail-actions">
          <button class="secondary-button">✏️ Bearbeiten</button>
          <button class="secondary-button">🗑️ Löschen</button>
        </div>
      </div>
    </div>
    <div class="contact-details">
      <h4>Kontakt Information</h4>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <a href="mailto:${contact.email}">${contact.email}</a>
      </div>
      <div class="detail-row">
        <span class="detail-label">Telefon</span>
        <span>${contact.phone}</span>
      </div>
    </div>
  `;
}
