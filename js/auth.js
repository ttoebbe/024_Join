/* ================== HELPERS ================== */
// Vereinfacht DOM-Zugriffe über eine ID.
// Gibt das referenzierte Element oder null zurück.
const $ = (id) => getElementById(id);

// Speichert den aktuellen Nutzer nur in der Session.
// Verändert keine Daten in Firebase oder Backend.
async function saveCurrentUser(user) {
  setCurrentUser(user);
  // No Firebase save here - just session storage
}

// Lädt alle Nutzer aus Firebase und wandelt sie in ein Array.
// Gibt bei Fehlern ein leeres Array zurück und loggt den Fehler.
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
function initAnimation() {
  setTimeout(startAnimation, 200);
}

// Aktiviert CSS-Animationen für Bild und Hintergrund.
// Blendet den Hintergrund nach kurzer Zeit komplett aus.
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
  eye.src = "/img/icons/visibility_off.png";
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
  eye.src = isHidden ? "/img/icons/visibility.png" : "/img/icons/visibility_off.png";
}

function wirePasswordLock({ lock }) {
  lock.addEventListener("click", (e) => e.stopPropagation());
}

/* ================== Overlay ================== */
function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.style.display = "flex";
}

/* ================== LOGIN ================== */
// Initialisiert das Loginformular und seine Events.
// Validiert Eingaben, führt Login oder Gastmodus aus.
function initLogin() {
  const state = getLoginState();
  if (!state) return;
  wireLoginForm(state);
}

function getLoginState() {
  const form = $("loginForm");
  const emailEl = $("email");
  const pwEl = $("password");
  const btnLogin = $("btnLogin");
  const btnGuest = $("btnGuest");
  if (!form || !emailEl || !pwEl || !btnLogin) return null;
  return { form, emailEl, pwEl, btnLogin, btnGuest };
}

function wireLoginForm(state) {
  wireLoginButtonState(state);
  wireLoginErrorHandlers(state);
  wireLoginSubmit(state);
  wireGuestLogin(state);
  setupPasswordToggle("password", "passwordLock", "visibilityImg");
}

function wireLoginButtonState({ emailEl, pwEl, btnLogin }) {
  const update = () => setLoginButtonState(emailEl, pwEl, btnLogin);
  emailEl.addEventListener("input", update);
  pwEl.addEventListener("input", update);
  update();
}

function setLoginButtonState(emailEl, pwEl, btnLogin) {
  btnLogin.disabled = !(emailEl.value.trim() && pwEl.value.trim());
}

function wireLoginErrorHandlers({ emailEl, pwEl }) {
  const clear = () => clearLoginErrorState(emailEl, pwEl);
  emailEl.addEventListener("input", clear);
  pwEl.addEventListener("input", clear);
}

function showLoginErrorState(emailEl, pwEl) {
  document.getElementById("errorMsg").style.display = "block";
  emailEl.classList.add("input-error");
  pwEl.classList.add("input-error");
}

function clearLoginErrorState(emailEl, pwEl) {
  document.getElementById("errorMsg").style.display = "none";
  emailEl.classList.remove("input-error");
  pwEl.classList.remove("input-error");
}

function wireLoginSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleLoginSubmit(state);
  });
}

async function handleLoginSubmit({ emailEl, pwEl }) {
  const email = emailEl.value.trim();
  const pw = pwEl.value.trim();
  const users = await loadUsers();
  const found = users.find((u) => u.email === email && u.pw === pw);
  if (!found) return showLoginErrorState(emailEl, pwEl);
  await saveCurrentUser(found);
  window.location.href = ROUTES.SUMMARY;
}

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
function initSignup() {
  const state = getSignupState();
  if (!state) return;
  wireSignupForm(state);
}

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

function wireSignupForm(state) {
  wireSignupButtonState(state);
  wireSignupErrorHandlers(state);
  wireSignupSubmit(state);
  wireSignupToggles();
}

function wireSignupButtonState({ nameEl, emailEl, pwEl, pw2El, policyEl, btn }) {
  const update = () => setSignupButtonState(nameEl, emailEl, pwEl, pw2El, policyEl, btn);
  [nameEl, emailEl, pwEl, pw2El].forEach((el) => el.addEventListener("input", update));
  policyEl.addEventListener("change", update);
  update();
}

function setSignupButtonState(nameEl, emailEl, pwEl, pw2El, policyEl, btn) {
  btn.disabled = !(
    nameEl.value.trim() &&
    emailEl.value.trim() &&
    pwEl.value.trim() &&
    pw2El.value.trim() &&
    policyEl.checked
  );
}

function wireSignupErrorHandlers({ pwEl, pw2El }) {
  const clear = () => clearSignupErrorState(pwEl, pw2El);
  pwEl.addEventListener("input", clear);
  pw2El.addEventListener("input", clear);
}

function showSignupErrorState(pwEl, pw2El) {
  const errorMsg = document.getElementById("errorSignupMsg");
  errorMsg.style.display = "block";
  pwEl.classList.add("input-error");
  pw2El.classList.add("input-error");
}

function clearSignupErrorState(pwEl, pw2El) {
  const errorMsg = document.getElementById("errorSignupMsg");
  errorMsg.style.display = "none";
  pwEl.classList.remove("input-error");
  pw2El.classList.remove("input-error");
}

function wireSignupSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSignupSubmit(state);
  });
}

async function handleSignupSubmit({ nameEl, emailEl, pwEl, pw2El }) {
  if (pwEl.value !== pw2El.value) return showSignupErrorState(pwEl, pw2El);
  const users = await loadUsers();
  const email = emailEl.value.trim();
  if (users.some((u) => u.email === email)) return alert("Diese Email ist bereits registriert.");
  const newUser = buildNewUser(users, nameEl.value.trim(), email, pwEl.value.trim());
  await UserService.create(newUser);
  setTimeout(() => { window.location.href = ROUTES.LOGIN; }, 300);
}

function buildNewUser(users, name, email, pw) {
  return {
    id: generateNextUserId(users),
    name,
    email,
    pw,
    color: generateRandomColor(),
  };
}

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
