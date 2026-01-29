let lastOverlayFocus = null;

/**
 * Sets up the add-contact overlay wiring.
 */
function setupAddContactOverlay(listElement) {
  const elements = getOverlaySetupElements();
  if (!elements) return;
  wireOverlayEvents(elements, listElement);
}

/**
 * Collects base overlay elements.
 * @returns {{ overlay: HTMLElement, form: HTMLFormElement, nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement }|null}
 */
function getContactOverlayElements() {
  const overlay = document.getElementById("contact-overlay");
  const form = document.getElementById("contact-form");
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");
  if (!overlay || !form || !nameInput || !emailInput || !phoneInput)
    return null;
  return { overlay, form, nameInput, emailInput, phoneInput };
}

/**
 * Collects overlay elements plus action buttons.
 * @returns {{ overlay: HTMLElement, form: HTMLFormElement, nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement, openButton: HTMLElement, deleteButton: HTMLElement|null, cancelButton: HTMLElement|null, closeButtons: NodeListOf<HTMLElement> }|null}
 */
function getOverlaySetupElements() {
  const base = getContactOverlayElements();
  const openButton = document.querySelector(".list-add-button");
  const deleteButton = document.getElementById("contact-delete");
  const cancelButton = document.getElementById("contact-cancel");
  const closeButtons = document.querySelectorAll("[data-overlay-close]");
  if (!base || !openButton) return null;
  return { ...base, openButton, deleteButton, cancelButton, closeButtons };
}

/**
 * Wires all overlay handlers.
 */
function wireOverlayEvents(elements, listElement) {
  registerOverlayInputHandlers(elements);
  registerOverlayButtons(elements, listElement);
  registerOverlayBackdropClick(elements);
}

/**
 * Registers overlay input handlers.
 */
function registerOverlayInputHandlers(elements) {
  const clear = () => clearContactFormErrors(elements);
  registerOverlayClearHandlers(elements, clear);
  registerOverlayValidationHandlers(elements);
  wireContactCounters(elements);
}

/**
 * Registers input clearing handlers.
 */
function registerOverlayClearHandlers(elements, clear) {
  elements.nameInput?.addEventListener("input", clear);
  elements.emailInput?.addEventListener("input", clear);
  elements.phoneInput?.addEventListener("input", clear);
}

/**
 * Registers input validation handlers.
 */
function registerOverlayValidationHandlers(elements) {
  registerNameLengthValidation(elements);
  registerEmailLengthValidation(elements);
  registerPhoneValidation(elements);
}

/**
 * Registers name length validation.
 */
function registerNameLengthValidation(elements) {
  elements.nameInput?.addEventListener("input", () => {
    validateContactLength(
      elements.nameInput,
      CONTACT_NAME_MAX,
      "contact-name-error",
      "Name",
    );
  });
}

/**
 * Registers email length validation.
 */
function registerEmailLengthValidation(elements) {
  elements.emailInput?.addEventListener("input", () => {
    validateContactLength(
      elements.emailInput,
      CONTACT_EMAIL_MAX,
      "contact-email-error",
      "Email",
    );
  });
}

/**
 * Registers phone digit validation.
 */
function registerPhoneValidation(elements) {
  elements.phoneInput?.addEventListener("input", () => {
    validatePhoneDigits(
      elements.phoneInput,
      CONTACT_PHONE_MIN,
      CONTACT_PHONE_MAX,
      "contact-phone-error",
    );
  });
}

/**
 * Wires contact counters for all inputs.
 */
function wireContactCounters(elements) {
  updateContactCounters(elements);
  elements.nameInput?.addEventListener("input", () =>
    updateContactCounters(elements),
  );
  elements.emailInput?.addEventListener("input", () =>
    updateContactCounters(elements),
  );
  elements.phoneInput?.addEventListener("input", () =>
    updateContactCounters(elements),
  );
}

/**
 * Updates all contact counters.
 */
