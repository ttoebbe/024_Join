/* ================== HELPERS ================== */
/**
 * Short-hand to access an element by id.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
const $ = (id) => getElementById(id);


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


/* ================== ANIMATION ================== */
/**
 * Starts the initial animation with a small delay.
 * @returns {void}
 */
function initAnimation() {
  setTimeout(startAnimation, 200);
}


/**
 * Triggers CSS animation classes and hides the background after a delay.
 * @returns {void}
 */
function startAnimation() {
  const homepageImage = $("img_animation");
  const bg = $("bg");
  homepageImage?.classList.add("animiert");
  bg?.classList.add("bg-animiert");
  setTimeout(() => {
    if (bg) bg.style.display = "none";
  }, 500);
}


/* ================== PASSWORD TOGGLE ================== */
/**
 * Sets up password visibility toggle for a field.
 * @param {string} inputId
 * @param {string} lockId
 * @param {string} eyeId
 * @returns {void}
 */
function setupPasswordToggle(inputId, lockId, eyeId) {
  const parts = getPasswordParts(inputId, lockId, eyeId);
  if (!parts) return;
  setPasswordInitialState(parts);
  wirePasswordInput(parts);
  wirePasswordToggle(parts);
  wirePasswordLock(parts);
}


/**
 * Reads input, lock, and eye elements.
 * @param {string} inputId
 * @param {string} lockId
 * @param {string} eyeId
 * @returns {{input: HTMLInputElement, lock: HTMLElement, eye: HTMLImageElement}|null}
 */
function getPasswordParts(inputId, lockId, eyeId) {
  const input = document.getElementById(inputId);
  const lock = document.getElementById(lockId);
  const eye = document.getElementById(eyeId);
  if (!input || !lock || !eye) return null;
  return { input, lock, eye };
}


/**
 * Sets initial password input state for icons.
 * @param {{input: HTMLInputElement, lock: HTMLElement, eye: HTMLImageElement}} parts
 * @returns {void}
 */
function setPasswordInitialState({ input, lock, eye }) {
  eye.classList.add("d-none");
  lock.classList.remove("d-none");
  input.type = "password";
}


/**
 * Wires input event for password visibility toggle.
 * @param {{input: HTMLInputElement, lock: HTMLElement, eye: HTMLImageElement}} parts
 * @returns {void}
 */
function wirePasswordInput({ input, lock, eye }) {
  input.addEventListener("input", () => {
    const hasValue = input.value.length > 0;
    updatePasswordIcons(hasValue, input, lock, eye);
  });
}


/**
 * Updates lock/eye icons based on input state.
 * @param {boolean} hasValue
 * @param {HTMLInputElement} input
 * @param {HTMLElement} lock
 * @param {HTMLImageElement} eye
 * @returns {void}
 */
function updatePasswordIcons(hasValue, input, lock, eye) {
  if (hasValue) return showEyeIcon(input, lock, eye);
  lock.classList.remove("d-none");
  eye.classList.add("d-none");
  input.type = "password";
}


/**
 * Shows eye icon and hides lock icon.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} lock
 * @param {HTMLImageElement} eye
 * @returns {void}
 */
function showEyeIcon(input, lock, eye) {
  lock.classList.add("d-none");
  eye.classList.remove("d-none");
  eye.classList.add("input-icon-password");
  eye.src = "/assets/img/icons/visibility_off.png";
}


/**
 * Wires eye click for password visibility toggle.
 * @param {{input: HTMLInputElement, eye: HTMLImageElement}} parts
 * @returns {void}
 */
function wirePasswordToggle({ input, eye }) {
  eye.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePasswordVisibility(input, eye);
  });
}


/**
 * Toggles between password and text input types.
 * @param {HTMLInputElement} input
 * @param {HTMLImageElement} eye
 * @returns {void}
 */
function togglePasswordVisibility(input, eye) {
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  eye.src = isHidden ? "/assets/img/icons/visibility.png" : "/assets/img/icons/visibility_off.png";
}


