/**
 * Show login error state for email and password.
 * @param {HTMLInputElement|null} emailInput
 * @param {HTMLInputElement|null} passwordInput
 * @returns {void}
 */
function showLoginErrorState(emailInput, passwordInput) {
  showFieldError("email-error", "Invalid email address or password", emailInput);
  showFieldError("password-error", "Invalid email address or password", passwordInput);
}


/**
 * Clear login error state for email and password.
 * @param {HTMLInputElement|null} emailInput
 * @param {HTMLInputElement|null} passwordInput
 * @returns {void}
 */
function clearLoginErrorState(emailInput, passwordInput) {
  emailInput?.classList.remove("input-error");
  passwordInput?.classList.remove("input-error");
}


/**
 * Validate login inputs.
 * @param {{emailInput: HTMLInputElement, passwordInput: HTMLInputElement}} param0
 * @returns {boolean}
 */
function validateLoginInputs({ emailInput, passwordInput }) {
  clearLoginErrorState(emailInput, passwordInput);
  let valid = true;
  if (!validateLoginEmailField(emailInput, "email-error")) valid = false;
  if (!validateLoginPasswordField(passwordInput, "password-error")) valid = false;
  return valid;
}


/**
 * Show signup error state for passwords.
 * @param {HTMLInputElement|null} passwordInput
 * @param {HTMLInputElement|null} confirmPasswordInput
 * @returns {void}
 */
function showSignupErrorState(passwordInput, confirmPasswordInput) {
  passwordInput?.classList.add("input-error");
  confirmPasswordInput?.classList.add("input-error");
}


/**
 * Clear signup error state for passwords.
 * @param {HTMLInputElement|null} passwordInput
 * @param {HTMLInputElement|null} confirmPasswordInput
 * @returns {void}
 */
function clearSignupErrorState(passwordInput, confirmPasswordInput) {
  passwordInput?.classList.remove("input-error");
  confirmPasswordInput?.classList.remove("input-error");
}


/**
 * Validate signup inputs.
 * @param {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement, policyCheckbox: HTMLInputElement}} param0
 * @returns {boolean}
 */
function validateSignupInputs({ nameInput, emailInput, passwordInput, confirmPasswordInput, policyCheckbox }) {
  clearSignupErrorState(passwordInput, confirmPasswordInput);
  clearFieldError("sign-up-policy-error", policyCheckbox);
  let valid = true;
  if (!validateUsernameField(nameInput, "username-error")) valid = false;
  if (!validateEmailField(emailInput, "sign-up-email-error")) valid = false;
  if (!validatePasswordField(passwordInput, "sign-up-password-error")) valid = false;
  if (!validateConfirmPasswordField(passwordInput, confirmPasswordInput, "sign-up-confirm-password-error")) {
    valid = false;
  }
  if (!policyCheckbox.checked) {
    showFieldError("sign-up-policy-error", "Please accept the Privacy Policy.", policyCheckbox);
    valid = false;
  }
  return valid;
}


/**
 * Validate a field with a variable signature.
 * @param {unknown} arg1
 * @param {unknown} arg2
 * @param {unknown} arg3
 * @param {unknown} arg4
 * @returns {boolean}
 */
function validateFieldWithAutoDismiss(arg1, arg2, arg3, arg4) {
  if (typeof arg4 === "function") return arg4(arg1, arg2, arg3);
  if (typeof arg3 === "function") return arg3(arg1, arg2);
  return false;
}


/**
 * Show required error for signup passwords.
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLInputElement} confirmPasswordInput
 * @returns {boolean}
 */
function showSignupRequiredError(passwordInput, confirmPasswordInput) {
  showFieldError("sign-up-password-error", "Please complete all required fields.", passwordInput);
  showFieldError(
    "sign-up-confirm-password-error",
    "Please complete all required fields.",
    confirmPasswordInput
  );
  return false;
}


/**
 * Show policy error for signup.
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLInputElement} confirmPasswordInput
 * @returns {boolean}
 */
function showSignupPolicyError(passwordInput, confirmPasswordInput) {
  showFieldError("sign-up-policy-error", "Please accept the Privacy Policy.", document.getElementById("sign-up-policy"));
  return false;
}


/**
 * Handle signup email blur and duplicate check.
 * @param {HTMLInputElement} emailInput
 * @returns {Promise<void>}
 */
async function handleSignupEmailBlur(emailInput) {
  if (!validateEmailField(emailInput, "sign-up-email-error")) return;
  await checkDuplicateEmail(emailInput);
}


/**
 * Check if a signup email already exists.
 * @param {HTMLInputElement} emailInput
 * @returns {Promise<boolean>}
 */
