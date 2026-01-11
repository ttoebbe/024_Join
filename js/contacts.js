/**###############################*/
/** Globals */
/**###############################*/
let currentEditId = null;
let contacts = [];

/**###############################*/
/** Basic Helpers */
/**###############################*/
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
  const phonePattern = /^[0-9+\-\s()]+$/;
  return phonePattern.test(trimmed);
}

/**###############################*/
/** Initialization */
/**###############################*/
/**
 * Initializes the contact list once the page is ready.
 */
async function initContactsPage() {
  const listElement = document.querySelector(".contact-list");
  if (!listElement) {
    return;
  }
  await loadContactsFromFirebase();
  renderContactList(listElement, getContactData());
  setupAddContactOverlay(listElement);
  setupHeaderBackButton();
}

/**###############################*/
/** Data (Local + Firebase) */
/**###############################*/
/**
 * Returns available contacts from the dataset.
 * @returns {Array<Object>}
 */
function getContactData() {
  if (typeof contacts !== "undefined" && Array.isArray(contacts)) {
    return contacts;
  }
  console.warn("Keine Kontaktdaten verfugbar.");
  return [];
}

/**
 * Loads contacts from Firebase and normalizes them into an array.
 * @returns {Promise<Array<Object>>}
 */
async function loadContactsFromFirebase() {
  if (typeof getData !== "function") {
    console.warn("Firebase helper getData nicht verfugbar.");
    contacts = [];
    return contacts;
  }

  const data = await getData("contacts");
  contacts = normalizeContacts(data);
  return contacts;
}

/**
 * Normalizes Firebase contact data into a sorted array.
 * @param {any} data
 * @returns {Array<Object>}
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
 * Returns sortable numeric contact id value.
 * @param {Object} contact
 * @returns {number}
 */
function getContactSortValue(contact) {
  const numericPart = parseInt(
    String(contact?.id || "").replace(/\D/g, ""),
    10
  );
  return Number.isFinite(numericPart) ? numericPart : Number.MAX_SAFE_INTEGER;
}

/**
 * Saves current contacts array to Firebase.
 * @returns {Promise<void>}
 */
async function saveContactsToFirebase() {
  if (typeof uploadData !== "function") {
    console.warn("Firebase helper uploadData nicht verfugbar.");
    return;
  }
  await uploadData("contacts", contacts);
}

/**
 * Finds a contact by id.
 * @param {string} contactId
 * @returns {Object|null}
 */
function getContactById(contactId) {
  if (!Array.isArray(contacts)) return null;
  return contacts.find((contact) => contact.id === contactId) || null;
}

/**
 * Checks whether contacts array has entries.
 * @returns {boolean}
 */
function hasContacts() {
  return Array.isArray(contacts) && contacts.length > 0;
}

/**
 * Extracts numeric id part from a contact.
 * @param {Object} contact
 * @returns {number}
 */
function getContactIdNumber(contact) {
  const rawId = String(contact?.id || "");
  const numericPart = parseInt(rawId.replace(/\D/g, ""), 10);
  return Number.isFinite(numericPart) ? numericPart : -1;
}

/**
 * Returns the highest numeric contact id.
 * @returns {number}
 */
function getHighestContactNumber() {
  return contacts.reduce((max, contact) => {
    const numericPart = getContactIdNumber(contact);
    return Math.max(max, numericPart);
  }, -1);
}

/**
 * Generates the next contact id based on existing entries.
 * @returns {string}
 */