/**
 * Stops propagation on lock icon.
 * @param {{lock: HTMLElement}} parts
 * @returns {void}
 */
function wirePasswordLock({ lock }) {
  lock.addEventListener("click", (e) => e.stopPropagation());
}


/* ================== Overlay ================== */
/**
 * Shows the success overlay.
 * @returns {void}
 */
function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.style.display = "flex";
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
  const form = $("loginForm");
  const emailEl = $("email");
  const pwEl = $("password");
  const btnLogin = $("btnLogin");
  const btnGuest = $("btnGuest");
  if (!form || !emailEl || !pwEl || !btnLogin) return null;
  return { form, emailEl, pwEl, btnLogin, btnGuest };
}


/**
 * Wires login form interactions.
 * @param {{form: HTMLFormElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, btnLogin: HTMLButtonElement, btnGuest: HTMLButtonElement|null}} state
 * @returns {void}
 */
function wireLoginForm(state) {
  wireLoginButtonState(state);
  wireLoginErrorHandlers(state);
  wireLoginSubmit(state);
  wireGuestLogin(state);
  setupPasswordToggle("password", "passwordLock", "visibilityImg");
}


/**
 * Wires the login button enabled state.
 * @param {{emailEl: HTMLInputElement, pwEl: HTMLInputElement, btnLogin: HTMLButtonElement}} state
 * @returns {void}
 */
function wireLoginButtonState({ emailEl, pwEl, btnLogin }) {
  const update = () => setLoginButtonState(emailEl, pwEl, btnLogin);
  emailEl.addEventListener("input", update);
  pwEl.addEventListener("input", update);
  update();
}


/**
 * Sets login button disabled state based on inputs.
 * @param {HTMLInputElement} emailEl
 * @param {HTMLInputElement} pwEl
 * @param {HTMLButtonElement} btnLogin
 * @returns {void}
 */
function setLoginButtonState(emailEl, pwEl, btnLogin) {
  btnLogin.disabled = !(emailEl.value.trim() && pwEl.value.trim());
}


/**
 * Wires login error state clearing on input.
 * @param {{emailEl: HTMLInputElement, pwEl: HTMLInputElement}} state
 * @returns {void}
 */
function wireLoginErrorHandlers({ emailEl, pwEl }) {
  const clear = () => clearLoginErrorState(emailEl, pwEl);
  emailEl.addEventListener("input", clear);
  pwEl.addEventListener("input", clear);
}


/**
 * Shows login error state with an optional message.
 * @param {HTMLInputElement} emailEl
 * @param {HTMLInputElement} pwEl
 * @param {string} message
 * @returns {void}
 */
