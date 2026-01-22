/* ================== HELPERS ================== */
/**
 * Short-hand to access an element by id.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
const $ = (id) => getElementById(id);


/* ================== ANIMATION ================== */
/**
 * Initializes the logo animation with session storage check.
 * @returns {void}
 */
function initAnimation() {
  const img = document.getElementById("img_animation");
  const bg = document.getElementById("bg");

  if (!img || !bg) return;

  if (sessionStorage.getItem('animationShown') === 'true') {
    skipAnimation(img, bg);
    return;
  }

  sessionStorage.setItem('animationShown', 'true');

  if (window.innerWidth <= 480) {
    img.src = "./assets/img/Capa%201.png";
  }

  setTimeout(() => {
    startAnimation(img, bg);
  }, 200);
}

/**
 * Executes the logo animation.
 * @param {HTMLElement} img
 * @param {HTMLElement} bg
 * @returns {void}
 */
function startAnimation(img, bg) {
  if (!img || !bg) return;

  img.classList.add("animiert");
  bg.classList.add("bg-animiert");

  if (window.innerWidth <= 480) {
    setTimeout(() => {
      img.src = "./assets/img/homepage_join.png";
    }, 500);
  }

  setTimeout(() => {
    bg.style.display = "none";
  }, 500);
}


/**
 * Skips animation and shows final state directly.
 * @param {HTMLElement} img
 * @param {HTMLElement} bg
 * @returns {void}
 */
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



/* ================== OVERLAY ================== */
/**
 * Shows the success overlay.
 * @returns {void}
 */
function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.style.display = "flex";
}


/* ================== LOGIN UI ================== */
/**
 * Shows login error state with an optional message.
 * @param {HTMLInputElement} emailEl
 * @param {HTMLInputElement} pwEl
 * @param {string} message
 * @returns {void}
 */
function showLoginErrorState(emailEl, pwEl, message = "Invalid email address or password") {
  if (message) showErrorToast(message);
  emailEl.classList.add("input-error");
  pwEl.classList.add("input-error");
}


/**
 * Clears login error state.
 * @param {HTMLInputElement} emailEl
 * @param {HTMLInputElement} pwEl
 * @returns {void}
 */
function clearLoginErrorState(emailEl, pwEl) {
  emailEl.classList.remove("input-error");
  pwEl.classList.remove("input-error");
}


/**
 * Wires login error state clearing on input.
 * @param {{emailEl: HTMLInputElement, pwEl: HTMLInputElement}} state
 * @returns {void}
 */
function wireLoginErrorHandlers({ emailEl, pwEl }) {
  const clear = () => clearLoginErrorState(emailEl, pwEl);
  emailEl.addEventListener("input", () => clearFieldError("email-error", emailEl));
  pwEl.addEventListener("input", () => clearFieldError("password-error", pwEl));
  emailEl.addEventListener("blur", () => validateFieldWithAutoDismiss(emailEl, "email-error", validateEmailField));
  pwEl.addEventListener("blur", () => validateFieldWithAutoDismiss(pwEl, "password-error", validateLoginPasswordField));
}


/**
 * Validates login inputs and shows errors.
 * @param {{emailEl: HTMLInputElement, pwEl: HTMLInputElement}} state
 * @returns {boolean}
 */
function validateLoginInputs({ emailEl, pwEl }) {
  clearLoginErrorState(emailEl, pwEl);
  let valid = true;
  if (!validateEmailField(emailEl, "email-error")) valid = false;
  if (!validateLoginPasswordField(pwEl, "password-error")) valid = false;
  return valid;
}


/**
 * Toggles login button busy state.
 * @param {{btnLogin: HTMLButtonElement}} state
 * @param {boolean} busy
 * @returns {void}
 */
function setLoginBusy({ btnLogin }, busy) {
  if (!btnLogin) return;
  btnLogin.disabled = busy;
}


