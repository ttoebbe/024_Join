const $ = (id) => getElementById(id);


function initAnimation() {
  const img = document.getElementById("img-animation");
  const bg = document.getElementById("bg");
  if (!img || !bg) return;
  if (sessionStorage.getItem("animationShown") === "true") {
    skipAnimation(img, bg);
    return;
  }
  sessionStorage.setItem("animationShown", "true");
  if (window.innerWidth <= 480) img.src = "./assets/img/capa-1.png";
  setTimeout(() => startAnimation(img, bg), 200);
}


function startAnimation(img, bg) {
  if (!img || !bg) return;
  img.classList.add("animated");
  bg.classList.add("bg-animated");
  if (window.innerWidth <= 480) {
    setTimeout(() => {
      img.src = "./assets/img/homepage-join.png";
    }, 500);
  }
  setTimeout(() => {
    bg.style.display = "none";
  }, 500);
}


function skipAnimation(img, bg) {
  if (!img || !bg) return;
  img.src = "./assets/img/homepage-join.png";
  if (window.innerWidth <= 480) {
    img.style.top = "30px";
    img.style.left = "30px";
  } else {
    img.style.top = "73px";
    img.style.left = "77px";
  }
  img.style.transform = "translate(0, 0) scale(1)";
  bg.style.display = "none";
}


function showSuccessOverlay() {
  const overlay = document.getElementById("success-overlay");
  if (overlay) overlay.style.display = "flex";
}


function wireLoginErrorHandlers({ emailInput, passwordInput }) {
  emailInput.addEventListener("input", () => clearFieldError("email-error", emailInput));
  passwordInput.addEventListener("input", () => clearFieldError("password-error", passwordInput));
  emailInput.addEventListener("blur", () => validateLoginEmailField(emailInput, "email-error"));
  passwordInput.addEventListener("blur", () => validateLoginPasswordField(passwordInput, "password-error"));
}


function wireSignupErrorHandlers({ nameInput, emailInput, passwordInput, confirmPasswordInput, policyCheckbox }) {
  nameInput.addEventListener("input", () => clearFieldError("username-error", nameInput));
  emailInput.addEventListener("input", () => clearFieldError("sign-up-email-error", emailInput));
  passwordInput.addEventListener("input", () => clearFieldError("sign-up-password-error", passwordInput));
  confirmPasswordInput.addEventListener("input", () => clearFieldError("sign-up-confirm-password-error", confirmPasswordInput));
  policyCheckbox?.addEventListener("change", () => clearFieldError("sign-up-policy-error", policyCheckbox));
  nameInput.addEventListener("blur", () => validateFieldWithAutoDismiss(nameInput, "username-error", validateUsernameField));
  emailInput.addEventListener("blur", () => handleSignupEmailBlur(emailInput));
  passwordInput.addEventListener("blur", () => validateFieldWithAutoDismiss(passwordInput, "sign-up-password-error", validatePasswordField));
  confirmPasswordInput.addEventListener("blur", () =>
    validateFieldWithAutoDismiss(passwordInput, confirmPasswordInput, "sign-up-confirm-password-error", validateConfirmPasswordField)
  );
}


function wireSignupButtonState(state) {
  const update = () => setSignupButtonState(state);
  [state.nameInput, state.emailInput, state.passwordInput, state.confirmPasswordInput].forEach((el) =>
    el.addEventListener("input", update)
  );
  state.policyCheckbox.addEventListener("change", update);
  update();
}


function setSignupButtonState({ nameInput, emailInput, passwordInput, confirmPasswordInput, policyCheckbox, signUpButton }) {
  signUpButton.disabled = !(
    nameInput.value.trim() &&
    emailInput.value.trim() &&
    passwordInput.value.trim() &&
    confirmPasswordInput.value.trim() &&
    policyCheckbox.checked
  );
}


function setLoginBusy({ loginButton }, busy) {
  if (!loginButton) return;
  loginButton.disabled = busy;
}


function setSignupBusy(state, busy) {
  if (!state.signUpButton) return;
  if (busy) return void (state.signUpButton.disabled = true);
  setSignupButtonState(state);
}
