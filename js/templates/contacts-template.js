/**
 * Template functions for contact views
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

function getContactGroupHeaderTemplate(letter) {
  return `
    <div class="contact-group-header">
      <span class="contact-group-letter">${letter}</span>
    </div>
  `;
}

function getContactDetailTemplate(contact) {
  const initials = getInitials(contact.name);
  return [
    buildContactHero(contact, initials),
    buildContactDetails(contact),
    buildContactMenuButton(),
  ].join("");
}

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

function buildContactDetails(contact) {
  return `<div class="contact-details">\n` +
    `  <h4>Contact Information</h4>\n` +
    `  <div class="detail-row">\n` +
    `    <span class="detail-label">Email</span>\n` +
    `    <a href="mailto:${contact.email}">${contact.email}</a>\n` +
    `  </div>\n` +
    `  <div class="detail-row">\n` +
    `    <span class="detail-label">Telefon</span>\n` +
    `    <span>${contact.phone}</span>\n` +
    `  </div>\n` +
    `</div>\n`;
}

function buildContactMenuButton() {
  return `
    <button type="button" class="contact-menu-button" aria-label="Edit contact">
      <img src="../../img/icons/Menu Contact options.png" alt="" aria-hidden="true" />
    </button>
  `;
}
