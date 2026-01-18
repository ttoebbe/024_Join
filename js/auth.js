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
 * @returns {{form: HTMLFormElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, btnLogin: HTMLButtonElement, btnGuest: HTMLButtonElement|null}|null}
 */
function getLoginState() {
  const form = document.getElementById("loginForm");
  const emailEl = document.getElementById("email");
  const pwEl = document.getElementById("password");
  const btnLogin = document.getElementById("btnLogin");
  const btnGuest = document.getElementById("btnGuest");
  if (!form || !emailEl || !pwEl || !btnLogin) return null;
  return { form, emailEl, pwEl, btnLogin, btnGuest };
}


/**
 * Wires login form interactions.
 * @param {{form: HTMLFormElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, btnLogin: HTMLButtonElement, btnGuest: HTMLButtonElement|null}} state
 * @returns {void}
 */
function wireLoginForm(state) {
  wireLoginErrorHandlers(state);
  wireLoginSubmit(state);
  wireGuestLogin(state);
  setupPasswordToggle("password", "passwordLock", "visibilityImg");
}


/**
 * Wires login submit handler.
 * @param {{form: HTMLFormElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, btnLogin: HTMLButtonElement}} state
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
 * @param {{emailEl: HTMLInputElement, pwEl: HTMLInputElement, btnLogin: HTMLButtonElement}} state
 * @returns {Promise<void>}
 */
async function handleLoginSubmit(state) {
  if (!validateLoginInputs(state)) return;
  await runLogin(state);
}


/**
 * Executes login with busy state.
 * @param {{emailEl: HTMLInputElement, pwEl: HTMLInputElement, btnLogin: HTMLButtonElement}} state
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
 * @param {{emailEl: HTMLInputElement, pwEl: HTMLInputElement}} state
 * @returns {Promise<void>}
 */
async function attemptLogin({ emailEl, pwEl }) {
  const email = emailEl.value.trim();
  const pw = pwEl.value.trim();
  const users = await loadUsers();
  const found = users.find((u) => u.email === email && u.pw === pw);
  if (!found) return showLoginErrorState(emailEl, pwEl, "Check your email and password. Please try again.");
  await saveCurrentUser(found);
  window.location.href = ROUTES.SUMMARY;
}


/**
 * Wires guest login action.
 * @param {{btnGuest: HTMLButtonElement|null}} state
 * @returns {void}
 */
function wireGuestLogin({ btnGuest }) {
  btnGuest?.addEventListener("click", async (e) => {
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
 * @returns {{form: HTMLFormElement, nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement, btn: HTMLButtonElement}|null}
 */
function getSignupState() {
  const form = document.getElementById("signupForm");
  const nameEl = document.getElementById("suName");
  const emailEl = document.getElementById("suEmail");
  const pwEl = document.getElementById("suPw");
  const pw2El = document.getElementById("suPw2");
  const policyEl = document.getElementById("suPolicy");
  const btn = document.getElementById("btnSignup");
  if (!form || !nameEl || !emailEl || !pwEl || !pw2El || !policyEl || !btn) return null;
  return { form, nameEl, emailEl, pwEl, pw2El, policyEl, btn };
}


/**
 * Wires signup form interactions.
 * @param {{form: HTMLFormElement, nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement, btn: HTMLButtonElement}} state
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
 * @param {{form: HTMLFormElement, nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement}} state
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
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement, btn: HTMLButtonElement}} state
 * @returns {Promise<void>}
 */
async function handleSignupSubmit(state) {
  if (!validateSignupInputs(state)) return;
  await runSignup(state);
}


/**
 * Executes signup with busy state.
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement, btn: HTMLButtonElement}} state
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
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement}} state
 * @returns {Promise<void>}
 */
async function attemptSignup({ nameEl, emailEl, pwEl }) {
  const users = await loadUsers();
  const email = emailEl.value.trim();
  if (users.some((u) => u.email === email)) return alert("Diese Email ist bereits registriert.");
  const newUser = buildNewUser(users, nameEl.value.trim(), email, pwEl.value.trim());
  await UserService.create(newUser);
  setTimeout(() => { window.location.href = ROUTES.LOGIN; }, 300);
}


/**
 * Builds a new user payload.
 * @param {Object[]} users
 * @param {string} name
 * @param {string} email
 * @param {string} pw
 * @returns {Object}
 */
function buildNewUser(users, name, email, pw) {
  return {
    id: generateNextUserId(users),
    name,
    email,
    pw,
    color: generateRandomColor(),
  };
}


/**
 * Wires password toggles for signup form.
 * @returns {void}
 */
function wireSignupToggles() {
  setupPasswordToggle("suPw", "lockPw", "eyePw");
  setupPasswordToggle("suPw2", "lockPw2", "eyePw2");
}


/* ================== GLOBAL INIT ================== */
/**
 * Bootstraps auth-related flows on DOM ready.
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {
  initAnimation();
  initLogin();
  initSignup();
});