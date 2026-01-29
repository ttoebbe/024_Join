/**
 * Wires signup error handlers.
 * @param {Object} fields
 */
function wireSignupErrorHandlers({
  nameInput,
  emailInput,
  passwordInput,
  confirmPasswordInput,
  policyCheckbox,
}) {
  nameInput.addEventListener("input", () =>
    clearFieldError("username-error", nameInput),
  );
  emailInput.addEventListener("input", () =>
    clearFieldError("sign-up-email-error", emailInput),
  );
  passwordInput.addEventListener("input", () =>
    clearFieldError("sign-up-password-error", passwordInput),
  );
  confirmPasswordInput.addEventListener("input", () =>
    clearFieldError("sign-up-confirm-password-error", confirmPasswordInput),
  );
  policyCheckbox?.addEventListener("change", () =>
    clearFieldError("sign-up-policy-error", policyCheckbox),
  );
  nameInput.addEventListener("blur", () =>
    validateFieldWithAutoDismiss(
      nameInput,
      "username-error",
      validateUsernameField,
    ),
  );
  emailInput.addEventListener("blur", () => handleSignupEmailBlur(emailInput));
  passwordInput.addEventListener("blur", () =>
    validateFieldWithAutoDismiss(
      passwordInput,
      "sign-up-password-error",
      validatePasswordField,
    ),
  );
  confirmPasswordInput.addEventListener("blur", () =>
    validateFieldWithAutoDismiss(
      passwordInput,
      confirmPasswordInput,
      "sign-up-confirm-password-error",
      validateConfirmPasswordField,
    ),
  );
}

/**
 * Wires signup button state.
 * @param {Object} state
 */
function wireSignupButtonState(state) {
  const update = () => setSignupButtonState(state);
  [
    state.nameInput,
    state.emailInput,
    state.passwordInput,
    state.confirmPasswordInput,
  ].forEach((el) => el.addEventListener("input", update));
  state.policyCheckbox.addEventListener("change", update);
  update();
}

/**
 * Sets the signup button state.
 * @param {Object} state
 */
function setSignupButtonState({
  nameInput,
  emailInput,
  passwordInput,
  confirmPasswordInput,
  policyCheckbox,
  signUpButton,
}) {
  signUpButton.disabled = !(
    nameInput.value.trim() &&
    emailInput.value.trim() &&
    passwordInput.value.trim() &&
    confirmPasswordInput.value.trim() &&
    policyCheckbox.checked
  );
}

/**
 * Sets signup busy state.
 * @param {Object} state
 * @param {boolean} busy
 */
function setSignupBusy(state, busy) {
  if (!state.signUpButton) return;
  if (busy) return void (state.signUpButton.disabled = true);
  setSignupButtonState(state);
}

function initSignup() {
  const state = getSignupState();
  if (!state) return;
  wireSignupForm(state);
}

/**
 * Gets signup form state.
 * @returns {Object|null}
 */
function getSignupState() {
  const form = document.getElementById("sign-up-form");
  const nameInput = document.getElementById("sign-up-name");
  const emailInput = document.getElementById("sign-up-email");
  const passwordInput = document.getElementById("sign-up-password");
  const confirmPasswordInput = document.getElementById(
    "sign-up-confirm-password",
  );
  const policyCheckbox = document.getElementById("sign-up-policy");
  const signUpButton = document.getElementById("sign-up-button");
  if (
    !form ||
    !nameInput ||
    !emailInput ||
    !passwordInput ||
    !confirmPasswordInput ||
    !policyCheckbox ||
    !signUpButton
  )
    return null;
  return {
    form,
    nameInput,
    emailInput,
    passwordInput,
    confirmPasswordInput,
    policyCheckbox,
    signUpButton,
  };
}

/**
 * Wires signup form handlers.
 * @param {Object} state
 */
function wireSignupForm(state) {
  wireSignupButtonState(state);
  wireSignupErrorHandlers(state);
  wireSignupSubmit(state);
  wireSignupToggles();
}

/**
 * Wires signup submit.
 * @param {Object} state
 */
function wireSignupSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSignupSubmit(state);
  });
}

/**
 * Handles signup submit.
 * @param {Object} state
 */
async function handleSignupSubmit(state) {
  if (!validateSignupInputs(state)) return;
  if (await checkDuplicateEmail(state.emailInput)) return;
  await runSignup(state);
}

/**
 * Runs the signup flow.
 * @param {Object} state
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
 * Attempts signup with inputs.
 * @param {Object} fields
 */
async function attemptSignup({ nameInput, emailInput, passwordInput }) {
  const users = await loadUsers();
  const email = emailInput.value.trim();
  if (users.some((u) => u.email === email)) {
    showFieldError(
      "sign-up-email-error",
      "This email is already registered.",
      emailInput,
    );
    return;
  }
  const newUser = buildNewUser(
    users,
    nameInput.value.trim(),
    email,
    passwordInput.value.trim(),
  );
  await UserService.create(newUser);
  setTimeout(() => {
    window.location.href = ROUTES.LOGIN;
  }, 300);
}

/**
 * Builds a new user.
 * @param {Array} users
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

function wireSignupToggles() {
  setupPasswordToggle(
    "sign-up-password",
    "sign-up-password-lock-icon",
    "sign-up-password-visibility-toggle",
  );
  setupPasswordToggle(
    "sign-up-confirm-password",
    "sign-up-confirm-password-lock-icon",
    "sign-up-confirm-password-visibility-toggle",
  );
}