/* ================== SIGNUP UI ================== */
/**
 * Shows signup error state with an optional message.
 * @param {HTMLInputElement} pwEl
 * @param {HTMLInputElement} pw2El
 * @param {string} message
 * @returns {void}
 */
function showSignupErrorState(pwEl, pw2El, message) {
  if (message) showErrorToast(message);
  pwEl.classList.add("input-error");
  pw2El.classList.add("input-error");
}


/**
 * Clears signup error state.
 * @param {HTMLInputElement} pwEl
 * @param {HTMLInputElement} pw2El
 * @returns {void}
 */
function clearSignupErrorState(pwEl, pw2El) {
  pwEl.classList.remove("input-error");
  pw2El.classList.remove("input-error");
}


/**
 * Wires signup error state clearing.
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement}} state
 * @returns {void}
 */
function wireSignupErrorHandlers({ nameEl, emailEl, pwEl, pw2El }) {
  const clear = () => clearSignupErrorState(pwEl, pw2El);
  nameEl.addEventListener("input", () => clearFieldError("username-error", nameEl));
  emailEl.addEventListener("input", () => clearFieldError("suEmail-error", emailEl));
  pwEl.addEventListener("input", () => clearFieldError("suPw-error", pwEl));
  pw2El.addEventListener("input", () => clearFieldError("suPw2-error", pw2El));
  nameEl.addEventListener("blur", () => validateFieldWithAutoDismiss(nameEl, "username-error", validateUsernameField));
  emailEl.addEventListener("blur", () => validateFieldWithAutoDismiss(emailEl, "suEmail-error", validateEmailField));
  pwEl.addEventListener("blur", () => validateFieldWithAutoDismiss(pwEl, "suPw-error", validatePasswordField));
  pw2El.addEventListener("blur", () => validateFieldWithAutoDismiss(pwEl, pw2El, "suPw2-error", validateConfirmPasswordField));
}


/**
 * Validates signup inputs and shows errors.
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement}} state
 * @returns {boolean}
 */
function validateSignupInputs({ nameEl, emailEl, pwEl, pw2El, policyEl }) {
  clearSignupErrorState(pwEl, pw2El);
  let valid = true;
  if (!validateUsernameField(nameEl, "username-error")) valid = false;
  if (!validateEmailField(emailEl, "suEmail-error")) valid = false;
  if (!validatePasswordField(pwEl, "suPw-error")) valid = false;
  if (!validateConfirmPasswordField(pwEl, pw2El, "suPw2-error")) valid = false;
  if (!policyEl.checked) {
    showSignupErrorState(pwEl, pw2El, "Please accept the Privacy Policy.");
    return false;
  }
  return valid;
}


/**
 * Shows required-field error for signup.
 * @param {HTMLInputElement} pwEl
 * @param {HTMLInputElement} pw2El
 * @returns {boolean}
 */
function showSignupRequiredError(pwEl, pw2El) {
  showSignupErrorState(pwEl, pw2El, "Please complete all required fields.");
  return false;
}


/**
 * Shows policy checkbox error for signup.
 * @param {HTMLInputElement} pwEl
 * @param {HTMLInputElement} pw2El
 * @returns {boolean}
 */
function showSignupPolicyError(pwEl, pw2El) {
  showSignupErrorState(pwEl, pw2El, "Please accept the Privacy Policy.");
  return false;
}


/**
 * Wires signup button enabled state.
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement, btn: HTMLButtonElement}} state
 * @returns {void}
 */
function wireSignupButtonState(state) {
  const update = () => setSignupButtonState(state);
  [state.nameEl, state.emailEl, state.pwEl, state.pw2El].forEach((el) => el.addEventListener("input", update));
  state.policyEl.addEventListener("change", update);
  update();
}


/**
 * Sets signup button disabled state based on inputs.
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement, btn: HTMLButtonElement}} state
 * @returns {void}
 */