async function checkDuplicateEmail(emailInput) {
  const email = emailInput.value.trim();
  if (!email) return false;
  const users = await loadUsers();
  const exists = users.some((u) => u.email === email);
  if (exists) showFieldError("sign-up-email-error", "This email is already registered.", emailInput);
  else clearFieldError("sign-up-email-error", emailInput);
  return exists;
}


/**
 * Validate username field.
 * @param {HTMLInputElement} inputEl
 * @param {string} errorId
 * @returns {boolean}
 */
function validateUsernameField(inputEl, errorId) {
  const value = inputEl.value.trim();
  const error = getUsernameValidationError(value);
  if (error) {
    showFieldError(errorId, error, inputEl);
    return false;
  }
  clearFieldError(errorId, inputEl);
  return true;
}


/**
 * Get username validation error message.
 * @param {string} value
 * @returns {string|null}
 */
function getUsernameValidationError(value) {
  if (!value) return "Username is required.";
  if (value.length < 2) return "Username must be at least 2 characters.";
  if (!/^[a-zA-Z]/.test(value)) return "Username must start with a letter.";
  if (/\s{2,}/.test(value)) return "Username cannot contain multiple consecutive spaces.";
  if (!/^[a-zA-Z][a-zA-Z0-9_\- ]*$/.test(value)) {
    return "Username can only contain letters, numbers, single spaces, _ and -.";
  }
  return null;
}


/**
 * Validate email field for signup.
 * @param {HTMLInputElement} inputEl
 * @param {string} errorId
 * @returns {boolean}
 */
function validateEmailField(inputEl, errorId) {
  const value = inputEl.value.trim();
  if (!value) {
    showFieldError(errorId, "Email is required.", inputEl);
    return false;
  }
  if (!isValidEmail(value)) {
    showFieldError(errorId, "Invalid email address.", inputEl);
    return false;
  }
  clearFieldError(errorId, inputEl);
  return true;
}


/**
 * Validate login email field.
 * @param {HTMLInputElement} inputEl
 * @param {string} errorId
 * @returns {boolean}
 */
function validateLoginEmailField(inputEl, errorId) {
  const value = inputEl.value.trim();
  if (!value) {
    showFieldError(errorId, "Email is required.", inputEl);
    return false;
  }
  if (!isValidEmail(value)) {
    showFieldError(errorId, "Invalid email address.", inputEl);
    return false;
  }
  return true;
}


/**
 * Validate password field for signup.
 * @param {HTMLInputElement} inputEl
 * @param {string} errorId
 * @returns {boolean}
 */
function validatePasswordField(inputEl, errorId) {
  const value = inputEl.value.trim();
  const error = getPasswordValidationError(value);
  return applyPasswordValidationResult(errorId, inputEl, error);
}


/**
 * Get password validation error message.
 * @param {string} value
 * @returns {string}
 */
function getPasswordValidationError(value) {
  if (!value) return "Password is required.";
  if (value.length < 4) return "Password must be at least 4 characters.";
  if (/\s/.test(value)) return "Password cannot contain spaces.";
  return "";
}


/**
 * Apply password validation result.
 * @param {string} errorId
 * @param {HTMLInputElement} inputEl
 * @param {string} error
 * @returns {boolean}
 */
function applyPasswordValidationResult(errorId, inputEl, error) {
  if (error) {
    showFieldError(errorId, error, inputEl);
    return false;
  }
  clearFieldError(errorId, inputEl);
  return true;
}


/**
 * Validate login password field.
 * @param {HTMLInputElement} inputEl
 * @param {string} errorId
 * @returns {boolean}
 */
function validateLoginPasswordField(inputEl, errorId) {
  const value = inputEl.value.trim();
  if (!value) {
    showFieldError(errorId, "Password is required.", inputEl);
    return false;
  }
  return true;
}


/**
 * Validate confirm password field.
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLInputElement} confirmPasswordInput
 * @param {string} errorId
 * @returns {boolean}
 */
function validateConfirmPasswordField(passwordInput, confirmPasswordInput, errorId) {
  const value = confirmPasswordInput.value.trim();
  if (!value) {
    showFieldError(errorId, "Please confirm your password.", confirmPasswordInput);
    return false;
  }
  if (value !== passwordInput.value.trim()) {
    showFieldError(errorId, "Passwords don't match.", confirmPasswordInput);
    return false;
  }
  clearFieldError(errorId, confirmPasswordInput);
  return true;
}


/**
 * Show a field error message.
 * @param {string} errorId
 * @param {string} message
 * @param {HTMLInputElement|null} inputEl
 * @returns {void}
 */
function showFieldError(errorId, message, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.classList.add("show");
  inputEl?.classList.add("input-error");
}


/**
 * Clear a field error message.
 * @param {string} errorId
 * @param {HTMLInputElement|null} inputEl
 * @returns {void}
 */
function clearFieldError(errorId, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.classList.remove("show");
  errorEl.textContent = "";
  inputEl?.classList.remove("input-error");
}
