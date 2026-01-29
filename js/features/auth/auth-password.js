/**
 * Sets up a password toggle.
 * @param {string} inputId
 * @param {string} lockId
 * @param {string} eyeId
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
 * Gets password control parts.
 * @param {string} inputId
 * @param {string} lockId
 * @param {string} eyeId
 * @returns {Object|null}
 */
function getPasswordParts(inputId, lockId, eyeId) {
  const input = document.getElementById(inputId);
  const lock = document.getElementById(lockId);
  const eye = document.getElementById(eyeId);
  if (!input || !lock || !eye) return null;
  return { input, lock, eye };
}

/**
 * Sets the initial password UI state.
 * @param {Object} parts
 */
function setPasswordInitialState({ input, lock, eye }) {
  eye.classList.add("d-none");
  lock.classList.remove("d-none");
  input.type = "password";
}

/**
 * Wires password input changes.
 * @param {Object} parts
 */
function wirePasswordInput({ input, lock, eye }) {
  input.addEventListener("input", () => {
    const hasValue = input.value.length > 0;
    updatePasswordIcons(hasValue, input, lock, eye);
  });
}

/**
 * Updates password icons for input state.
 * @param {boolean} hasValue
 * @param {HTMLInputElement} input
 * @param {HTMLElement} lock
 * @param {HTMLElement} eye
 */
function updatePasswordIcons(hasValue, input, lock, eye) {
  if (hasValue) return showEyeIcon(input, lock, eye);
  lock.classList.remove("d-none");
  eye.classList.add("d-none");
  input.type = "password";
}

/**
 * Shows the eye icon.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} lock
 * @param {HTMLElement} eye
 */
function showEyeIcon(input, lock, eye) {
  lock.classList.add("d-none");
  eye.classList.remove("d-none");
  eye.classList.add("input-icon-password");
  eye.src = "/assets/img/icons/visibility_off.svg";
}

/**
 * Wires the password toggle.
 * @param {Object} parts
 */
function wirePasswordToggle({ input, eye }) {
  eye.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePasswordVisibility(input, eye);
  });
}

/**
 * Toggles password visibility.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} eye
 */
function togglePasswordVisibility(input, eye) {
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  eye.src = isHidden
    ? "/assets/img/icons/visibility.svg"
    : "/assets/img/icons/visibility_off.svg";
}

/**
 * Wires the password lock click.
 * @param {Object} parts
 */
function wirePasswordLock({ lock }) {
  lock.addEventListener("click", (e) => e.stopPropagation());
}