function getNextContactId() {
  if (!hasContacts()) return "c0";
  const highest = getHighestContactNumber();
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

/**###############################*/
/** Rendering + Templates */
/**###############################*/
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
  const sorted = [...data].sort((a, b) =>
    (a?.name || "").localeCompare(b?.name || "", "de", { sensitivity: "base" })
  );
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
  container.innerHTML = markup.join("");
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
 * Returns the markup for a group header in the contact list.
 * @param {string} letter
 * @returns {string}
 */
function getContactGroupHeaderTemplate(letter) {
  return /* html */ `
    <div class="contact-group-header">
      <span class="contact-group-letter">${letter}</span>
    </div>
  `;
}

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
 * Creates HTML template for contact detail view.
 * @param {Object} contact
 * @returns {string}
 */

function getContactDetailTemplate(contact) {
  const initials = getInitials(contact.name);
  return /* html */ `
    <div class="contact-detail-top">
      <button
        type="button"
        class="contact-menu-button"
        aria-label="Edit contact"
      >
        <img
          src="../img/icons/Menu Contact options.png"
          alt=""
          aria-hidden="true"
          width="32"
          height="32"
        />
      </button>
    </div>
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
  `;
}

/**###############################*/
/** Detail View + Actions */
/**###############################*/
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
 * Returns true when the mobile layout is active.
 * @returns {boolean}
 */
function isMobileLayout() {
  return window.matchMedia("(max-width: 768px)").matches;
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
  if (isMobileLayout()) {
    setMobileDetailState(true);
  }
}

/**
 * Closes the detail view on mobile layouts.
 */
function closeMobileDetailView() {
  setMobileDetailState(false);
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
  const actionButtons = container.querySelectorAll(
    ".detail-actions .secondary-button"
  );
  const editButton = actionButtons[0];
  const deleteButton = actionButtons[1];
  editButton?.addEventListener("click", () => openEditContact(contactId));
  deleteButton?.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Do you really want to delete this contact?"
    );
    if (!confirmed) return;
    deleteContact(contactId);
  });
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
 * Collects overlay elements used for contact editing.
 * @returns {{overlay: HTMLElement, form: HTMLFormElement, nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement}|null}
 */
function getContactOverlayElements() {
  const overlay = document.getElementById("contact-overlay");
  const form = document.getElementById("contact-form");
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");
  if (!overlay || !form || !nameInput || !emailInput || !phoneInput) {
    return null;
  }
  return { overlay, form, nameInput, emailInput, phoneInput };
}

/**
 * Fills the contact form with existing values.
 * @param {Object} elements
 * @param {Object} contact
 */
function fillContactForm(elements, contact) {
  elements.nameInput.value = contact.name || "";
  elements.emailInput.value = contact.email || "";
  elements.phoneInput.value = contact.phone || "";
}

/**
 * Opens the contact overlay for editing.
 * @param {string} contactId
 */
function openEditContact(contactId) {
  const contact = getContactById(contactId);
  if (!contact) return;
  const elements = getContactOverlayElements();
  if (!elements) return;
  fillContactForm(elements, contact);
  setOverlayMode(elements.form, true);
  currentEditId = contactId;
  openOverlay(elements.overlay);
}

/**
 * Finds the contact index by id.
 * @param {string} contactId
 * @returns {number}
 */
function getContactIndex(contactId) {
  if (!Array.isArray(contacts)) return -1;
  return contacts.findIndex((contact) => contact.id === contactId);
}

/**
 * Removes a contact at the given index.
 * @param {number} index
 */
function removeContactAtIndex(index) {
  contacts.splice(index, 1);
}

/**
 * Rerenders the contact list if it exists.
 */
function updateContactList() {
  const listElement = document.querySelector(".contact-list");
  if (listElement) {
    renderContactList(listElement, getContactData());
  }
}

/**
 * Deletes a contact and refreshes the UI.
 * @param {string} contactId
 */
async function deleteContact(contactId) {
  const index = getContactIndex(contactId);
  if (index === -1) return;
  removeContactAtIndex(index);
  await saveContactsToFirebase();
  updateContactList();
  clearContactDetail();
}

/**
 * Resets the detail panel when no contact is selected.
 */
function clearContactDetail() {
  const container = document.getElementById("contact-detail-injection");
  if (!container) return;
  container.textContent = "Select a contact to see details.";
  closeMobileDetailView();
}

/**###############################*/
/** Overlay + Form */
/**###############################*/
/**
 * Sets up overlay open/close behavior and submission handling.
 * @param {HTMLElement} listElement
 */