function showLoginErrorState(emailEl, pwEl, message) {
  const msg = document.getElementById("errorMsg");
  if (msg && message) msg.textContent = message;
  if (msg) msg.style.display = "block";
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
  document.getElementById("errorMsg").style.display = "none";
  emailEl.classList.remove("input-error");
  pwEl.classList.remove("input-error");
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
 * Validates login inputs and shows errors.
 * @param {{emailEl: HTMLInputElement, pwEl: HTMLInputElement}} state
 * @returns {boolean}
 */
function validateLoginInputs({ emailEl, pwEl }) {
  clearLoginErrorState(emailEl, pwEl);
  if (emailEl.value.trim() && pwEl.value.trim()) return true;
  showLoginErrorState(emailEl, pwEl, "Please enter email and password.");
  return false;
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
 * Toggles login button busy state.
 * @param {{emailEl: HTMLInputElement, pwEl: HTMLInputElement, btnLogin: HTMLButtonElement}} state
 * @param {boolean} busy
 * @returns {void}
 */
function setLoginBusy({ emailEl, pwEl, btnLogin }, busy) {
  if (!btnLogin) return;
  if (busy) return void (btnLogin.disabled = true);
  setLoginButtonState(emailEl, pwEl, btnLogin);
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
  const form = $("signupForm");
  const nameEl = $("suName");
  const emailEl = $("suEmail");
  const pwEl = $("suPw");
  const pw2El = $("suPw2");
  const policyEl = $("suPolicy");
  const btn = $("btnSignup");
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
 * Wires signup button enabled state.
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement, btn: HTMLButtonElement}} state
 * @returns {void}
 */
function wireSignupButtonState({ nameEl, emailEl, pwEl, pw2El, policyEl, btn }) {
  const update = () => setSignupButtonState(nameEl, emailEl, pwEl, pw2El, policyEl, btn);
  [nameEl, emailEl, pwEl, pw2El].forEach((el) => el.addEventListener("input", update));
  policyEl.addEventListener("change", update);
  update();
}


/**
 * Sets signup button disabled state based on inputs.
 * @param {HTMLInputElement} nameEl
 * @param {HTMLInputElement} emailEl
 * @param {HTMLInputElement} pwEl
 * @param {HTMLInputElement} pw2El
 * @param {HTMLInputElement} policyEl
 * @param {HTMLButtonElement} btn
 * @returns {void}
 */
function setSignupButtonState(nameEl, emailEl, pwEl, pw2El, policyEl, btn) {
  btn.disabled = !(
    nameEl.value.trim() &&
    emailEl.value.trim() &&
    pwEl.value.trim() &&
    pw2El.value.trim() &&
    policyEl.checked
  );
}


/**
 * Wires signup error state clearing.
 * @param {{pwEl: HTMLInputElement, pw2El: HTMLInputElement}} state
 * @returns {void}
 */
function wireSignupErrorHandlers({ pwEl, pw2El }) {
  const clear = () => clearSignupErrorState(pwEl, pw2El);
  pwEl.addEventListener("input", clear);
  pw2El.addEventListener("input", clear);
}


/**
 * Shows signup error state with an optional message.
 * @param {HTMLInputElement} pwEl
 * @param {HTMLInputElement} pw2El
 * @param {string} message
 * @returns {void}
 */
function showSignupErrorState(pwEl, pw2El, message) {
  const errorMsg = document.getElementById("errorSignupMsg");
  if (errorMsg && message) errorMsg.textContent = message;
  if (errorMsg) errorMsg.style.display = "block";
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
  const errorMsg = document.getElementById("errorSignupMsg");
  errorMsg.style.display = "none";
  pwEl.classList.remove("input-error");
  pw2El.classList.remove("input-error");
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
 * Validates signup inputs and shows errors.
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement}} state
 * @returns {boolean}
 */
function validateSignupInputs({ nameEl, emailEl, pwEl, pw2El, policyEl }) {
  clearSignupErrorState(pwEl, pw2El);
  if (!nameEl.value.trim() || !emailEl.value.trim()) return showSignupRequiredError(pwEl, pw2El);
  if (!pwEl.value.trim() || !pw2El.value.trim()) return showSignupRequiredError(pwEl, pw2El);
  if (!policyEl.checked) return showSignupPolicyError(pwEl, pw2El);
  if (pwEl.value !== pw2El.value) return showSignupErrorState(pwEl, pw2El, "Your passwords don't match. Please try again.");
  return true;
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
 * Toggles signup button busy state.
 * @param {{nameEl: HTMLInputElement, emailEl: HTMLInputElement, pwEl: HTMLInputElement, pw2El: HTMLInputElement, policyEl: HTMLInputElement, btn: HTMLButtonElement}} state
 * @param {boolean} busy
 * @returns {void}
 */
function setSignupBusy({ nameEl, emailEl, pwEl, pw2El, policyEl, btn }, busy) {
  if (!btn) return;
  if (busy) return void (btn.disabled = true);
  setSignupButtonState(nameEl, emailEl, pwEl, pw2El, policyEl, btn);
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
