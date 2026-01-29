/**
 * Wires login error handlers.
 * @param {Object} fields
 */
function wireLoginErrorHandlers({ emailInput, passwordInput }) {
  emailInput.addEventListener("input", () =>
    clearFieldError("email-error", emailInput),
  );
  passwordInput.addEventListener("input", () =>
    clearFieldError("password-error", passwordInput),
  );
  emailInput.addEventListener("blur", () =>
    validateLoginEmailField(emailInput, "email-error"),
  );
  passwordInput.addEventListener("blur", () =>
    validateLoginPasswordField(passwordInput, "password-error"),
  );
}

function initLogin() {
  const state = getLoginState();
  if (!state) return;
  wireLoginForm(state);
}

/**
 * Gets login form state.
 * @returns {Object|null}
 */
function getLoginState() {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login-button");
  const guestLoginButton = document.getElementById("guest-login-button");
  if (!form || !emailInput || !passwordInput || !loginButton) return null;
  return { form, emailInput, passwordInput, loginButton, guestLoginButton };
}

/**
 * Wires login form handlers.
 * @param {Object} state
 */
function wireLoginForm(state) {
  wireLoginErrorHandlers(state);
  wireLoginSubmit(state);
  wireGuestLogin(state);
  setupPasswordToggle(
    "password",
    "password-lock-icon",
    "password-visibility-toggle",
  );
}

/**
 * Wires login form submit.
 * @param {Object} state
 */
function wireLoginSubmit(state) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleLoginSubmit(state);
  });
}

/**
 * Handles login submit.
 * @param {Object} state
 */
async function handleLoginSubmit(state) {
  if (!validateLoginInputs(state)) return;
  await runLogin(state);
}

/**
 * Runs the login flow.
 * @param {Object} state
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
 * Attempts login with credentials.
 * @param {Object} fields
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
 * Wires guest login.
 * @param {Object} state
 */
function wireGuestLogin({ guestLoginButton }) {
  guestLoginButton?.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveCurrentUser({ name: "Guest", guest: true });
    window.location.href = ROUTES.SUMMARY;
  });
}

/**
 * Sets login busy state.
 * @param {Object} state
 * @param {boolean} busy
 */
function setLoginBusy({ loginButton }, busy) {
  if (!loginButton) return;
  loginButton.disabled = busy;
}