function setupAddContactOverlay(listElement) {
  const elements = getOverlaySetupElements();
  if (!elements) return;
  wireOverlayEvents(elements, listElement);
}

/**
 * Collects overlay setup elements.
 * @returns {Object|null}
 */
function getOverlaySetupElements() {
  const base = getContactOverlayElements();
  const openButton = document.querySelector(".list-add-button");
  const deleteButton = document.getElementById("contact-delete");
  const closeButton = document.querySelector("[data-overlay-close]");
  if (!base || !openButton) return null;
  return { ...base, openButton, deleteButton, closeButton };
}

/**
 * Wires up all overlay events.
 * @param {Object} elements
 * @param {HTMLElement} listElement
 */
function wireOverlayEvents(elements, listElement) {
  registerOverlayInputHandlers(elements);
  registerOverlayButtons(elements, listElement);
  registerOverlayBackdropClick(elements);
}

/**
 * Registers input handlers for validation cleanup.
 * @param {Object} elements
 */
function registerOverlayInputHandlers(elements) {
  const clearErrorMsg = () => setText("contactFormMsg", "");
  elements.nameInput?.addEventListener("input", clearErrorMsg);
  elements.emailInput?.addEventListener("input", clearErrorMsg);
  elements.phoneInput?.addEventListener("input", clearErrorMsg);
}

/**
 * Registers button handlers for the overlay.
 * @param {Object} elements
 * @param {HTMLElement} listElement
 */
function registerOverlayButtons(elements, listElement) {
  registerOverlayOpenButton(elements);
  registerOverlayCloseButtons(elements);
  registerOverlayDeleteButton(elements, listElement);
  registerOverlaySubmit(elements, listElement);
}

/**
 * Registers the open button handler.
 * @param {Object} elements
 */
function registerOverlayOpenButton(elements) {
  elements.openButton.addEventListener("click", () => {
    setOverlayMode(elements.form, false);
    openOverlay(elements.overlay);
  });
}

/**
 * Registers close handlers for cancel and close buttons.
 * @param {Object} elements
 */
function registerOverlayCloseButtons(elements) {
  elements.closeButton?.addEventListener("click", () =>
    closeOverlay(elements.overlay, elements.form)
  );
}

/**
 * Registers delete handler for edit mode.
 * @param {Object} elements
 * @param {HTMLElement} listElement
 */
function registerOverlayDeleteButton(elements, listElement) {
  elements.deleteButton?.addEventListener("click", async () => {
    if (!currentEditId) return;
    const confirmed = window.confirm(
      "Do you really want to delete this contact?"
    );
    if (!confirmed) return;
    await deleteContact(currentEditId);
    closeOverlay(elements.overlay, elements.form);
  });
}

/**
 * Registers form submit handler.
 * @param {Object} elements
 * @param {HTMLElement} listElement
 */
function registerOverlaySubmit(elements, listElement) {
  elements.form.addEventListener("submit", async (event) => {
    await handleNewContactSubmit(
      event,
      elements.overlay,
      elements.form,
      listElement
    );
  });
}

/**
 * Registers backdrop click handler.
 * @param {Object} elements
 */
function registerOverlayBackdropClick(elements) {
  elements.overlay.addEventListener("click", (event) => {
    if (event.target === elements.overlay) {
      closeOverlay(elements.overlay, elements.form);
    }
  });
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
  setOverlayMode(form, false);
  form?.reset();
}

/**
 * Updates overlay text and mode for add vs edit.
 * @param {HTMLFormElement} form
 * @param {boolean} isEdit
 */
function setOverlayMode(form, isEdit) {
  const title = document.getElementById("contact-overlay-title");
  const submitButton = form?.querySelector('button[type="submit"]');
  const deleteButton = document.getElementById("contact-delete");
  const overlayLogo = document.querySelector(".overlay-logo");
  if (title) title.textContent = isEdit ? "Edit contact" : "Add contact";
  if (submitButton)
    submitButton.textContent = isEdit ? "Save changes" : "Create contact";
  if (overlayLogo) overlayLogo.style.display = isEdit ? "none" : "flex";
  if (deleteButton) deleteButton.style.display = isEdit ? "inline-flex" : "none";
  if (!isEdit) currentEditId = null;
}

