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
    console.error('Error loading users:', error);
    return [];
  }
}

// Ruft alle Nutzer in Firebase ab und konvertiert sie in ein Array.
// Schreibt das Array anschließend in den LocalStorage.
// async function fetchUsersFromFirebaseToLocal() {
// Firebase-Daten holen
// const data = await firebaseRequest("users", { method: "GET" });

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

  setTimeout(() => {
    if (bg) bg.style.display = "none";
  }, 500);
}

/* ================== PASSWORD TOGGLE ================== */
// Richtet Augen- und Schloss-Icons für Passwortfelder ein.
// Steuert Sichtbarkeit und Typ des Eingabefelds je nach Input.
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

function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) {
    overlay.classList.add("show");
  }
}

/* ================== Overlay schließen ================== */
// function hideSuccessOverlay() {
//   const overlay = document.getElementById("successOverlay");
//   if (overlay) {
//     overlay.classList.remove("show");
//   }
// }

/* ================== LOGIN ================== */
// Initialisiert das Loginformular und seine Events.
// Validiert Eingaben, führt Login oder Gastmodus aus.
function initLogin() {
  const form = $("loginForm");
  if (!form) return;

  const emailEl = $("email");
  const pwEl = $("password");
  const btnLogin = $("btnLogin");
  const btnGuest = $("btnGuest");


  if (!emailEl || !pwEl || !btnLogin) return;

  // Aktiviert den Login-Button nur bei vollständigen Feldern.
  // Prüft dazu auf Trim-Inhalte in Mail und Passwort.
  function updateBtn() {
    btnLogin.disabled = !(emailEl.value.trim() && pwEl.value.trim());
  }

  /* ================= ERROR MSG ================= */

  // Zeigt die Fehlermeldung an und markiert die Felder.
  // Wird genutzt, wenn Login-Daten nicht gefunden werden.
  function showErrorState() {
    document.getElementById("errorMsg").style.display = "block";
    emailEl.classList.add("input-error");
    pwEl.classList.add("input-error");
  }

  // Versteckt Fehlermeldungen bei neuer Eingabe.
  // Entfernt die Fehlerklassen von beiden Feldern.
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
// Initialisiert das Signup-Formular mitsamt Validierung.
// Erstellt neue Nutzer nach erfolgreicher Prüfung.
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

  // Schaltet den Signup-Button nur bei kompletten Eingaben frei.
  // Bezieht neben Textfeldern auch die Policy-Checkbox ein.
  function updateBtn() {
    btn.disabled = !(
      nameEl.value.trim() &&
      emailEl.value.trim() &&
      pwEl.value.trim() &&
      pw2El.value.trim() &&
      policyEl.checked
    );
  }

  // Blendet die Passwort-Fehlermeldung sichtbar ein.
  // Markiert beide Passwortfelder mit einem Fehlerstil.
  function showErrorState() {
    const errorMsg = document.getElementById("errorSignupMsg");
    errorMsg.style.display = "block";
    pwEl.classList.add("input-error");
    pw2El.classList.add("input-error");
  }

  // Entfernt die Fehlermeldung sobald neu getippt wird.
  // Setzt die Passwortfelder optisch auf Normalzustand.
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

    showSuccessOverlay();

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
