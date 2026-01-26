const $ = (id) => getElementById(id);

function initAnimation() {
  const img = document.getElementById("img_animation");
  const bg = document.getElementById("bg");
  if (!img || !bg) return;
  if (sessionStorage.getItem("animationShown") === "true") {
    skipAnimation(img, bg);
    return;
  }
  sessionStorage.setItem("animationShown", "true");
  if (window.innerWidth <= 480) img.src = "./assets/img/Capa%201.png";
  setTimeout(() => startAnimation(img, bg), 200);
}

function startAnimation(img, bg) {
  if (!img || !bg) return;
  img.classList.add("animated");
  bg.classList.add("bg-animated");
  if (window.innerWidth <= 480) {
    setTimeout(() => {
      img.src = "./assets/img/homepage_join.png";
    }, 500);
  }
  setTimeout(() => {
    bg.style.display = "none";
  }, 500);
}

function skipAnimation(img, bg) {
  if (!img || !bg) return;
  img.src = "./assets/img/homepage_join.png";
  if (window.innerWidth <= 480) {
    img.style.top = "30px";
    img.style.left = "30px";
  } else {
    img.style.top = "73px";
    img.style.left = "77px";
  }
  img.style.transform = "translate(0, 0) scale(1)";
  bg.style.display = "none";
}

function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.style.display = "flex";
}



function showLoginErrorState(emailInput, passwordInput) {
  showFieldError("email-error", "Invalid email address or password", emailInput);
  showFieldError("password-error", "Invalid email address or password", passwordInput);
}

function clearLoginErrorState(emailInput, passwordInput) {
  emailInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
}

function wireLoginErrorHandlers({ emailInput, passwordInput }) {
  const clear = () => clearLoginErrorState(emailInput, passwordInput);
  emailInput.addEventListener("input", () => clearFieldError("email-error", emailInput));
  passwordInput.addEventListener("input", () => clearFieldError("password-error", passwordInput));
  emailInput.addEventListener("blur", () => validateFieldWithAutoDismiss(emailInput, "email-error", validateEmailField));
  passwordInput.addEventListener("blur", () => validateFieldWithAutoDismiss(passwordInput, "password-error", validateLoginPasswordField));
}

function validateLoginInputs({ emailInput, passwordInput }) {
  clearLoginErrorState(emailInput, passwordInput);
  let valid = true;
  if (!validateLoginEmailField(emailInput, "email-error")) valid = false;
  if (!validateLoginPasswordField(passwordInput, "password-error")) valid = false;
  return valid;
}

function setLoginBusy({ loginButton }, busy) {
  if (!loginButton) return;
  loginButton.disabled = busy;
}

function showSignupErrorState(passwordInput, confirmPasswordInput, message) {
  passwordInput.classList.add("input-error");
  confirmPasswordInput.classList.add("input-error");
}

function clearSignupErrorState(passwordInput, confirmPasswordInput) {
  passwordInput.classList.remove("input-error");
  confirmPasswordInput.classList.remove("input-error");
}

function wireSignupErrorHandlers({ nameInput, emailInput, passwordInput, confirmPasswordInput, policyCheckbox }) {
  const clear = () => clearSignupErrorState(passwordInput, confirmPasswordInput);
  nameInput.addEventListener("input", () => clearFieldError("username-error", nameInput));
  emailInput.addEventListener("input", () => clearFieldError("signUpEmail-error", emailInput));
  passwordInput.addEventListener("input", () => clearFieldError("signUpPassword-error", passwordInput));
  confirmPasswordInput.addEventListener("input", () => clearFieldError("signUpConfirmPassword-error", confirmPasswordInput));
  policyCheckbox?.addEventListener("change", () => clearFieldError("signUpPolicy-error", policyCheckbox));
  nameInput.addEventListener("blur", () => validateFieldWithAutoDismiss(nameInput, "username-error", validateUsernameField));
  emailInput.addEventListener("blur", () => handleSignupEmailBlur(emailInput));
  passwordInput.addEventListener("blur", () => validateFieldWithAutoDismiss(passwordInput, "signUpPassword-error", validatePasswordField));
  confirmPasswordInput.addEventListener("blur", () => validateFieldWithAutoDismiss(passwordInput, confirmPasswordInput, "signUpConfirmPassword-error", validateConfirmPasswordField));
}

function validateSignupInputs({ nameInput, emailInput, passwordInput, confirmPasswordInput, policyCheckbox }) {
  clearSignupErrorState(passwordInput, confirmPasswordInput);
  clearFieldError("signUpPolicy-error", policyCheckbox);
  let valid = true;
  if (!validateUsernameField(nameInput, "username-error")) valid = false;
  if (!validateEmailField(emailInput, "signUpEmail-error")) valid = false;
  if (!validatePasswordField(passwordInput, "signUpPassword-error")) valid = false;
  if (!validateConfirmPasswordField(passwordInput, confirmPasswordInput, "signUpConfirmPassword-error")) valid = false;
  if (!policyCheckbox.checked) {
    showFieldError("signUpPolicy-error", "Please accept the Privacy Policy.", policyCheckbox);
    valid = false;
  }
  return valid;
}