function updateContactCounters(elements) {
  enforceContactMax(elements.nameInput, CONTACT_NAME_MAX);
  updateContactFieldCounter(
    elements.nameInput,
    "contact-name-counter",
    CONTACT_NAME_MAX,
  );
  enforceContactMax(elements.emailInput, CONTACT_EMAIL_MAX);
  updateContactFieldCounter(
    elements.emailInput,
    "contact-email-counter",
    CONTACT_EMAIL_MAX,
  );
  trimPhoneToMaxDigits(elements.phoneInput, CONTACT_PHONE_MAX);
  updateContactFieldCounter(
    elements.phoneInput,
    "contact-phone-counter",
    CONTACT_PHONE_MAX,
    getPhoneDigitsCount,
  );
}

/**
 * Updates a single contact field counter.
 */
function updateContactFieldCounter(input, counterId, max, countFn = null) {
  const counter = document.getElementById(counterId);
  if (!counter) return;
  const value = input?.value || "";
  const length = typeof countFn === "function" ? countFn(value) : value.length;
  counter.textContent = `${length}/${max}`;
}

/**
 * Enforces max length on an input.
 */
function enforceContactMax(input, max) {
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= max) return;
  input.value = value.slice(0, max);
}

/**
 * Registers overlay buttons and submit handler.
 */
function registerOverlayButtons(elements, listElement) {
  registerOverlayOpenButton(elements);
  registerOverlayCloseButtons(elements);
  registerOverlayDeleteButton(elements, listElement);
  registerOverlaySubmit(elements, listElement);
}

/**
 * Registers the open overlay button.
 */
function registerOverlayOpenButton(elements) {
  elements.openButton?.addEventListener("click", () => {
    setOverlayMode(elements.form, false);
    setOverlayAvatarDefault();
    elements.form?.reset();
    clearContactFormErrors(elements);
    updateContactCounters(elements);
    openOverlay(elements.overlay);
  });
}

/**
 * Registers close buttons for the overlay.
 */
function registerOverlayCloseButtons(elements) {
  if (!elements.closeButtons) return;
  elements.closeButtons.forEach((button) => {
    button.addEventListener("click", () =>
      closeOverlay(elements.overlay, elements.form),
    );
  });
}

/**
 * Registers delete button handling.
 */
