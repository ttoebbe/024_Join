/* ================== KONSTANTEN ================== */
const LS_CURRENT = "join_current_user";
const LS_USERS = "join_users";
const REDIRECT_AFTER_LOGIN = "/pages/summary.html";
const REDIRECT_AFTER_SIGNUP = "/index.html";

const $ = (id) => document.getElementById(id);

/* ================== LOCALSTORAGE HELPERS ================== */
function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function saveCurrentUser(user) {
  // ✅ DAS war vorher nicht vorhanden → ReferenceError
  writeJSON(LS_CURRENT, user);
}

function loadUsers() {
  return readJSON(LS_USERS, []);
}

/* ================== ANIMATION ================== */
function initAnimation() {
  setTimeout(startAnimation, 200);
}

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
 function setupPasswordToggle(inputId, lockId, eyeId) {
    const input = document.getElementById(inputId);
    const lock = document.getElementById(lockId);
    const eye = document.getElementById(eyeId);

    if (!input || !lock || !eye) return;

    // Initialzustand
    eye.classList.add("d-none");
    lock.classList.remove("d-none");
    input.type = "password";

    // 👇 Eye erst anzeigen, wenn etwas eingegeben wurde
    input.addEventListener("input", () => {
      if (input.value.length > 0) {
        lock.classList.add("d-none");
        eye.classList.remove("d-none");
        eye.src = "../img/icons/visibility_off.png";
      } else {
        lock.classList.remove("d-none");
        eye.classList.add("d-none");
        input.type = "password";
      }
    });

    // 👁 Toggle nur wenn Eye sichtbar ist
    eye.addEventListener("click", (e) => {
      e.stopPropagation();

      if (input.type === "password") {
        input.type = "text";
        eye.src = "../img/icons/visibility.png";
      } else {
        input.type = "password";
        eye.src = "../img/icons/visibility_off.png";
      }
    });

    lock.addEventListener("click", (e) => e.stopPropagation());
  }

/* ================== LOGIN ================== */
function initLogin() {
  const form = $("loginForm");
  if (!form) return;

  const emailEl = $("email");
  const pwEl = $("password");
  const btnLogin = $("btnLogin");
  const btnGuest = $("btnGuest");

  if (!emailEl || !pwEl || !btnLogin) return;

  function updateBtn() {
    btnLogin.disabled = !(emailEl.value.trim() && pwEl.value.trim());
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = emailEl.value.trim();
    const pw = pwEl.value.trim();

    // Optional “echter” Login: nur reinlassen wenn User existiert
    const users = loadUsers();
    const found = users.find((u) => u.email === email && u.pw === pw);

    if (!found) {
      alert("Email oder Passwort ist falsch.");
      return;
    }

    saveCurrentUser({ name: found.name, email: found.email, guest: false });
    window.location.href = REDIRECT_AFTER_LOGIN;
  });

  btnGuest?.addEventListener("click", (e) => {
    e.preventDefault();
    saveCurrentUser({ name: "Guest", guest: true });
    window.location.href = REDIRECT_AFTER_LOGIN;
  });

  emailEl.addEventListener("input", updateBtn);
  pwEl.addEventListener("input", updateBtn);
  updateBtn();

  // Falls du auch im Login Eye/Lock hast, IDs hier eintragen:
  // setupPasswordToggle("password", "lockPwLogin", "eyePwLogin");
}

/* ================== SIGNUP ================== */
function initSignup() {
  const form = $("signupForm");
  if (!form) return;

  const nameEl = $("suName");
  const emailEl = $("suEmail");
  const pwEl = $("suPw");
  const pw2El = $("suPw2");
  const policyEl = $("suPolicy");
  const btn = $("btnSignup");

  if (!nameEl || !emailEl || !pwEl || !pw2El || !policyEl || !btn) return;

  function updateBtn() {
    btn.disabled = !(
      nameEl.value.trim() &&
      emailEl.value.trim() &&
      pwEl.value.trim() &&
      pw2El.value.trim() &&
      policyEl.checked
    );
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (pwEl.value !== pw2El.value) {
      alert("Passwörter stimmen nicht überein.");
      return;
    }

    const users = loadUsers();
    const email = emailEl.value.trim();

    if (users.some((u) => u.email === email)) {
      alert("Diese Email ist bereits registriert.");
      return;
    }

    users.push({
      name: nameEl.value.trim(),
      email,
      pw: pwEl.value.trim(),
    });

    writeJSON(LS_USERS, users);

    setTimeout(() => {
      window.location.href = REDIRECT_AFTER_SIGNUP;
    }, 300);
  });

  [nameEl, emailEl, pwEl, pw2El].forEach((el) => el.addEventListener("input", updateBtn));
  policyEl.addEventListener("change", updateBtn);
  updateBtn();

  // Password toggles (nur wenn diese IDs existieren)
  setupPasswordToggle("suPw", "lockPw", "eyePw");
  setupPasswordToggle("suPw2", "lockPw2", "eyePw2");
}

/* ================== GLOBAL INIT ================== */
document.addEventListener("DOMContentLoaded", () => {
  initAnimation();
  initLogin();
  initSignup();
});
