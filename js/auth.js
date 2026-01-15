/* ================== HELPERS ================== */
// Vereinfacht DOM-Zugriffe über eine ID.
// Gibt das referenzierte Element oder null zurück.
/**
 * @param {*} id
 * @returns {*}
 */
const $ = (id) => getElementById(id);

// Speichert den aktuellen Nutzer nur in der Session.
// Verändert keine Daten in Firebase oder Backend.
/**
 * @param {*} user
 * @returns {*}
 */
async function saveCurrentUser(user) {
  setCurrentUser(user);
  // No Firebase save here - just session storage
}

// Lädt alle Nutzer aus Firebase und wandelt sie in ein Array.
// Gibt bei Fehlern ein leeres Array zurück und loggt den Fehler.
/**
 * @returns {*}
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
// Startet verzögert die Initialanimation per Timeout.
// Übergibt die Steuerung anschließend an startAnimation.
/**
 * @returns {*}
 */
function initAnimation() {
  setTimeout(startAnimation, 200);
}

// Aktiviert CSS-Animationen für Bild und Hintergrund.
// Blendet den Hintergrund nach kurzer Zeit komplett aus.
/**
 * @returns {*}
 */
function startAnimation() {
  const homepageImage = $("img_animation");
  const bg = $("bg");
  homepageImage?.classList.add("animiert");
  bg?.classList.add("bg-animiert");
  setTimeout(() => { if (bg) bg.style.display = "none"; }, 500);
}

/* ================== PASSWORD TOGGLE ================== */
// Richtet Augen- und Schloss-Icons für Passwortfelder ein.
// Steuert Sichtbarkeit und Typ des Eingabefelds je nach Input.
/**
 * @param {*} inputId
 * @param {*} lockId
 * @param {*} eyeId
 * @returns {*}
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
 * @param {*} inputId
 * @param {*} lockId
 * @param {*} eyeId
 * @returns {*}
 */
function getPasswordParts(inputId, lockId, eyeId) {
  const input = document.getElementById(inputId);
  const lock = document.getElementById(lockId);
  const eye = document.getElementById(eyeId);
  if (!input || !lock || !eye) return null;
  return { input, lock, eye };
}

/**
 * @param {*} { input
 * @param {*} lock
 * @param {*} eye }
 * @returns {*}
 */
function setPasswordInitialState({ input, lock, eye }) {
  eye.classList.add("d-none");
  lock.classList.remove("d-none");
  input.type = "password";
}

/**
 * @param {*} { input
 * @param {*} lock
 * @param {*} eye }
 * @returns {*}
 */
function wirePasswordInput({ input, lock, eye }) {
  input.addEventListener("input", () => {
    const hasValue = input.value.length > 0;
    updatePasswordIcons(hasValue, input, lock, eye);
  });
}

/**
 * @param {*} hasValue
 * @param {*} input
 * @param {*} lock
 * @param {*} eye
 * @returns {*}
 */
function updatePasswordIcons(hasValue, input, lock, eye) {
  if (hasValue) return showEyeIcon(input, lock, eye);
  lock.classList.remove("d-none");
  eye.classList.add("d-none");
  input.type = "password";
}

/**
 * @param {*} input
 * @param {*} lock
 * @param {*} eye
 * @returns {*}
 */
function showEyeIcon(input, lock, eye) {
  lock.classList.add("d-none");
  eye.classList.remove("d-none");
  eye.classList.add("input-icon-password");
  eye.src = "/img/icons/visibility_off.png";
}

/**
 * @param {*} { input
 * @param {*} eye }
 * @returns {*}
 */
function wirePasswordToggle({ input, eye }) {
  eye.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePasswordVisibility(input, eye);
  });
}

/**
 * @param {*} input
 * @param {*} eye
 * @returns {*}
 */
function togglePasswordVisibility(input, eye) {
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  eye.src = isHidden ? "/img/icons/visibility.png" : "/img/icons/visibility_off.png";
}

/**
 * @param {*} { lock }
 * @returns {*}
 */
function wirePasswordLock({ lock }) {
  lock.addEventListener("click", (e) => e.stopPropagation());
}

/* ================== Overlay ================== */
/**
 * @returns {*}
 */
function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.style.display = "flex";
}

/* ================== LOGIN ================== */
// Initialisiert das Loginformular und seine Events.
// Validiert Eingaben, führt Login oder Gastmodus aus.
/**
 * @returns {*}
 */
function initLogin() {
  const state = getLoginState();
  if (!state) return;
  wireLoginForm(state);
}

/**
 * @returns {*}
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
 * @param {*} state
 * @returns {*}
 */
function wireLoginForm(state) {
  wireLoginButtonState(state);
  wireLoginErrorHandlers(state);
  wireLoginSubmit(state);
  wireGuestLogin(state);
  setupPasswordToggle("password", "passwordLock", "visibilityImg");
}

/**
 * @param {*} { emailEl
 * @param {*} pwEl
 * @param {*} btnLogin }
 * @returns {*}
 */
function wireLoginButtonState({ emailEl, pwEl, btnLogin }) {
/**
 * @returns {*}
 */
  const update = () => setLoginButtonState(emailEl, pwEl, btnLogin);
  emailEl.addEventListener("input", update);
  pwEl.addEventListener("input", update);
  update();
}

/**
 * @param {*} emailEl
 * @param {*} pwEl
 * @param {*} btnLogin
 * @returns {*}
 */
function setLoginButtonState(emailEl, pwEl, btnLogin) {
  btnLogin.disabled = !(emailEl.value.trim() && pwEl.value.trim());
}