function validateFieldWithAutoDismiss(arg1, arg2, arg3, arg4) {
  if (typeof arg4 === "function") return arg4(arg1, arg2, arg3);
  if (typeof arg3 === "function") return arg3(arg1, arg2);
  return false;
}

function showSignupRequiredError(passwordInput, confirmPasswordInput) {
  showFieldError("signUpPassword-error", "Please complete all required fields.", passwordInput);
  showFieldError("signUpConfirmPassword-error", "Please complete all required fields.", confirmPasswordInput);
  return false;
}

function showSignupPolicyError(passwordInput, confirmPasswordInput) {
  showFieldError("signUpPolicy-error", "Please accept the Privacy Policy.", document.getElementById("signUpPolicy"));
  return false;
}

async function handleSignupEmailBlur(emailInput) {
  if (!validateEmailField(emailInput, "signUpEmail-error")) return;
  await checkDuplicateEmail(emailInput);
}

async function checkDuplicateEmail(emailInput) {
  const email = emailInput.value.trim();
  if (!email) return false;
  const users = await loadUsers();
  const exists = users.some((u) => u.email === email);
  if (exists) showFieldError("signUpEmail-error", "This email is already registered.", emailInput);
  else clearFieldError("signUpEmail-error", emailInput);
  return exists;
}

function wireSignupButtonState(state) {
  const update = () => setSignupButtonState(state);
  [state.nameInput, state.emailInput, state.passwordInput, state.confirmPasswordInput].forEach((el) => el.addEventListener("input", update));
  state.policyCheckbox.addEventListener("change", update);
  update();
}

function setSignupButtonState({ nameInput, emailInput, passwordInput, confirmPasswordInput, policyCheckbox, signUpButton }) {
  signUpButton.disabled = !(
    nameInput.value.trim() &&
    emailInput.value.trim() &&
    passwordInput.value.trim() &&
    confirmPasswordInput.value.trim() &&
    policyCheckbox.checked
  );
}

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

function getUsernameValidationError(value) {
  if (!value) return "Username is required.";
  if (value.length < 2) return "Username must be at least 2 characters.";
  if (!/^[a-zA-Z]/.test(value)) return "Username must start with a letter.";
  if (/\s{2,}/.test(value)) return "Username cannot contain multiple consecutive spaces.";
  if (!/^[a-zA-Z][a-zA-Z0-9_\- ]*$/.test(value)) return "Username can only contain letters, numbers, single spaces, _ and -.";
  return null;
}

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

function validatePasswordField(inputEl, errorId) {
  const value = inputEl.value.trim();
  const error = getPasswordValidationError(value);
  return applyPasswordValidationResult(errorId, inputEl, error);
}

function getPasswordValidationError(value) {
  if (!value) return "Password is required.";
  if (value.length < 4) return "Password must be at least 4 characters.";
  if (/\s/.test(value)) return "Password cannot contain spaces.";
  return "";
}

function applyPasswordValidationResult(errorId, inputEl, error) {
  if (error) {
    showFieldError(errorId, error, inputEl);
    return false;
  }
  clearFieldError(errorId, inputEl);
  return true;
}

function validateLoginPasswordField(inputEl, errorId) {
  const value = inputEl.value.trim();
  if (!value) {
    showFieldError(errorId, "Password is required.", inputEl);
    return false;
  }
  return true;
}

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

function showFieldError(errorId, message, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.classList.add("show");  // Klasse zum Einblenden
  inputEl.classList.add("input-error");
}


function wireLoginErrorHandlers({ emailInput, passwordInput }) {

  // Fehler beim Tippen entfernen
  emailInput.addEventListener("input", () =>
    clearFieldError("email-error", emailInput)
  );

  passwordInput.addEventListener("input", () =>
    clearFieldError("password-error", passwordInput)
  );

  // Fehler beim Verlassen anzeigen
  emailInput.addEventListener("blur", () =>
    validateLoginEmailField(emailInput, "email-error")
  );

  passwordInput.addEventListener("blur", () =>
    validateLoginPasswordField(passwordInput, "password-error")
  );
}


function clearFieldError(errorId, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;

  // Ausblenden: durch Entfernen der Klasse
  errorEl.classList.remove("show");

  errorEl.textContent = "";
  inputEl.classList.remove("input-error");
}


function setSignupBusy(state, busy) {
  if (!state.signUpButton) return;
  if (busy) return void (state.signUpButton.disabled = true);
  setSignupButtonState(state);
}



