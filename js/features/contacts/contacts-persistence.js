/**
 * Contacts Persistence Module
 * Handles CRUD operations for contacts
 */

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
 * @returns {Promise<Object>}
 */
async function buildNewContact(values) {
  return {
    id: await getNextContactId(),
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
    const newContact = await buildNewContact(values);
    const result = await ContactService.create(newContact);
    if (!result) return;
    await loadContactsFromFirebase();
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
