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



function showLoginErrorState(emailEl, pwEl) {
  showFieldError("email-error", "Invalid email address or password", emailEl);
  showFieldError("password-error", "Invalid email address or password", pwEl);
}

function clearLoginErrorState(emailEl, pwEl) {
  emailEl.classList.remove("input-error");
  pwEl.classList.remove("input-error");
}

function wireLoginErrorHandlers({ emailEl, pwEl }) {
  const clear = () => clearLoginErrorState(emailEl, pwEl);
  emailEl.addEventListener("input", () => clearFieldError("email-error", emailEl));
  pwEl.addEventListener("input", () => clearFieldError("password-error", pwEl));
  emailEl.addEventListener("blur", () => validateFieldWithAutoDismiss(emailEl, "email-error", validateEmailField));
  pwEl.addEventListener("blur", () => validateFieldWithAutoDismiss(pwEl, "password-error", validateLoginPasswordField));
}

function validateLoginInputs({ emailEl, pwEl }) {
  clearLoginErrorState(emailEl, pwEl);
  let valid = true;
  if (!validateLoginEmailField(emailEl, "email-error")) valid = false;
  if (!validateLoginPasswordField(pwEl, "password-error")) valid = false;
  return valid;
}

function setLoginBusy({ btnLogin }, busy) {
  if (!btnLogin) return;
  btnLogin.disabled = busy;
}

function showSignupErrorState(pwEl, pw2El, message) {
  pwEl.classList.add("input-error");
  pw2El.classList.add("input-error");
}

function clearSignupErrorState(pwEl, pw2El) {
  pwEl.classList.remove("input-error");
  pw2El.classList.remove("input-error");
}

function wireSignupErrorHandlers({ nameEl, emailEl, pwEl, pw2El, policyEl }) {
  const clear = () => clearSignupErrorState(pwEl, pw2El);
  nameEl.addEventListener("input", () => clearFieldError("username-error", nameEl));
  emailEl.addEventListener("input", () => clearFieldError("suEmail-error", emailEl));
  pwEl.addEventListener("input", () => clearFieldError("suPw-error", pwEl));
  pw2El.addEventListener("input", () => clearFieldError("suPw2-error", pw2El));
  policyEl?.addEventListener("change", () => clearFieldError("suPolicy-error", policyEl));
  nameEl.addEventListener("blur", () => validateFieldWithAutoDismiss(nameEl, "username-error", validateUsernameField));
  emailEl.addEventListener("blur", () => handleSignupEmailBlur(emailEl));
  pwEl.addEventListener("blur", () => validateFieldWithAutoDismiss(pwEl, "suPw-error", validatePasswordField));
  pw2El.addEventListener("blur", () => validateFieldWithAutoDismiss(pwEl, pw2El, "suPw2-error", validateConfirmPasswordField));
}

function validateSignupInputs({ nameEl, emailEl, pwEl, pw2El, policyEl }) {
  clearSignupErrorState(pwEl, pw2El);
  clearFieldError("suPolicy-error", policyEl);
  let valid = true;
  if (!validateUsernameField(nameEl, "username-error")) valid = false;
  if (!validateEmailField(emailEl, "suEmail-error")) valid = false;
  if (!validatePasswordField(pwEl, "suPw-error")) valid = false;
  if (!validateConfirmPasswordField(pwEl, pw2El, "suPw2-error")) valid = false;
  if (!policyEl.checked) {
    showFieldError("suPolicy-error", "Please accept the Privacy Policy.", policyEl);
    valid = false;
  }
  return valid;
}

function validateFieldWithAutoDismiss(arg1, arg2, arg3, arg4) {
  if (typeof arg4 === "function") return arg4(arg1, arg2, arg3);
  if (typeof arg3 === "function") return arg3(arg1, arg2);
  return false;
}

function showSignupRequiredError(pwEl, pw2El) {
  showFieldError("suPw-error", "Please complete all required fields.", pwEl);
  showFieldError("suPw2-error", "Please complete all required fields.", pw2El);
  return false;
}

function showSignupPolicyError(pwEl, pw2El) {
  showFieldError("suPolicy-error", "Please accept the Privacy Policy.", document.getElementById("suPolicy"));
  return false;
}

async function handleSignupEmailBlur(emailEl) {
  if (!validateEmailField(emailEl, "suEmail-error")) return;
  await checkDuplicateEmail(emailEl);
}

async function checkDuplicateEmail(emailEl) {
  const email = emailEl.value.trim();
  if (!email) return false;
  const users = await loadUsers();
  const exists = users.some((u) => u.email === email);
  if (exists) showFieldError("suEmail-error", "This email is already registered.", emailEl);
  else clearFieldError("suEmail-error", emailEl);
  return exists;
}

function wireSignupButtonState(state) {
  const update = () => setSignupButtonState(state);
  [state.nameEl, state.emailEl, state.pwEl, state.pw2El].forEach((el) => el.addEventListener("input", update));
  state.policyEl.addEventListener("change", update);
  update();
}

function setSignupButtonState({ nameEl, emailEl, pwEl, pw2El, policyEl, btn }) {
  btn.disabled = !(
    nameEl.value.trim() &&
    emailEl.value.trim() &&
    pwEl.value.trim() &&
    pw2El.value.trim() &&
    policyEl.checked
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

function validateLoginPasswordField(inputEl, errorId) {
  const value = inputEl.value.trim();
  if (!value) {
    showFieldError(errorId, "Password is required.", inputEl);
    return false;
  }
  return true;
}

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

function showFieldError(errorId, message, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.classList.add("show");  // Klasse zum Einblenden
  inputEl.classList.add("input-error");
}


function wireLoginErrorHandlers({ emailEl, pwEl }) {

  // Fehler beim Tippen entfernen
  emailEl.addEventListener("input", () =>
    clearFieldError("email-error", emailEl)
  );

  pwEl.addEventListener("input", () =>
    clearFieldError("password-error", pwEl)
  );

  // Fehler beim Verlassen anzeigen
  emailEl.addEventListener("blur", () =>
    validateLoginEmailField(emailEl, "email-error")
  );

  pwEl.addEventListener("blur", () =>
    validateLoginPasswordField(pwEl, "password-error")
  );
}


function clearFieldError(errorId, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;

  // Ausblenden: durch Entfernen der Klasse
  errorEl.classList.remove("show");

  // Optional: Text nach Animation leeren, damit kein Flackern
  setTimeout(() => {
    errorEl.textContent = "";
  }, 300); // 300ms = Dauer der Transition
  inputEl.classList.remove("input-error");
}


function setSignupBusy(state, busy) {
  if (!state.btn) return;
  if (busy) return void (state.btn.disabled = true);
  setSignupButtonState(state);
}
