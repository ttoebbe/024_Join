/**
 * Contacts Overlay Module
 * Handles overlay management and open/close behavior
 */

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
 * Collects overlay elements used for contact editing.
 * @returns {{overlay: HTMLElement, form: HTMLFormElement, nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement}|null}
 */
function getContactOverlayElements() {
  const overlay = document.getElementById("contact-overlay");
  const form = document.getElementById("contact-form");
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");
  if (!overlay || !form || !nameInput || !emailInput || !phoneInput) return null;
  return { overlay, form, nameInput, emailInput, phoneInput };
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
  const clear = () => clearContactFormErrors(elements);
  elements.nameInput?.addEventListener("input", clear);
  elements.emailInput?.addEventListener("input", clear);
  elements.phoneInput?.addEventListener("input", clear);
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
  elements.openButton?.addEventListener("click", () => {
    setOverlayMode(elements.form, false);
    setOverlayAvatarDefault();
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
    const currentId = getCurrentEditId();
    if (!currentId) return;
    const confirmed = window.confirm("Do you really want to delete this contact?");
    if (!confirmed) return;
    await deleteContact(currentId);
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
    await handleNewContactSubmit(event, elements.overlay, elements.form, listElement);
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
  setOverlayAvatarDefault();
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
  updateOverlayTexts(title, submitButton, isEdit);
  updateOverlayVisibility(overlayLogo, deleteButton, isEdit);
  if (!isEdit) setCurrentEditId(null);
}


/**
 * Updates overlay title and button text.
 * @param {HTMLElement} title
 * @param {HTMLElement} submitButton
 * @param {boolean} isEdit
 */
function updateOverlayTexts(title, submitButton, isEdit) {
  if (title) title.textContent = isEdit ? "Edit contact" : "Add contact";
  if (submitButton) submitButton.textContent = isEdit ? "Save changes" : "Create contact";
}


/**
 * Updates overlay logo and delete button visibility.
 * @param {HTMLElement} overlayLogo
 * @param {HTMLElement} deleteButton
 * @param {boolean} isEdit
 */
function updateOverlayVisibility(overlayLogo, deleteButton, isEdit) {
  if (overlayLogo) overlayLogo.style.display = isEdit ? "none" : "flex";
  if (deleteButton) deleteButton.style.display = isEdit ? "inline-flex" : "none";
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

function getOverlayAvatarCircle() {
  return document.querySelector(".overlay-avatar .avatar-circle");
}

function setOverlayAvatarDefault() {
  const avatar = getOverlayAvatarCircle();
  if (!avatar) return;
  avatar.classList.remove("is-contact");
  avatar.style.backgroundColor = "";
  avatar.textContent = "";
  ensureDefaultAvatarIcon(avatar);
}

function ensureDefaultAvatarIcon(avatar) {
  if (avatar.querySelector("img")) return;
  const img = document.createElement("img");
  img.src = "/assets/img/icons/Group 13.svg";
  img.alt = "User avatar";
  avatar.appendChild(img);
}

function setOverlayAvatarContact(contact) {
  const avatar = getOverlayAvatarCircle();
  if (!avatar) return;
  avatar.classList.add("is-contact");
  avatar.style.backgroundColor = contact?.color || "#2a3647";
  avatar.textContent = getInitials(contact?.name || "");
  removeAvatarIcon(avatar);
}

function removeAvatarIcon(avatar) {
  const img = avatar.querySelector("img");
  if (img) img.remove();
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
  setOverlayAvatarContact(contact);
  setOverlayMode(elements.form, true);
  setCurrentEditId(contactId);
  openOverlay(elements.overlay);
}
