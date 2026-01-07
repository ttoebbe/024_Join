/**
 * Helper function to set text content of an element by ID.
 * @param {string} id
 * @param {string} txt
 */
function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt || "";
}

/**
 * Initializes the contact list once the page is ready.
 */
function initContactsPage() {
  const listElement = document.querySelector(".contact-list");
  if (!listElement) {
    return;
  }
  renderContactList(listElement, getContactData());
  setupAddContactOverlay(listElement);
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
  const contactData = JSON.stringify(contact).replace(/"/g, "&quot;");
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
  element.classList.add("is-active");
  renderContactDetail(contact);
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
          <button class="secondary-button">✏️ Edit</button>
          <button class="secondary-button">🗑️ Delete</button>
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
  `;
}

/**
 * Sets up overlay open/close behavior and submission handling.
 * @param {HTMLElement} listElement
 */
function setupAddContactOverlay(listElement) {
  const overlay = document.getElementById("contact-overlay");
  const openButton = document.querySelector(".list-add-button");
  const cancelButton = document.getElementById("contact-cancel");
  const closeButton = document.querySelector("[data-overlay-close]");
  const form = document.getElementById("contact-form");
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");

  if (!overlay || !openButton || !form) {
    return;
  }

  // Clear error message on input
  const clearErrorMsg = () => setText("contactFormMsg", "");
  nameInput?.addEventListener("input", clearErrorMsg);
  emailInput?.addEventListener("input", clearErrorMsg);
  phoneInput?.addEventListener("input", clearErrorMsg);

  openButton.addEventListener("click", () => openOverlay(overlay));
  cancelButton?.addEventListener("click", () => closeOverlay(overlay, form));
  closeButton?.addEventListener("click", () => closeOverlay(overlay, form));
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeOverlay(overlay, form);
    }
  });

  form.addEventListener("submit", (event) =>
    handleNewContactSubmit(event, overlay, form, listElement)
  );
}

/**
 * Opens the add contact overlay.
 * @param {HTMLElement} overlay
 */
function openOverlay(overlay) {
  overlay.classList.add("is-visible");
  overlay.setAttribute("aria-hidden", "false");
}

/**
 * Closes the add contact overlay and clears the form.
 * @param {HTMLElement} overlay
 * @param {HTMLFormElement} form
 */
function closeOverlay(overlay, form) {
  overlay.classList.remove("is-visible");
  overlay.setAttribute("aria-hidden", "true");
  form?.reset();
}

/**
 * handles new contact form submission with validation.
 * @param {SubmitEvent} event 
 * @param {HTMLElement} overlay 
 * @param {HTMLFormElement} form 
 * @param {HTMLElement} listElement 
 * @returns 
 */
function handleNewContactSubmit(event, overlay, form, listElement) {
  event.preventDefault();

  const formData = new FormData(form);
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const phone = (formData.get("phone") || "").toString().trim();

  // Clear previous error
  setText("contactFormMsg", "");

  // Validation
  if (!name) {
    return setText("contactFormMsg", "Please enter a name.");
  }

  if (!email) {
    return setText("contactFormMsg", "Please enter an email address.");
  }

  if (!isValidEmail(email)) {
    return setText("contactFormMsg", "Please enter a valid email address.");
  }

  if (!phone) {
    return setText("contactFormMsg", "Please enter a phone number.");
  }

  if (!isValidPhone(phone)) {
    return setText("contactFormMsg", "Please enter a valid phone number.");
  }

  const newContact = {
    id: getNextContactId(),
    name,
    email,
    phone,
    color: getRandomContactColor(),
  };

  if (Array.isArray(contacts)) {
    contacts.push(newContact);
  }

  renderContactList(listElement, getContactData());
  closeOverlay(overlay, form);

  const newEntry = document.querySelector(
    `[data-contact-id="${newContact.id}"]`
  );
  if (newEntry) {
    selectContact(newContact, newEntry);
  }
}

/**
 * Generates the next contact id based on existing entries.
 * @returns {string}
 */
function getNextContactId() {
  if (!Array.isArray(contacts) || !contacts.length) {
    return "c0";
  }
  const highest = contacts.reduce((max, contact) => {
    const numericPart = parseInt(
      String(contact.id || "").replace(/\D/g, ""),
      10
    );
    return Number.isFinite(numericPart) ? Math.max(max, numericPart) : max;
  }, -1);
  return `c${highest + 1}`;
}

/**
 * Provides a random accent color for new contacts.
 * @returns {string}
 */
function getRandomContactColor() {
  const palette = [
    "#FF7A00",
    "#29ABE2",
    "#FF5EB3",
    "#9B51E0",
    "#2ECC71",
    "#F2994A",
    "#EB5757",
    "#56CCF2",
    "#6FCF97",
    "#BB6BD9",
  ];
  const index = Math.floor(Math.random() * palette.length);
  return palette[index];
}

/** Cancel Inputs or create new Contact to sample-contacts.js*/

/**
 * Validates email format (checks for @ and . after @).
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const trimmed = (email || "").trim();
  if (!trimmed.includes("@")) return false;
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  if (!parts[0] || !parts[1] || !parts[1].includes(".")) return false;
  return true;
}

/**
 * Validates phone format (allows digits, spaces, +, -, (, )).
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const trimmed = (phone || "").trim();
  if (!trimmed) return false;
  // Allow digits, spaces, +, -, (, )
  const phonePattern = /^[0-9+\-\s()]+$/;
  return phonePattern.test(trimmed);
}
