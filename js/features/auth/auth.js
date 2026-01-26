/* ================== DATA ================== */
/**
 * Saves the current user in session storage only.
 * @param {Object} user
 * @returns {Promise<void>}
 */
async function saveCurrentUser(user) {
  setCurrentUser(user);
  // No Firebase save here - just session storage
}
/**
 * Loads all users from Firebase.
 * @returns {Promise<Object[]>}
 */
async function loadUsers() {
  try {
    const users = await UserService.getAll();
    return users ? Object.values(users) : [];
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}
/* ================== LOGIN ================== */
/**
 * Initializes login form events.
 * @returns {void}
 */
function initLogin() {
  const state = getLoginState();
  if (!state) return;
  wireLoginForm(state);
}
/**
 * Collects login form elements.
 * @returns {{form: HTMLFormElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement, loginButton: HTMLButtonElement, guestLoginButton: HTMLButtonElement|null}|null}
 */
function getLoginState() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("loginButton");
  const guestLoginButton = document.getElementById("guestLoginButton");
  if (!form || !emailInput || !passwordInput || !loginButton) return null;
  return { form, emailInput, passwordInput, loginButton, guestLoginButton };
}
/**
 * Wires login form interactions.
 * @param {{form: HTMLFormElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement, loginButton: HTMLButtonElement, guestLoginButton: HTMLButtonElement|null}} state
 * @returns {void}
 */
function wireLoginForm(state) {
  wireLoginErrorHandlers(state);
  wireLoginSubmit(state);
  wireGuestLogin(state);
  setupPasswordToggle("password", "passwordLockIcon", "passwordVisibilityToggle");
}
/**
 * Wires login submit handler.
 * @param {{form: HTMLFormElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement, loginButton: HTMLButtonElement}} state
 * @returns {void}
 */
function wireLoginSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleLoginSubmit(state);
  });
}
/**
 * Handles login submit.
 * @param {{emailInput: HTMLInputElement, passwordInput: HTMLInputElement, loginButton: HTMLButtonElement}} state
 * @returns {Promise<void>}
 */
async function handleLoginSubmit(state) {
  if (!validateLoginInputs(state)) return;
  await runLogin(state);
}
/**
 * Executes login with busy state.
 * @param {{emailInput: HTMLInputElement, passwordInput: HTMLInputElement, loginButton: HTMLButtonElement}} state
 * @returns {Promise<void>}
 */
async function runLogin(state) {
  setLoginBusy(state, true);
  try {
    await attemptLogin(state);
  } finally {
    setLoginBusy(state, false);
  }
}
/**
 * Attempts login and redirects on success.
 * @param {{emailInput: HTMLInputElement, passwordInput: HTMLInputElement}} state
 * @returns {Promise<void>}
 */
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
/**
 * Wires guest login action.
 * @param {{guestLoginButton: HTMLButtonElement|null}} state
 * @returns {void}
 */
function wireGuestLogin({ guestLoginButton }) {
  guestLoginButton?.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveCurrentUser({ name: "Guest", guest: true });
    window.location.href = ROUTES.SUMMARY;
  });
}
/* ================== SIGNUP ================== */
/**
 * Initializes signup form events.
 * @returns {void}
 */
function initSignup() {
  const state = getSignupState();
  if (!state) return;
  wireSignupForm(state);
}
/**
 * Collects signup form elements.
 * @returns {{form: HTMLFormElement, nameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement, policyCheckbox: HTMLInputElement, signUpButton: HTMLButtonElement}|null}
 */
function getSignupState() {
  const form = document.getElementById("signupForm");
  const nameInput = document.getElementById("signUpName");
  const emailInput = document.getElementById("signUpEmail");
  const passwordInput = document.getElementById("signUpPassword");
  const confirmPasswordInput = document.getElementById("signUpConfirmPassword");
  const policyCheckbox = document.getElementById("signUpPolicy");
  const signUpButton = document.getElementById("signUpButton");
  if (!form || !nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !policyCheckbox || !signUpButton) return null;
  return { form, nameInput, emailInput, passwordInput, confirmPasswordInput, policyCheckbox, signUpButton };
}
/**
 * Wires signup form interactions.
 * @param {{form: HTMLFormElement, nameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement, policyCheckbox: HTMLInputElement, signUpButton: HTMLButtonElement}} state
 * @returns {void}
 */
function wireSignupForm(state) {
  wireSignupButtonState(state);
  wireSignupErrorHandlers(state);
  wireSignupSubmit(state);
  wireSignupToggles();
}
/**
 * Wires signup submit handler.
 * @param {{form: HTMLFormElement, nameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement}} state
 * @returns {void}
 */
function wireSignupSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSignupSubmit(state);
  });
}
/**
 * Handles signup submit.
 * @param {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement, policyCheckbox: HTMLInputElement, signUpButton: HTMLButtonElement}} state
 * @returns {Promise<void>}
 */
async function handleSignupSubmit(state) {
  if (!validateSignupInputs(state)) return;
  if (await checkDuplicateEmail(state.emailInput)) return;
  await runSignup(state);
}
/**
 * Executes signup with busy state.
 * @param {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement, policyCheckbox: HTMLInputElement, signUpButton: HTMLButtonElement}} state
 * @returns {Promise<void>}
 */
async function runSignup(state) {
  setSignupBusy(state, true);
  try {
    await attemptSignup(state);
  } finally {
    setSignupBusy(state, false);
  }
}
/**
 * Attempts signup and redirects on success.
 * @param {{nameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement}} state
 * @returns {Promise<void>}
 */
async function attemptSignup({ nameInput, emailInput, passwordInput }) {
  const users = await loadUsers();
  const email = emailInput.value.trim();
  if (users.some((u) => u.email === email)) {
    showFieldError("signUpEmail-error", "This email is already registered.", emailInput);
    return;
  }
  const newUser = buildNewUser(users, nameInput.value.trim(), email, passwordInput.value.trim());
  await UserService.create(newUser);
  setTimeout(() => { window.location.href = ROUTES.LOGIN; }, 300);
}
/**
 * Builds a new user payload.
 * @param {Object[]} users
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Object}
 */
function buildNewUser(users, name, email, password) {
  return {
    id: generateNextUserId(users),
    name,
    email,
    pw: password,
    color: generateRandomColor(),
  };
}
/**
 * Wires password toggles for signup form.
 * @returns {void}
 */
function wireSignupToggles() {
  setupPasswordToggle(
    "signUpPassword",
    "signUpPasswordLockIcon",
    "signUpPasswordVisibilityToggle"
  );
  setupPasswordToggle(
    "signUpConfirmPassword",
    "signUpConfirmPasswordLockIcon",
    "signUpConfirmPasswordVisibilityToggle"
  );
}
/* ================== GLOBAL INIT ================== */
/**
 * Bootstraps auth-related flows on DOM ready.
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", handleAuthReady);

/**
 * @returns {void}
 */
function handleAuthReady() {
  withPageReady(runAuthInit);
}

/**
 * @returns {void}
 */
function runAuthInit() {
  initAnimation();
  initLogin();
  initSignup();
}

