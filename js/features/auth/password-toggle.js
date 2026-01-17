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
