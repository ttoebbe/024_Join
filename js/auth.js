/* ================== IMPORTS ================== */
import { ROUTES } from './core/constants.js';
import { UserService, getCurrentUser, setCurrentUser } from './core/firebase-service.js';
import { getElementById, isValidEmail, generateRandomColor, generateNextUserId } from './core/utils.js';

/* ================== HELPERS ================== */
const $ = (id) => getElementById(id);

async function saveCurrentUser(user) {
  setCurrentUser(user);
  // No Firebase save here - just session storage
}

async function loadUsers() {
  try {
    const users = await UserService.getAll();
    return users ? Object.values(users) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

/**
 * Holt alle User von Firebase und speichert sie in LocalStorage.
 * Verwendet bestehende Funktionen: firebaseRequest und writeJSON
 */
// async function fetchUsersFromFirebaseToLocal() {
//   // Firebase-Daten holen
//   const data = await firebaseRequest("users", { method: "GET" });

//   if (!data) {
//     console.log("Keine User von Firebase erhalten.");
//     return;
//   }

//   // Firebase liefert ein Objekt mit zufälligen Keys → Array erstellen
//   const usersArray = Object.values(data);

//   // In LocalStorage speichern (bestehende Funktion writeJSON)
//   writeJSON(LS_USERS, usersArray);

//   // console.log("Users von Firebase in LocalStorage gespeichert:", usersArray);
// }


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
      eye.classList.add('input-icon-password');
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

  /* ================= ERROR MSG ================= */

  function showErrorState() {
    document.getElementById("errorMsg").style.display = "block";
    emailEl.classList.add("input-error");
    pwEl.classList.add("input-error");
  }

  function clearErrorState() {
    document.getElementById("errorMsg").style.display = "none";
    emailEl.classList.remove("input-error");
    pwEl.classList.remove("input-error");
  }


  // 👉 EINMAL registrieren
  emailEl.addEventListener("input", clearErrorState);
  pwEl.addEventListener("input", clearErrorState);


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailEl.value.trim();
    const pw = pwEl.value.trim();

    // Optional “echter” Login: nur reinlassen wenn User existiert
    const users = await loadUsers();
    const found = users.find((u) => u.email === email && u.pw === pw);

    if (!found) {
      showErrorState();
      return;
    }

    await saveCurrentUser(found);  // Kompletten User übergeben
    window.location.href = ROUTES.SUMMARY;
  });

  btnGuest?.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveCurrentUser({ name: "Guest", guest: true });
    window.location.href = ROUTES.SUMMARY;
  });

  emailEl.addEventListener("input", updateBtn);
  pwEl.addEventListener("input", updateBtn);
  updateBtn();

  setupPasswordToggle("password", "passwordLock", "visibilityImg");

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
  const errorMsg = $("errorSignupMsg"); // Fehlermeldung

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

  function showErrorState() {
    const errorMsg = document.getElementById("errorSignupMsg");
    errorMsg.style.display = "block";
    pwEl.classList.add("input-error");
    pw2El.classList.add("input-error");
  }

  function clearErrorState() {
    const errorMsg = document.getElementById("errorSignupMsg");
    errorMsg.style.display = "none";
    pwEl.classList.remove("input-error");
    pw2El.classList.remove("input-error");
  }

  // Inputs, bei denen Tippfehler die Meldung entfernt
  pwEl.addEventListener("input", clearErrorState);
  pw2El.addEventListener("input", clearErrorState);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (pwEl.value !== pw2El.value) {
      showErrorState();
      return;
    }

    const users = await loadUsers();
    const email = emailEl.value.trim();

    if (users.some((u) => u.email === email)) {
      alert("Diese Email ist bereits registriert.");
      return;
    }

    const newUser = {
      id: generateNextUserId(users),
      name: nameEl.value.trim(),
      email,
      pw: pwEl.value.trim(),
      color: generateRandomColor(),
    };

    await UserService.create(newUser);

    setTimeout(() => {
      window.location.href = ROUTES.LOGIN;
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
