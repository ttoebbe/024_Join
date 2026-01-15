/**
 * Contacts Forms & Overlay Module
 * Handles overlay management, form handling, and CRUD operations
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
  if (!overlay || !form || !nameInput || !emailInput || !phoneInput) {
    return null;
  }
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
 * Clears contact form errors and messages.
 * @param {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement}} elements
 * @returns {void}
 */
function clearContactFormErrors({ nameInput, emailInput, phoneInput }) {
  setContactFormMsg("");
  clearContactInputError(nameInput);
  clearContactInputError(emailInput);
  clearContactInputError(phoneInput);
}


/**
 * Sets contact form message text.
 * @param {string} message
 * @returns {void}
 */
function setContactFormMsg(message) {
  setText("contactFormMsg", message || "");
}


/**
 * Removes input error class.
 * @param {HTMLInputElement} input
 * @returns {void}
 */
function clearContactInputError(input) {
  if (input) input.classList.remove("input-error");
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
    const currentId = getCurrentEditId();
    if (!currentId) return;
    const confirmed = window.confirm(
      "Do you really want to delete this contact?"
    );
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
  if (!isEdit) setCurrentEditId(null);
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
  setCurrentEditId(contactId);
  openOverlay(elements.overlay);
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
    color: generateRandomColor(),
  };
}

/**
 * Updates an existing contact and refreshes UI.
 * @param {{name: string, email: string, phone: string}} values
 * @param {HTMLElement} overlay
 * @param {HTMLFormElement} form
 * @param {HTMLElement} listElement
 * @param {string} currentId
 * @returns {Promise<boolean>}
 */
async function updateExistingContact(values, overlay, form, listElement, currentId) {
  try {
    const existing = getContactById(currentId);
    if (!existing) return false;
    applyContactValues(existing, values);
    await ContactService.update(currentId, existing);
    updateLocalContact(currentId, existing);
    refreshContactUI(listElement, overlay, form, existing.id);
    return true;
  } catch (error) {
    console.error("Error updating contact:", error);
    return false;
  }
}

/**
 * @param {*} currentId
 * @param {*} existing
 * @returns {*}
 */
function updateLocalContact(currentId, existing) {
  const index = getContactIndex(currentId);
  if (index !== -1) contacts[index] = existing;
}

/**
 * @param {*} listElement
 * @param {*} overlay
 * @param {*} form
 * @param {*} contactId
 * @returns {*}
 */
function refreshContactUI(listElement, overlay, form, contactId) {
  renderContactList(listElement, getContactData());
  closeOverlay(overlay, form);
  selectContactById(contactId);
}

/**
 * Creates a new contact, stores it, and refreshes UI.
 * @param {{name: string, email: string, phone: string}} values
 * @param {HTMLElement} overlay
 * @param {HTMLFormElement} form
 * @param {HTMLElement} listElement
 */
async function createNewContact(values, overlay, form, listElement) {
  try {
    const newContact = buildNewContact(values);
    const result = await ContactService.create(newContact);
    if (!result) return;
    addContact(newContact);
    refreshContactUI(listElement, overlay, form, newContact.id);
  } catch (error) {
    console.error("Error creating contact:", error);
  }
}

/**
 * Deletes a contact and refreshes the UI.
 * @param {string} contactId
 */
async function deleteContact(contactId) {
  try {
    await ContactService.delete(contactId);
    const index = getContactIndex(contactId);
    if (index !== -1) {
      removeContactAtIndex(index);
    }
    updateContactList();
    clearContactDetail();
  } catch (error) {
    console.error('Error deleting contact:', error);
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
  const inputs = getContactFormInputs(form);
  await submitContactForm(inputs, overlay, form, listElement);
}

/**
 * @param {*} values
 * @param {*} overlay
 * @param {*} form
 * @param {*} listElement
 * @param {*} currentId
 * @returns {*}
 */
async function handleExistingContact(values, overlay, form, listElement, currentId) {
  const updated = await updateExistingContact(values, overlay, form, listElement, currentId);
  if (updated) return;
  await createNewContact(values, overlay, form, listElement);
}


/**
 * Collects contact form inputs.
 * @param {HTMLFormElement} form
 * @returns {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement, submitBtn: HTMLButtonElement}|null}
 */
function getContactFormInputs(form) {
  const nameInput = form.querySelector("#contact-name");
  const emailInput = form.querySelector("#contact-email");
  const phoneInput = form.querySelector("#contact-phone");
  const submitBtn = form.querySelector("button[type=\"submit\"]");
  if (!nameInput || !emailInput || !phoneInput || !submitBtn) return null;
  return { nameInput, emailInput, phoneInput, submitBtn };
}


/**
 * Runs contact form validation and submission with busy state.
 * @param {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement, submitBtn: HTMLButtonElement}|null} inputs
 * @param {HTMLElement} overlay
 * @param {HTMLFormElement} form
 * @param {HTMLElement} listElement
 * @returns {Promise<void>}
 */
async function submitContactForm(inputs, overlay, form, listElement) {
  if (!inputs) return;
  setContactSubmitBusy(inputs, true);
  try {
    const values = getContactFormValues(form);
    if (!validateContactForm(inputs, values)) return;
    await persistContactForm(values, overlay, form, listElement);
  } finally {
    setContactSubmitBusy(inputs, false);
  }
}


/**
 * Validates contact form values and sets UI errors.
 * @param {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement}} inputs
 * @param {{name: string, email: string, phone: string}} values
 * @returns {boolean}
 */
function validateContactForm(inputs, values) {
  clearContactFormErrors(inputs);
  const error = getContactValidationError(values);
  if (!error) return true;
  setContactFormMsg(error);
  markContactValidationErrors(inputs, values);
  return false;
}


/**
 * Marks invalid contact fields.
 * @param {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement}} inputs
 * @param {{name: string, email: string, phone: string}} values
 * @returns {void}
 */
function markContactValidationErrors(inputs, values) {
  if (!values.name) addContactInputError(inputs.nameInput);
  if (!values.email || !isValidEmail(values.email)) addContactInputError(inputs.emailInput);
  if (!values.phone || !isValidPhone(values.phone)) addContactInputError(inputs.phoneInput);
}


/**
 * Adds input error class.
 * @param {HTMLInputElement} input
 * @returns {void}
 */
function addContactInputError(input) {
  if (input) input.classList.add("input-error");
}


/**
 * Persists the contact form values.
 * @param {{name: string, email: string, phone: string}} values
 * @param {HTMLElement} overlay
 * @param {HTMLFormElement} form
 * @param {HTMLElement} listElement
 * @returns {Promise<void>}
 */
async function persistContactForm(values, overlay, form, listElement) {
  const currentId = getCurrentEditId();
  if (currentId) return handleExistingContact(values, overlay, form, listElement, currentId);
  await createNewContact(values, overlay, form, listElement);
}


/**
 * Toggles submit button busy state.
 * @param {{submitBtn: HTMLButtonElement}} inputs
 * @param {boolean} busy
 * @returns {void}
 */
function setContactSubmitBusy({ submitBtn }, busy) {
  if (!submitBtn) return;
  submitBtn.disabled = Boolean(busy);
}
