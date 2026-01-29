/**
 * Shows the login error state.
 * @param {HTMLInputElement} emailInput
 * @param {HTMLInputElement} passwordInput
 */
function showLoginErrorState(emailInput, passwordInput) {
  showFieldError(
    "email-error",
    "Invalid email address or password",
    emailInput,
  );
  showFieldError(
    "password-error",
    "Invalid email address or password",
    passwordInput,
  );
}

/**
 * Clears the login error state.
 * @param {HTMLInputElement} emailInput
 * @param {HTMLInputElement} passwordInput
 */
function clearLoginErrorState(emailInput, passwordInput) {
  emailInput?.classList.remove("input-error");
  passwordInput?.classList.remove("input-error");
}

/**
 * Validates login inputs.
 * @param {Object} fields
 * @returns {boolean}
 */
function validateLoginInputs({ emailInput, passwordInput }) {
  clearLoginErrorState(emailInput, passwordInput);
  let valid = true;
  if (!validateLoginEmailField(emailInput, "email-error")) valid = false;
  if (!validateLoginPasswordField(passwordInput, "password-error"))
    valid = false;
  return valid;
}

/**
 * Shows the signup error state.
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLInputElement} confirmPasswordInput
 */
function showSignupErrorState(passwordInput, confirmPasswordInput) {
  passwordInput?.classList.add("input-error");
  confirmPasswordInput?.classList.add("input-error");
}

/**
 * Clears the signup error state.
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLInputElement} confirmPasswordInput
 */
function clearSignupErrorState(passwordInput, confirmPasswordInput) {
  passwordInput?.classList.remove("input-error");
  confirmPasswordInput?.classList.remove("input-error");
}

/**
 * Validates signup inputs.
 * @param {Object} fields
 * @returns {boolean}
 */
function validateSignupInputs({
  nameInput,
  emailInput,
  passwordInput,
  confirmPasswordInput,
  policyCheckbox,
}) {
  clearSignupErrorState(passwordInput, confirmPasswordInput);
  clearFieldError("sign-up-policy-error", policyCheckbox);
  let valid = true;
  if (!validateUsernameField(nameInput, "username-error")) valid = false;
  if (!validateEmailField(emailInput, "sign-up-email-error")) valid = false;
  if (!validatePasswordField(passwordInput, "sign-up-password-error"))
    valid = false;
  if (
    !validateConfirmPasswordField(
      passwordInput,
      confirmPasswordInput,
      "sign-up-confirm-password-error",
    )
  )
    valid = false;
  if (!policyCheckbox.checked) {
    showFieldError(
      "sign-up-policy-error",
      "Please accept the Privacy Policy.",
      policyCheckbox,
    );
    valid = false;
  }
  return valid;
}

/**
 * Runs a validator with optional auto-dismiss handler.
 * @param {any} arg1
 * @param {any} arg2
 * @param {any} arg3
 * @param {Function} arg4
 * @returns {boolean}
 */
function validateFieldWithAutoDismiss(arg1, arg2, arg3, arg4) {
  if (typeof arg4 === "function") return arg4(arg1, arg2, arg3);
  if (typeof arg3 === "function") return arg3(arg1, arg2);
  return false;
}

/**
 * Shows required field errors for signup.
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLInputElement} confirmPasswordInput
 * @returns {boolean}
 */
function showSignupRequiredError(passwordInput, confirmPasswordInput) {
  showFieldError(
    "sign-up-password-error",
    "Please complete all required fields.",
    passwordInput,
  );
  showFieldError(
    "sign-up-confirm-password-error",
    "Please complete all required fields.",
    confirmPasswordInput,
  );
  return false;
}

/**
 * Shows policy errors for signup.
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLInputElement} confirmPasswordInput
 * @returns {boolean}
 */
function showSignupPolicyError(passwordInput, confirmPasswordInput) {
  showFieldError(
    "sign-up-policy-error",
    "Please accept the Privacy Policy.",
    document.getElementById("sign-up-policy"),
  );
  return false;
}

/**
 * Handles email blur for signup.
 * @param {HTMLInputElement} emailInput
 */
async function handleSignupEmailBlur(emailInput) {
  if (!validateEmailField(emailInput, "sign-up-email-error")) return;
  await checkDuplicateEmail(emailInput);
}

/**
 * Checks if the email already exists.
 * @param {HTMLInputElement} emailInput
 * @returns {Promise<boolean>}
 */
async function checkDuplicateEmail(emailInput) {
  const email = emailInput.value.trim();
  if (!email) return false;
  const users = await loadUsers();
  const exists = users.some((u) => u.email === email);
  if (exists)
    showFieldError(
      "sign-up-email-error",
      "This email is already registered.",
      emailInput,
    );
  else clearFieldError("sign-up-email-error", emailInput);
  return exists;
}

/**
 * Validates the username field.
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
 * Gets the username validation error.
 * @param {string} value
 * @returns {string|null}
 */
function getUsernameValidationError(value) {
  if (!value) return "Username is required.";
  if (value.length < 2) return "Username must be at least 2 characters.";
  if (!/^[a-zA-Z]/.test(value)) return "Username must start with a letter.";
  if (/\s{2,}/.test(value))
    return "Username cannot contain multiple consecutive spaces.";
  if (!/^[a-zA-Z][a-zA-Z0-9_\- ]*$/.test(value)) {
    return "Username can only contain letters, numbers, single spaces, _ and -.";
  }
  return null;
}

/**
 * Validates the signup email field.
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
 * Validates the login email field.
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
 * Validates the password field.
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
 * Gets the password validation error.
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
 * Applies the password validation result.
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
 * Validates the login password field.
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
 * Validates the confirm password field.
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLInputElement} confirmPasswordInput
 * @param {string} errorId
 * @returns {boolean}
 */
function validateConfirmPasswordField(
  passwordInput,
  confirmPasswordInput,
  errorId,
) {
  const value = confirmPasswordInput.value.trim();
  if (!value) {
    showFieldError(
      errorId,
      "Please confirm your password.",
      confirmPasswordInput,
    );
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
 * Shows a field error.
 * @param {string} errorId
 * @param {string} message
 * @param {HTMLElement} inputEl
 */
function showFieldError(errorId, message, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.classList.add("show");
  inputEl?.classList.add("input-error");
}

/**
 * Clears a field error.
 * @param {string} errorId
 * @param {HTMLElement} inputEl
 */
function clearFieldError(errorId, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.classList.remove("show");
  errorEl.textContent = "";
  inputEl?.classList.remove("input-error");
}
