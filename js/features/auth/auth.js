const $ = (id) => getElementById(id);

function initAnimation() {
  const img = document.getElementById("img-animation");
  const bg = document.getElementById("bg");
  if (!img || !bg) return;
  if (sessionStorage.getItem("animationShown") === "true") {
    skipAnimation(img, bg);
    return;
  }
  sessionStorage.setItem("animationShown", "true");
  if (window.innerWidth <= 480) img.src = "./assets/img/capa-1.png";
  setTimeout(() => startAnimation(img, bg), 200);
}

function startAnimation(img, bg) {
  if (!img || !bg) return;
  img.classList.add("animated");
  bg.classList.add("bg-animated");
  if (window.innerWidth <= 480) {
    setTimeout(() => {
      img.src = "./assets/img/homepage-join.png";
    }, 500);
  }
  setTimeout(() => {
    bg.style.display = "none";
  }, 500);
}

function skipAnimation(img, bg) {
  if (!img || !bg) return;
  img.src = "./assets/img/homepage-join.png";
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
  const overlay = document.getElementById("success-overlay");
  if (overlay) overlay.style.display = "flex";
}

function wireLoginErrorHandlers({ emailInput, passwordInput }) {
  emailInput.addEventListener("input", () => clearFieldError("email-error", emailInput));
  passwordInput.addEventListener("input", () => clearFieldError("password-error", passwordInput));
  emailInput.addEventListener("blur", () => validateLoginEmailField(emailInput, "email-error"));
  passwordInput.addEventListener("blur", () => validateLoginPasswordField(passwordInput, "password-error"));
}

function wireSignupErrorHandlers({ nameInput, emailInput, passwordInput, confirmPasswordInput, policyCheckbox }) {
  nameInput.addEventListener("input", () => clearFieldError("username-error", nameInput));
  emailInput.addEventListener("input", () => clearFieldError("sign-up-email-error", emailInput));
  passwordInput.addEventListener("input", () => clearFieldError("sign-up-password-error", passwordInput));
  confirmPasswordInput.addEventListener("input", () => clearFieldError("sign-up-confirm-password-error", confirmPasswordInput));
  policyCheckbox?.addEventListener("change", () => clearFieldError("sign-up-policy-error", policyCheckbox));
  nameInput.addEventListener("blur", () => validateFieldWithAutoDismiss(nameInput, "username-error", validateUsernameField));
  emailInput.addEventListener("blur", () => handleSignupEmailBlur(emailInput));
  passwordInput.addEventListener("blur", () => validateFieldWithAutoDismiss(passwordInput, "sign-up-password-error", validatePasswordField));
  confirmPasswordInput.addEventListener("blur", () => validateFieldWithAutoDismiss(passwordInput, confirmPasswordInput, "sign-up-confirm-password-error", validateConfirmPasswordField));
}

function wireSignupButtonState(state) {
  const update = () => setSignupButtonState(state);
  [state.nameInput, state.emailInput, state.passwordInput, state.confirmPasswordInput].forEach((el) =>
    el.addEventListener("input", update)
  );
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

function setLoginBusy({ loginButton }, busy) {
  if (!loginButton) return;
  loginButton.disabled = busy;
}

function setSignupBusy(state, busy) {
  if (!state.signUpButton) return;
  if (busy) return void (state.signUpButton.disabled = true);
  setSignupButtonState(state);
}

async function saveCurrentUser(user) {
  setCurrentUser(user);
}

async function loadUsers() {
  try {
    const users = await UserService.getAll();
    return users ? Object.values(users) : [];
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

function initLogin() {
  const state = getLoginState();
  if (!state) return;
  wireLoginForm(state);
}

function getLoginState() {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login-button");
  const guestLoginButton = document.getElementById("guest-login-button");
  if (!form || !emailInput || !passwordInput || !loginButton) return null;
  return { form, emailInput, passwordInput, loginButton, guestLoginButton };
}

function wireLoginForm(state) {
  wireLoginErrorHandlers(state);
  wireLoginSubmit(state);
  wireGuestLogin(state);
  setupPasswordToggle("password", "password-lock-icon", "password-visibility-toggle");
}

function wireLoginSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleLoginSubmit(state);
  });
}

async function handleLoginSubmit(state) {
  if (!validateLoginInputs(state)) return;
  await runLogin(state);
}

async function runLogin(state) {
  setLoginBusy(state, true);
  try {
    await attemptLogin(state);
  } finally {
    setLoginBusy(state, false);
  }
}

async function attemptLogin({ emailInput, passwordInput }) {
  const email = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();
  const users = await loadUsers();
  if (!users || users.length === 0) {
    return showLoginErrorState(emailInput, passwordInput);
  }
  const found = users.find((u) => u.email === email && u.pw === passwordValue);
  if (!found) return showLoginErrorState(emailInput, passwordInput);
  await saveCurrentUser(found);
  window.location.href = ROUTES.SUMMARY;
}

