const CONTACT_NAME_MAX = 30;
const CONTACT_EMAIL_MAX = 50;
const CONTACT_PHONE_MIN = 6;
const CONTACT_PHONE_MAX = 15;

/**
 * Reads trimmed contact values from the form.
 * @param {HTMLFormElement} form - Contact form element
 * @returns {{ name: string, email: string, phone: string }}
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
 * Applies form values to a contact object.
 */
function applyContactValues(target, values) {
  target.name = values.name;
  target.email = values.email;
  target.phone = values.phone;
}

/**
 * Builds a new contact payload with ID and color.
 * @param {{ name: string, email: string, phone: string }} values
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
 * Updates an existing contact and refreshes the UI.
 * @returns {Promise<boolean>}
 */
async function updateExistingContact(
  values,
  overlay,
  form,
  listElement,
  currentId,
) {
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
 * Updates the local contacts cache by ID.
 */
function updateLocalContact(currentId, existing) {
  const index = getContactIndex(currentId);
  if (index !== -1) contacts[index] = existing;
}

/**
 * Refreshes the contact list and focuses the updated contact.
 */
function refreshContactUI(listElement, overlay, form, contactId) {
  renderContactList(listElement, getContactData());
  closeOverlay(overlay, form);
  selectContactById(contactId);
}

/**
 * Creates a new contact and refreshes the list.
 */
async function createNewContact(values, overlay, form, listElement) {
  try {
    const newContact = await buildNewContact(values);
    const result = await ContactService.create(newContact);
    if (!result) return;
    await loadContactsFromFirebase();
    refreshContactUI(listElement, overlay, form, newContact.id);
    showImageToast(
      "/assets/img/icons/contact-succesfull-create.svg",
      "Contact created",
    );
  } catch (error) {
    console.error("Error creating contact:", error);
  }
}

/**
 * Deletes a contact and updates the UI.
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
    console.error("Error deleting contact:", error);
  }
}

function updateContactList() {
  const listElement = document.querySelector(".contact-list");
  if (!listElement) return;
  renderContactList(listElement, getContactData());
}

function clearContactDetail() {
  const container = document.getElementById("contact-detail-injection");
  if (container) container.innerHTML = "";
  if (typeof removeActiveStates === "function") removeActiveStates();
  if (typeof closeMobileDetailView === "function") closeMobileDetailView();
}

/**
 * Handles new contact form submission.
 */
async function handleNewContactSubmit(event, overlay, form, listElement) {
  event.preventDefault();
  const inputs = getContactFormInputs(form);
  await submitContactForm(inputs, overlay, form, listElement);
}

/**
 * Handles submit for existing or new contacts.
 */
async function handleExistingContact(
  values,
  overlay,
  form,
  listElement,
  currentId,
) {
  const updated = await updateExistingContact(
    values,
    overlay,
    form,
    listElement,
    currentId,
  );
  if (updated) return;
  await createNewContact(values, overlay, form, listElement);
}

/**
 * Validates and persists contact form input.
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
 * Persists a contact based on edit state.
 */
async function persistContactForm(values, overlay, form, listElement) {
  const currentId = getCurrentEditId();
  if (currentId)
    return handleExistingContact(values, overlay, form, listElement, currentId);
  await createNewContact(values, overlay, form, listElement);
}

/**
 * Clears all contact form error messages.
 */
function clearContactFormErrors({ nameInput, emailInput, phoneInput }) {
  setContactFormMsg("");
  clearContactInputError(nameInput);
  clearContactInputError(emailInput);
  clearContactInputError(phoneInput);
  clearContactFieldError("contact-name-error", nameInput);
  clearContactFieldError("contact-email-error", emailInput);
  clearContactFieldError("contact-phone-error", phoneInput);
}

/**
 * Sets the global contact form message.
 */
function setContactFormMsg(message) {
  setText("contactFormMsg", message || "");
}

/**
 * Clears error styling from a contact input.
 */
function clearContactInputError(input) {
  if (input) input.classList.remove("input-error");
}

/**
 * Validates contact form values and updates errors.
 * @returns {boolean}
 */
function validateContactForm(inputs, values) {
  clearContactFormErrors(inputs);
  const errors = getContactFieldErrors(values);
  if (Object.keys(errors).length === 0) return true;
  applyContactFieldErrors(inputs, errors);
  return false;
}

/**
 * Builds validation errors for contact values.
 * @param {{ name: string, email: string, phone: string }} values
 * @returns {Object}
 */
function getContactFieldErrors(values) {
  const errors = {};
  if (!values.name || !isValidContactName(values.name)) {
    errors.name = "Please enter your full name. Only letters are allowed.";
  }
  if (!values.email || !isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.phone || !isValidPhone(values.phone)) {
    errors.phone = `Between ${CONTACT_PHONE_MIN} and ${CONTACT_PHONE_MAX} digits required.`;
  }
  return errors;
}

/**
 * Applies field errors to the contact form.
 */
function applyContactFieldErrors(inputs, errors) {
  if (errors.name) {
    setContactFieldError("contact-name-error", errors.name, inputs.nameInput);
  }
  if (errors.email) {
    setContactFieldError(
      "contact-email-error",
      errors.email,
      inputs.emailInput,
    );
  }
  if (errors.phone) {
    setContactFieldError(
      "contact-phone-error",
      errors.phone,
      inputs.phoneInput,
    );
  }
}

/**
 * Counts digit characters in a value.
 * @param {string} value
 * @returns {number}
 */
function getPhoneDigitsCount(value) {
  return String(value || "").replace(/\D/g, "").length;
}

/**
 * Trims an input to a maximum number of digits.
 */
function trimPhoneToMaxDigits(input, max) {
  if (!input) return;
  const value = String(input.value || "");
  let digits = 0;
  let result = "";
  for (const char of value) {
    if (/\d/.test(char)) {
      if (digits >= max) continue;
      digits += 1;
    }
    result += char;
  }
  if (result !== value) input.value = result;
}

/**
 * Validates max length for a contact field.
 */
function validateContactLength(input, max, errorId, label) {
  const value = input?.value || "";
  if (!value) return clearContactFieldError(errorId, input);
  if (value.length <= max) return clearContactFieldError(errorId, input);
  setContactFieldError(
    errorId,
    `${label} is too long (max ${max} characters).`,
    input,
  );
}

/**
 * Validates phone digit count for a field.
 */
function validatePhoneDigits(input, min, max, errorId) {
  const digits = getPhoneDigitsCount(input?.value || "");
  if (!digits) return clearContactFieldError(errorId, input);
  if (digits > max) {
    return setContactFieldError(
      errorId,
      `Between ${min} and ${max} digits required.`,
      input,
    );
  }
  return clearContactFieldError(errorId, input);
}

/**
 * Sets a field error message and styling.
 */
function setContactFieldError(errorId, message, input) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.classList.toggle("is-visible", Boolean(message));
  if (input) input.classList.toggle("input-error", Boolean(message));
}

/**
 * Clears a field error message and styling.
 */
function clearContactFieldError(errorId, input) {
  setContactFieldError(errorId, "", input);
}

/**
 * Collects required inputs from the contact form.
 * @param {HTMLFormElement} form
 * @returns {{ nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement, submitBtn: HTMLButtonElement }|null}
 */
function getContactFormInputs(form) {
  const nameInput = form.querySelector("#contact-name");
  const emailInput = form.querySelector("#contact-email");
  const phoneInput = form.querySelector("#contact-phone");
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!nameInput || !emailInput || !phoneInput || !submitBtn) return null;
  return { nameInput, emailInput, phoneInput, submitBtn };
}

/**
 * Toggles submit button busy state.
 */
function setContactSubmitBusy({ submitBtn }, busy) {
  if (!submitBtn) return;
  submitBtn.disabled = Boolean(busy);
}
