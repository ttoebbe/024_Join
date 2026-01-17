/* ================== HELPERS ================== */
/**
 * Short-hand to access an element by id.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
const $ = (id) => getElementById(id);


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