/**
 * Reads contact values from the form.
 * @param {HTMLFormElement} form
 * @returns {{name: string, email: string, phone: string}}
 */
function getContactFormValues(form) {
  const formData = new FormData(form);
  return {
    name: (formData.get("name") || "").toString().trim(),
    email: (formData.get("email") || "").toString().trim(),
    phone: (formData.get("phone") || "").toString().trim(),
  };
}

/**
 * Returns a validation error message or an empty string.
 * @param {{name: string, email: string, phone: string}} values
 * @returns {string}
 */
function getContactValidationError(values) {
  if (!values.name) return "Please enter a name.";
  if (!values.email) return "Please enter an email address.";
  if (!isValidEmail(values.email)) {
    return "Please enter a valid email address.";
  }
  if (!values.phone) return "Please enter a phone number.";
  if (!isValidPhone(values.phone)) {
    return "Please enter a valid phone number.";
  }
  return "";
}

/**
 * Updates an existing contact and refreshes UI.
 * @param {{name: string, email: string, phone: string}} values
 * @param {HTMLElement} overlay
 * @param {HTMLFormElement} form
 * @param {HTMLElement} listElement
 * @returns {Promise<boolean>}
 */
async function updateExistingContact(values, overlay, form, listElement) {
  const existing = getContactById(currentEditId);
  if (!existing) return false;
  applyContactValues(existing, values);
  await saveContactsToFirebase();
  renderContactList(listElement, getContactData());
  closeOverlay(overlay, form);
  selectContactById(existing.id);
  return true;
}

/**
 * Applies contact values to an existing object.
 * @param {Object} target
 * @param {{name: string, email: string, phone: string}} values
 */
function applyContactValues(target, values) {
  target.name = values.name;
  target.email = values.email;
  target.phone = values.phone;
}

/**
 * Selects a contact entry by id if available.
 * @param {string} contactId
 */
function selectContactById(contactId) {
  const entry = document.querySelector(`[data-contact-id="${contactId}"]`);
  const contact = getContactById(contactId);
  if (entry && contact) {
    selectContact(contact, entry);
  }
}

/**
 * Creates a new contact, stores it, and refreshes UI.
 * @param {{name: string, email: string, phone: string}} values
 * @param {HTMLElement} overlay
 * @param {HTMLFormElement} form
 * @param {HTMLElement} listElement
 */
async function createNewContact(values, overlay, form, listElement) {
  const newContact = buildNewContact(values);
  addContact(newContact);
  await saveContactsToFirebase();
  renderContactList(listElement, getContactData());
  closeOverlay(overlay, form);
  selectContactById(newContact.id);
}

/**
 * Builds a contact object from form values.
 * @param {{name: string, email: string, phone: string}} values
 * @returns {Object}
 */
function buildNewContact(values) {
  return {
    id: getNextContactId(),
    name: values.name,
    email: values.email,
    phone: values.phone,
    color: getRandomContactColor(),
  };
}

/**
 * Adds a contact to the in-memory list.
 * @param {Object} contact
 */
function addContact(contact) {
  if (Array.isArray(contacts)) {
    contacts.push(contact);
  }
}

/**
 * Handles new contact form submission with validation.
 * @param {SubmitEvent} event
 * @param {HTMLElement} overlay
 * @param {HTMLFormElement} form
 * @param {HTMLElement} listElement
 */
async function handleNewContactSubmit(event, overlay, form, listElement) {
  event.preventDefault();
  setText("contactFormMsg", "");
  const values = getContactFormValues(form);
  const error = getContactValidationError(values);
  if (error) return setText("contactFormMsg", error);
  if (currentEditId) {
    const updated = await updateExistingContact(
      values,
      overlay,
      form,
      listElement
    );
    if (updated) return;
  }
  await createNewContact(values, overlay, form, listElement);
}