function setSignupButtonState({ nameEl, emailEl, pwEl, pw2El, policyEl, btn }) {
  btn.disabled = !(
    nameEl.value.trim() &&
    emailEl.value.trim() &&
    pwEl.value.trim() &&
    pw2El.value.trim() &&
    policyEl.checked
  );
}


/* ================== FIELD VALIDATION ================== */
/**
 * Validates username field.
 * @param {HTMLInputElement} inputEl
 * @param {string} errorId
 * @returns {boolean}
 */
function validateUsernameField(inputEl, errorId) {
  const value = inputEl.value.trim();
  if (!value) {
    showFieldError(errorId, "Username is required.", inputEl);
    return false;
  }
  if (value.length < 2) {
    showFieldError(errorId, "Username must be at least 2 characters.", inputEl);
    return false;
  }
  if (!/^[a-zA-Z]/.test(value)) {
    showFieldError(errorId, "Username must start with a letter.", inputEl);
    return false;
  }
  if (/\s{2,}/.test(value)) {
    showFieldError(errorId, "Username cannot contain multiple consecutive spaces.", inputEl);
    return false;
  }
  if (!/^[a-zA-Z][a-zA-Z0-9_\- ]*$/.test(value)) {
    showFieldError(errorId, "Username can only contain letters, numbers, single spaces, _ and -.", inputEl);
    return false;
  }
  clearFieldError(errorId, inputEl);
  return true;
}


/**
 * Validates email field.
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
 * Validates password field.
 * @param {HTMLInputElement} inputEl
 * @param {string} errorId
 * @returns {boolean}
 */
function validatePasswordField(inputEl, errorId) {
  const value = inputEl.value.trim();
  if (!value) {
    showFieldError(errorId, "Password is required.", inputEl);
    return false;
  }
  if (value.length < 4) {
    showFieldError(errorId, "Password must be at least 4 characters.", inputEl);
    return false;
  }
  if (/\s/.test(value)) {
    showFieldError(errorId, "Password cannot contain spaces.", inputEl);
    return false;
  }
  clearFieldError(errorId, inputEl);
  return true;
}


/**
 * Validates password field for login (only checks if not empty).
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
  clearFieldError(errorId, inputEl);
  return true;
}


/**
 * Validates confirm password field.
 * @param {HTMLInputElement} pwEl
 * @param {HTMLInputElement} pw2El
 * @param {string} errorId
 * @returns {boolean}
 */
function validateConfirmPasswordField(pwEl, pw2El, errorId) {
  const value = pw2El.value.trim();
  if (!value) {
    showFieldError(errorId, "Please confirm your password.", pw2El);
    return false;
  }
  if (value !== pwEl.value.trim()) {
    showFieldError(errorId, "Passwords don't match.", pw2El);
    return false;
  }
  clearFieldError(errorId, pw2El);
  return true;
}


/**
 * Shows field error message.
 * @param {string} errorId
 * @param {string} message
 * @param {HTMLInputElement} inputEl
 * @returns {void}
 */
function showFieldError(errorId, message, inputEl) {
  showErrorToast(message);
  inputEl.classList.add("input-error");
}


/**
 * Validates field with auto-dismiss after 3 seconds.
 * @param {...any} args
 * @returns {boolean}
 */
function validateFieldWithAutoDismiss(...args) {
  const validationFn = args.length === 3 ? args[2] : args[3];
  return validationFn(...args);
}


/**
 * Clears field error message.
 * @param {string} errorId
 * @param {HTMLInputElement} inputEl
 * @returns {void}
 */
function clearFieldError(errorId, inputEl) {
  inputEl.classList.remove("input-error");
}


/**
 * Toggles signup button busy state.
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement, btn: HTMLButtonElement}} state
 * @param {boolean} busy
 * @returns {void}
 */
function setSignupBusy(state, busy) {
  if (!state.btn) return;
  if (busy) return void (state.btn.disabled = true);
  setSignupButtonState(state);
}
