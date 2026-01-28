const CONTACT_NAME_MAX = 30;
const CONTACT_EMAIL_MAX = 30;
const CONTACT_PHONE_MIN = 6;
const CONTACT_PHONE_MAX = 15;

function getContactFormValues(form) {
  const formData = new FormData(form);
  return {
    name: (formData.get("name") || "").toString().trim(),
    email: (formData.get("email") || "").toString().trim(),
    phone: (formData.get("phone") || "").toString().trim(),
  };
}

function applyContactValues(target, values) {
  target.name = values.name;
  target.email = values.email;
  target.phone = values.phone;
}

async function buildNewContact(values) {
  return {
    id: await getNextContactId(),
    name: values.name,
    email: values.email,
    phone: values.phone,
    color: generateRandomColor(),
  };
}

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

function updateLocalContact(currentId, existing) {
  const index = getContactIndex(currentId);
  if (index !== -1) contacts[index] = existing;
}

function refreshContactUI(listElement, overlay, form, contactId) {
  renderContactList(listElement, getContactData());
  closeOverlay(overlay, form);
  selectContactById(contactId);
}

async function createNewContact(values, overlay, form, listElement) {
  try {
    const newContact = await buildNewContact(values);
    const result = await ContactService.create(newContact);
    if (!result) return;
    await loadContactsFromFirebase();
    refreshContactUI(listElement, overlay, form, newContact.id);
    showImageToast("/assets/img/icons/contact-succesfull-create.png", "Contact created");
  } catch (error) {
    console.error("Error creating contact:", error);
  }
}

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

async function handleNewContactSubmit(event, overlay, form, listElement) {
  event.preventDefault();
  const inputs = getContactFormInputs(form);
  await submitContactForm(inputs, overlay, form, listElement);
}

async function handleExistingContact(values, overlay, form, listElement, currentId) {
  const updated = await updateExistingContact(values, overlay, form, listElement, currentId);
  if (updated) return;
  await createNewContact(values, overlay, form, listElement);
}

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

async function persistContactForm(values, overlay, form, listElement) {
  const currentId = getCurrentEditId();
  if (currentId) return handleExistingContact(values, overlay, form, listElement, currentId);
  await createNewContact(values, overlay, form, listElement);
}

function clearContactFormErrors({ nameInput, emailInput, phoneInput }) {
  setContactFormMsg("");
  clearContactInputError(nameInput);
  clearContactInputError(emailInput);
  clearContactInputError(phoneInput);
  clearContactFieldError("contact-name-error", nameInput);
  clearContactFieldError("contact-email-error", emailInput);
  clearContactFieldError("contact-phone-error", phoneInput);
}

function setContactFormMsg(message) {
  setText("contactFormMsg", message || "");
}

function clearContactInputError(input) {
  if (input) input.classList.remove("input-error");
}

function validateContactForm(inputs, values) {
  clearContactFormErrors(inputs);
  const errors = getContactFieldErrors(values);
  if (Object.keys(errors).length === 0) return true;
  applyContactFieldErrors(inputs, errors);
  return false;
}

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

function applyContactFieldErrors(inputs, errors) {
  if (errors.name) {
    setContactFieldError("contact-name-error", errors.name, inputs.nameInput);
  }
  if (errors.email) {
    setContactFieldError("contact-email-error", errors.email, inputs.emailInput);
  }
  if (errors.phone) {
    setContactFieldError("contact-phone-error", errors.phone, inputs.phoneInput);
  }
}

function getPhoneDigitsCount(value) {
  return String(value || "").replace(/\D/g, "").length;
}

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

function validateContactLength(input, max, errorId, label) {
  const value = input?.value || "";
  if (!value) return clearContactFieldError(errorId, input);
  if (value.length <= max) return clearContactFieldError(errorId, input);
  setContactFieldError(errorId, `${label} is too long (max ${max} characters).`, input);
}

function validatePhoneDigits(input, min, max, errorId) {
  const digits = getPhoneDigitsCount(input?.value || "");
  if (!digits) return clearContactFieldError(errorId, input);
  if (digits > max) {
    return setContactFieldError(errorId, `Between ${min} and ${max} digits required.`, input);
  }
  return clearContactFieldError(errorId, input);
}

function setContactFieldError(errorId, message, input) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.classList.toggle("is-visible", Boolean(message));
  if (input) input.classList.toggle("input-error", Boolean(message));
}

function clearContactFieldError(errorId, input) {
  setContactFieldError(errorId, "", input);
}

function getContactFormInputs(form) {
  const nameInput = form.querySelector("#contact-name");
  const emailInput = form.querySelector("#contact-email");
  const phoneInput = form.querySelector("#contact-phone");
  const submitBtn = form.querySelector("button[type=\"submit\"]");
  if (!nameInput || !emailInput || !phoneInput || !submitBtn) return null;
  return { nameInput, emailInput, phoneInput, submitBtn };
}

function setContactSubmitBusy({ submitBtn }, busy) {
  if (!submitBtn) return;
  submitBtn.disabled = Boolean(busy);
}