/**
 * @param {*} { emailEl
 * @param {*} pwEl }
 * @returns {*}
 */
function wireLoginErrorHandlers({ emailEl, pwEl }) {
/**
 * @returns {*}
 */
  const clear = () => clearLoginErrorState(emailEl, pwEl);
  emailEl.addEventListener("input", clear);
  pwEl.addEventListener("input", clear);
}

/**
 * @param {*} emailEl
 * @param {*} pwEl
 * @returns {*}
 */
function showLoginErrorState(emailEl, pwEl) {
  document.getElementById("errorMsg").style.display = "block";
  emailEl.classList.add("input-error");
  pwEl.classList.add("input-error");
}

/**
 * @param {*} emailEl
 * @param {*} pwEl
 * @returns {*}
 */
function clearLoginErrorState(emailEl, pwEl) {
  document.getElementById("errorMsg").style.display = "none";
  emailEl.classList.remove("input-error");
  pwEl.classList.remove("input-error");
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireLoginSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleLoginSubmit(state);
  });
}

/**
 * @param {*} { emailEl
 * @param {*} pwEl }
 * @returns {*}
 */
async function handleLoginSubmit({ emailEl, pwEl }) {
  const email = emailEl.value.trim();
  const pw = pwEl.value.trim();
  const users = await loadUsers();
  const found = users.find((u) => u.email === email && u.pw === pw);
  if (!found) return showLoginErrorState(emailEl, pwEl);
  await saveCurrentUser(found);
  window.location.href = ROUTES.SUMMARY;
}

/**
 * @param {*} { btnGuest }
 * @returns {*}
 */
function wireGuestLogin({ btnGuest }) {
  btnGuest?.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveCurrentUser({ name: "Guest", guest: true });
    window.location.href = ROUTES.SUMMARY;
  });
}

/* ================== SIGNUP ================== */
// Initialisiert das Signup-Formular mitsamt Validierung.
// Erstellt neue Nutzer nach erfolgreicher Prüfung.
/**
 * @returns {*}
 */
function initSignup() {
  const state = getSignupState();
  if (!state) return;
  wireSignupForm(state);
}

/**
 * @returns {*}
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
 * @param {*} state
 * @returns {*}
 */
function wireSignupForm(state) {
  wireSignupButtonState(state);
  wireSignupErrorHandlers(state);
  wireSignupSubmit(state);
  wireSignupToggles();
}

/**
 * @param {*} { nameEl
 * @param {*} emailEl
 * @param {*} pwEl
 * @param {*} pw2El
 * @param {*} policyEl
 * @param {*} btn }
 * @returns {*}
 */
function wireSignupButtonState({ nameEl, emailEl, pwEl, pw2El, policyEl, btn }) {
/**
 * @returns {*}
 */
  const update = () => setSignupButtonState(nameEl, emailEl, pwEl, pw2El, policyEl, btn);
  [nameEl, emailEl, pwEl, pw2El].forEach((el) => el.addEventListener("input", update));
  policyEl.addEventListener("change", update);
  update();
}

/**
 * @param {*} nameEl
 * @param {*} emailEl
 * @param {*} pwEl
 * @param {*} pw2El
 * @param {*} policyEl
 * @param {*} btn
 * @returns {*}
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
 * @param {*} { pwEl
 * @param {*} pw2El }
 * @returns {*}
 */
function wireSignupErrorHandlers({ pwEl, pw2El }) {
/**
 * @returns {*}
 */
  const clear = () => clearSignupErrorState(pwEl, pw2El);
  pwEl.addEventListener("input", clear);
  pw2El.addEventListener("input", clear);
}

/**
 * @param {*} pwEl
 * @param {*} pw2El
 * @returns {*}
 */
function showSignupErrorState(pwEl, pw2El) {
  const errorMsg = document.getElementById("errorSignupMsg");
  errorMsg.style.display = "block";
  pwEl.classList.add("input-error");
  pw2El.classList.add("input-error");
}

/**
 * @param {*} pwEl
 * @param {*} pw2El
 * @returns {*}
 */
function clearSignupErrorState(pwEl, pw2El) {
  const errorMsg = document.getElementById("errorSignupMsg");
  errorMsg.style.display = "none";
  pwEl.classList.remove("input-error");
  pw2El.classList.remove("input-error");
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireSignupSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSignupSubmit(state);
  });
}

/**
 * @param {*} { nameEl
 * @param {*} emailEl
 * @param {*} pwEl
 * @param {*} pw2El }
 * @returns {*}
 */
async function handleSignupSubmit({ nameEl, emailEl, pwEl, pw2El }) {
  if (pwEl.value !== pw2El.value) return showSignupErrorState(pwEl, pw2El);
  const users = await loadUsers();
  const email = emailEl.value.trim();
  if (users.some((u) => u.email === email)) return alert("Diese Email ist bereits registriert.");
  const newUser = buildNewUser(users, nameEl.value.trim(), email, pwEl.value.trim());
  await UserService.create(newUser);
  setTimeout(() => { window.location.href = ROUTES.LOGIN; }, 300);
}

/**
 * @param {*} users
 * @param {*} name
 * @param {*} email
 * @param {*} pw
 * @returns {*}
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
 * @returns {*}
 */
function wireSignupToggles() {
  setupPasswordToggle("suPw", "lockPw", "eyePw");
  setupPasswordToggle("suPw2", "lockPw2", "eyePw2");
}

/* ================== GLOBAL INIT ================== */
document.addEventListener("DOMContentLoaded", () => {
  initAnimation();
  initLogin();
  initSignup();
});
