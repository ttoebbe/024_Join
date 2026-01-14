/**
 * Template functions for contact views
 */
function getContactTemplate(contact, isActive = false) {
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

function getContactGroupHeaderTemplate(letter) {
  return /* html */ `
    <div class="contact-group-header">
      <span class="contact-group-letter">${letter}</span>
    </div>
  `;
}

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
          <button class="secondary-button">Edit</button>
          <button class="secondary-button">Delete</button>
        </div>
      </div>
    </div>
    <div class="contact-details">
      <h4>Contact Information</h4>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <a href="mailto:${contact.email}">${contact.email}</a>
      </div>
      <div class="detail-row">
        <span class="detail-label">Telefon</span>
        <span>${contact.phone}</span>
      </div>
    </div>
    <button
      type="button"
      class="contact-menu-button"
      aria-label="Edit contact"
    >
      <img
        src="../../img/icons/Menu Contact options.png"
        alt=""
        aria-hidden="true"
      />
    </button>
  `;
}