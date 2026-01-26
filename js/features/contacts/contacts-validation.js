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

const CONTACT_NAME_MAX = 50;
const CONTACT_EMAIL_MAX = 50;

function validateContactLength(input, max, errorId, label) {
  const value = input?.value || "";
  if (!value) return clearContactFieldError(errorId, input);
  if (value.length < max) return clearContactFieldError(errorId, input);
  setContactFieldError(errorId, `${label} is too long (max ${max} characters).`, input);
}

function setContactFieldError(errorId, message, input) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.style.display = message ? "block" : "none";
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
