/**
 * Contacts Validation Module
 * Handles form validation and error display
 */
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
  clearContactFieldError("contact-name-error", nameInput);
  clearContactFieldError("contact-email-error", emailInput);
  clearContactFieldError("contact-phone-error", phoneInput);
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
 * Validates contact form values and sets UI errors.
 * @param {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, phoneInput: HTMLInputElement}} inputs
 * @param {{name: string, email: string, phone: string}} values
 * @returns {boolean}
 */
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

const CONTACT_NAME_MAX = 50;
const CONTACT_EMAIL_MAX = 50;
const CONTACT_PHONE_MIN = 6;
const CONTACT_PHONE_MAX = 15;

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
 * Toggles submit button busy state.
 * @param {{submitBtn: HTMLButtonElement}} inputs
 * @param {boolean} busy
 * @returns {void}
 */
function setContactSubmitBusy({ submitBtn }, busy) {
  if (!submitBtn) return;
  submitBtn.disabled = Boolean(busy);
}
