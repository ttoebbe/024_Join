/**
 * Sets up the add-contact overlay wiring.
 * @param {HTMLElement} listElement
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
 * @param {Object} elements
 * @param {HTMLElement} listElement
 */
function wireOverlayEvents(elements, listElement) {
  registerOverlayInputHandlers(elements);
  registerOverlayButtons(elements, listElement);
  registerOverlayBackdropClick(elements);
}

/**
 * Registers overlay input handlers.
 * @param {Object} elements
 */
function registerOverlayInputHandlers(elements) {
  const clear = () => clearContactFormErrors(elements);
  registerOverlayClearHandlers(elements, clear);
  registerOverlayValidationHandlers(elements);
  wireContactCounters(elements);
}

/**
 * Registers input clearing handlers.
 * @param {Object} elements
 * @param {Function} clear
 */
function registerOverlayClearHandlers(elements, clear) {
  elements.nameInput?.addEventListener("input", clear);
  elements.emailInput?.addEventListener("input", clear);
  elements.phoneInput?.addEventListener("input", clear);
}

/**
 * Registers input validation handlers.
 * @param {Object} elements
 */
function registerOverlayValidationHandlers(elements) {
  registerNameLengthValidation(elements);
  registerEmailLengthValidation(elements);
  registerPhoneValidation(elements);
}

/**
 * Registers name length validation.
 * @param {Object} elements
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
 * @param {Object} elements
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
 * @param {Object} elements
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
 * @param {Object} elements
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
 * @param {Object} elements
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
 * @param {HTMLInputElement} input
 * @param {string} counterId
 * @param {number} max
 * @param {Function} countFn
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
 * @param {HTMLInputElement} input
 * @param {number} max
 */
function enforceContactMax(input, max) {
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= max) return;
  input.value = value.slice(0, max);
}

/**
 * Registers overlay buttons and submit handler.
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
 * Registers the open overlay button.
 * @param {Object} elements
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
 * @param {Object} elements
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
 * @param {Object} elements
 * @param {HTMLElement} listElement
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
 * @param {Object} elements
 * @param {HTMLElement} listElement
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
 * Opens the overlay in edit mode for a contact.
 * @param {string} contactId
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
