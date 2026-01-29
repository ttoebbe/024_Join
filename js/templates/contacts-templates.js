/**
 * Rendert einen Kontakteintrag.
 * @param {*} contact
 * @param {boolean} isActive
 * @returns {string}
 */
function getContactTemplate(contact, isActive = false) {
  const initials = getInitials(contact.name);
  const avatarColor = contact.color || "#2a3647";
  return `
    <article class="contact-entry" data-contact-id="${contact.id}">
      <span class="contact-avatar" style="background:${avatarColor}">${initials}</span>
      <div class="contact-meta">
        <p class="contact-name">${contact.name}</p>
        <p class="contact-email">${contact.email}</p>
      </div>
    </article>
  `;
}

/**
 * Rendert den Buchstaben-Header einer Kontaktgruppe.
 * @param {string} letter
 * @returns {string}
 */
function getContactGroupHeaderTemplate(letter) {
  return `
    <div class="contact-group-header">
      <span class="contact-group-letter">${letter}</span>
    </div>
  `;
}

/**
 * Baut die Detailansicht eines Kontakts.
 * @param {*} contact
 * @returns {string}
 */
function getContactDetailTemplate(contact) {
  const initials = getInitials(contact.name);
  return [
    buildContactHero(contact, initials),
    buildContactDetails(contact),
    buildContactMenuButton(),
  ].join("");
}

/**
 * Baut den Kopfbereich der Detailansicht.
 * @param {*} contact
 * @param {string} initials
 * @returns {string}
 */
function buildContactHero(contact, initials) {
  return `<div class="contact-hero">\n` +
    `  <div class="contact-avatar contact-avatar-large" style="background-color: ${contact.color}">${initials}</div>\n` +
    `  <div class="contact-info">\n` +
    `    <h2>${contact.name}</h2>\n` +
    `    <div class="detail-actions">\n` +
    `      <button class="secondary-button">Edit</button>\n` +
    `      <button class="secondary-button">Delete</button>\n` +
    `    </div>\n` +
    `  </div>\n` +
    `</div>\n`;
}

/**
 * Baut die Detailinformationen eines Kontakts.
 * @param {*} contact
 * @returns {string}
 */
function buildContactDetails(contact) {
  return `<div class="contact-details">\n` +
    `  <h4>Contact Information</h4>\n` +
    `  <div class="detail-row">\n` +
    `    <span class="detail-label">Email</span>\n` +
    `    <a href="mailto:${contact.email}">${contact.email}</a>\n` +
    `  </div>\n` +
    `  <div class="detail-row">\n` +
    `    <span class="detail-label">Phone</span>\n` +
    `    <span>${contact.phone}</span>\n` +
    `  </div>\n` +
    `</div>\n`;
}

function buildContactMenuButton() {
  return `
    <button type="button" class="contact-menu-button" aria-label="Edit contact">
      <img src="../../assets/img/icons/menu-contact-options.png" alt="" aria-hidden="true" />
    </button>
  `;
}