function registerOverlayDeleteButton(elements, listElement) {
  elements.deleteButton?.addEventListener("click", async () => {
    const currentId = getCurrentEditId();
    if (!currentId) return;
    const confirmed = await showConfirmOverlay({
      title: "Delete contact?",
      message: "Do you really want to delete this contact?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    await deleteContact(currentId);
    closeOverlay(elements.overlay, elements.form);
  });
}

/**
 * Registers overlay submit handling.
 */
function registerOverlaySubmit(elements, listElement) {
  elements.form.addEventListener("submit", async (event) => {
    await handleNewContactSubmit(
      event,
      elements.overlay,
      elements.form,
      listElement,
    );
  });
}

/**
 * Registers overlay backdrop click handling.
 */
function registerOverlayBackdropClick(elements) {
  elements.overlay.addEventListener("click", (event) => {
    if (event.target === elements.overlay) {
      closeOverlay(elements.overlay, elements.form);
    }
  });
}

/**
 * Opens the overlay and sets focus state.
 */
function openOverlay(overlay) {
  storeLastFocusedElement(overlay);
  overlay.classList.add("is-visible");
  overlay.setAttribute("aria-hidden", "false");
}

/**
 * Closes the overlay and resets the form.
 */
function closeOverlay(overlay, form) {
  restoreLastFocusedElement(overlay);
  overlay.classList.remove("is-visible");
  overlay.setAttribute("aria-hidden", "true");
  setOverlayMode(form, false);
  setOverlayAvatarDefault();
  form?.reset();
}

/**
 * Stores the last focused element before opening.
 */
function storeLastFocusedElement(overlay) {
  if (!overlay) return;
  lastOverlayFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
}

/**
 * Restores focus after closing the overlay.
 */
function restoreLastFocusedElement(overlay) {
  if (!overlay) return;
  const active = document.activeElement;
  if (active instanceof HTMLElement && overlay.contains(active)) active.blur();
  if (lastOverlayFocus && document.contains(lastOverlayFocus)) {
    lastOverlayFocus.focus();
  }
  lastOverlayFocus = null;
}

/**
 * Updates overlay mode between add and edit.
 */
function setOverlayMode(form, isEdit) {
  const title = document.getElementById("contact-overlay-title");
  const submitButton = form?.querySelector('button[type="submit"]');
  const deleteButton = document.getElementById("contact-delete");
  const cancelButton = document.getElementById("contact-cancel");
  const overlayLogo = document.querySelector(".overlay-logo");
  updateOverlayTexts(title, submitButton, isEdit);
  updateOverlayVisibility(overlayLogo, deleteButton, cancelButton, isEdit);
  if (!isEdit) setCurrentEditId(null);
}

/**
 * Updates overlay texts for the active mode.
 */
function updateOverlayTexts(title, submitButton, isEdit) {
  if (title) title.textContent = isEdit ? "Edit contact" : "Add contact";
  if (submitButton) {
    const label = submitButton.querySelector("span");
    const text = isEdit ? "Save changes" : "Create contact";
    if (label) label.textContent = text;
    else submitButton.textContent = text;
  }
}

/**
 * Updates visibility of overlay controls.
 */
function updateOverlayVisibility(
  overlayLogo,
  deleteButton,
  cancelButton,
  isEdit,
) {
  if (overlayLogo) overlayLogo.style.display = isEdit ? "none" : "flex";
  if (deleteButton)
    deleteButton.style.display = isEdit ? "inline-flex" : "none";
  if (cancelButton)
    cancelButton.style.display = isEdit ? "none" : "inline-flex";
}

/**
 * Fills the overlay form with contact data.
 */
function fillContactForm(elements, contact) {
  elements.nameInput.value = contact.name || "";
  elements.emailInput.value = contact.email || "";
  elements.phoneInput.value = contact.phone || "";
}

/**
 * Gets the overlay avatar circle element.
 * @returns {HTMLElement|null}
 */
function getOverlayAvatarCircle() {
  return document.querySelector(".overlay-avatar .avatar-circle");
}

/**
 * Resets the overlay avatar to default.
 */
function setOverlayAvatarDefault() {
  const avatar = getOverlayAvatarCircle();
  if (!avatar) return;
  avatar.classList.remove("is-contact");
  avatar.style.backgroundColor = "";
  avatar.textContent = "";
  ensureDefaultAvatarIcon(avatar);
}

/**
 * Ensures the default avatar icon is present.
 */
function ensureDefaultAvatarIcon(avatar) {
  if (avatar.querySelector("img")) return;
  const img = document.createElement("img");
  img.src = "/assets/img/icons/group-13.svg";
  img.alt = "User avatar";
  avatar.appendChild(img);
}

/**
 * Sets the overlay avatar from a contact.
 */
function setOverlayAvatarContact(contact) {
  const avatar = getOverlayAvatarCircle();
  if (!avatar) return;
  avatar.classList.add("is-contact");
  avatar.style.backgroundColor = contact?.color || "#2a3647";
  avatar.textContent = getInitials(contact?.name || "");
  removeAvatarIcon(avatar);
}

/**
 * Removes the avatar icon image.
 */
function removeAvatarIcon(avatar) {
  const img = avatar.querySelector("img");
  if (img) img.remove();
}

/**
 * Opens the overlay in edit mode for a contact.
 */
function openEditContact(contactId) {
  const contact = getContactById(contactId);
  if (!contact) return;
  const elements = getContactOverlayElements();
  if (!elements) return;
  fillContactForm(elements, contact);
  updateContactCounters(elements);
  setOverlayAvatarContact(contact);
  setOverlayMode(elements.form, true);
  setCurrentEditId(contactId);
  openOverlay(elements.overlay);
}