function wireGuestLogin({ guestLoginButton }) {
  guestLoginButton?.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveCurrentUser({ name: "Guest", guest: true });
    window.location.href = ROUTES.SUMMARY;
  });
}

function initSignup() {
  const state = getSignupState();
  if (!state) return;
  wireSignupForm(state);
}

function getSignupState() {
  const form = document.getElementById("sign-up-form");
  const nameInput = document.getElementById("sign-up-name");
  const emailInput = document.getElementById("sign-up-email");
  const passwordInput = document.getElementById("sign-up-password");
  const confirmPasswordInput = document.getElementById("sign-up-confirm-password");
  const policyCheckbox = document.getElementById("sign-up-policy");
  const signUpButton = document.getElementById("sign-up-button");
  if (!form || !nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !policyCheckbox || !signUpButton) return null;
  return { form, nameInput, emailInput, passwordInput, confirmPasswordInput, policyCheckbox, signUpButton };
}

function wireSignupForm(state) {
  wireSignupButtonState(state);
  wireSignupErrorHandlers(state);
  wireSignupSubmit(state);
  wireSignupToggles();
}

function wireSignupSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSignupSubmit(state);
  });
}

async function handleSignupSubmit(state) {
  if (!validateSignupInputs(state)) return;
  if (await checkDuplicateEmail(state.emailInput)) return;
  await runSignup(state);
}

async function runSignup(state) {
  setSignupBusy(state, true);
  try {
    await attemptSignup(state);
  } finally {
    setSignupBusy(state, false);
  }
}

async function attemptSignup({ nameInput, emailInput, passwordInput }) {
  const users = await loadUsers();
  const email = emailInput.value.trim();
  if (users.some((u) => u.email === email)) {
    showFieldError("sign-up-email-error", "This email is already registered.", emailInput);
    return;
  }
  const newUser = buildNewUser(users, nameInput.value.trim(), email, passwordInput.value.trim());
  await UserService.create(newUser);
  setTimeout(() => { window.location.href = ROUTES.LOGIN; }, 300);
}

function buildNewUser(users, name, email, password) {
  return {
    id: generateNextUserId(users),
    name,
    email,
    pw: password,
    color: generateRandomColor(),
  };
}

function wireSignupToggles() {
  setupPasswordToggle(
    "sign-up-password",
    "sign-up-password-lock-icon",
    "sign-up-password-visibility-toggle"
  );
  setupPasswordToggle(
    "sign-up-confirm-password",
    "sign-up-confirm-password-lock-icon",
    "sign-up-confirm-password-visibility-toggle"
  );
}

document.addEventListener("DOMContentLoaded", handleAuthReady); // Init auth

function handleAuthReady() {
  withPageReady(runAuthInit);
}

function runAuthInit() {
  initAnimation();
  initLogin();
  initSignup();
}

function setupPasswordToggle(inputId, lockId, eyeId) {
  const parts = getPasswordParts(inputId, lockId, eyeId);
  if (!parts) return;
  setPasswordInitialState(parts);
  wirePasswordInput(parts);
  wirePasswordToggle(parts);
  wirePasswordLock(parts);
}

function getPasswordParts(inputId, lockId, eyeId) {
  const input = document.getElementById(inputId);
  const lock = document.getElementById(lockId);
  const eye = document.getElementById(eyeId);
  if (!input || !lock || !eye) return null;
  return { input, lock, eye };
}

function setPasswordInitialState({ input, lock, eye }) {
  eye.classList.add("d-none");
  lock.classList.remove("d-none");
  input.type = "password";
}

function wirePasswordInput({ input, lock, eye }) {
  input.addEventListener("input", () => {
    const hasValue = input.value.length > 0;
    updatePasswordIcons(hasValue, input, lock, eye);
  });
}

function updatePasswordIcons(hasValue, input, lock, eye) {
  if (hasValue) return showEyeIcon(input, lock, eye);
  lock.classList.remove("d-none");
  eye.classList.add("d-none");
  input.type = "password";
}

function showEyeIcon(input, lock, eye) {
  lock.classList.add("d-none");
  eye.classList.remove("d-none");
  eye.classList.add("input-icon-password");
  eye.src = "/assets/img/icons/visibility-off.png";
}

function wirePasswordToggle({ input, eye }) {
  eye.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePasswordVisibility(input, eye);
  });
}

function togglePasswordVisibility(input, eye) {
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  eye.src = isHidden ? "/assets/img/icons/visibility.png" : "/assets/img/icons/visibility-off.png";
}

function wirePasswordLock({ lock }) {
  lock.addEventListener("click", (e) => e.stopPropagation());
}
