// function init() {
//     setTimeout(startAnimation, 200); 
// }

// function startAnimation() {
//     let homepageImage = document.getElementById('img_animation');
//     homepageImage.classList.add('animiert');
//     document.getElementById('bg').classList.add('bg-animiert');
//     setTimeout(() => {
//         document.getElementById('bg').style.display = 'none';
//     }, 500);
// }

// (() => {
//   /* ================== ANIMATION ================== */
//   function initAnimation() {
//     setTimeout(startAnimation, 200);
//   }

//   function startAnimation() {
//     const homepageImage = document.getElementById("img_animation");
//     const bg = document.getElementById("bg");

//     homepageImage?.classList.add("animiert");
//     bg?.classList.add("bg-animiert");

//     setTimeout(() => {
//       if (bg) bg.style.display = "none";
//     }, 500);
//   }

//   /* ================== KONSTANTEN ================== */
//   const LS_CURRENT = "join_current_user";
//   const LS_USERS = "join_users";
//   const REDIRECT_AFTER_LOGIN = "./summary.html";

//   const $ = (id) => document.getElementById(id);

//   function setText(id, txt) {
//     const el = $(id);
//     if (el) el.textContent = txt || "";
//   }

//   function isEmailLike(v) {
//     const s = (v || "").trim();
//     return s.includes("@") && s.includes(".");
//   }

//   function loadUsers() {
//     try {
//       return JSON.parse(localStorage.getItem(LS_USERS)) || [];
//     } catch {
//       return [];
//     }
//   }

//   function saveUsers(users) {
//     localStorage.setItem(LS_USERS, JSON.stringify(users));
//   }

//   function saveCurrentUser(user) {
//     localStorage.setItem(LS_CURRENT, JSON.stringify(user));
//   }

//   function showToast(msg) {
//     const t = $("toast");
//     if (!t) return;
//     t.textContent = msg;
//     t.classList.add("show");
//     setTimeout(() => t.classList.remove("show"), 1800);
//   }

//   /* ================== LOGIN ================== */
//   function initLogin() {
//     const form = $("loginForm");
//     if (!form) return;

//     const emailEl = $("email");
//     const pwEl = $("password");
//     const btnLogin = $("btnLogin");
//     const btnGuest = $("btnGuest");

//     function updateBtn() {
//       btnLogin.disabled = !(emailEl.value && pwEl.value);
//     }

//     form.addEventListener("submit", (e) => {
//       e.preventDefault();

//       const email = emailEl.value.trim();
//       const pw = pwEl.value.trim();

//       if (!isEmailLike(email)) {
//         setText("formMsg", "Invalid email");
//         return;
//       }

//       const users = loadUsers();
//       const found = users.find(
//         (u) => u.email.toLowerCase() === email.toLowerCase()
//       );

//       const name =
//         found?.name ||
//         email.split("@")[0].replace(/[_\-.]/g, " ");

//       saveCurrentUser({ name, email, guest: false });
//       window.location.href = REDIRECT_AFTER_LOGIN;
//     });

//     btnGuest?.addEventListener("click", (e) => {
//       e.preventDefault();
//       saveCurrentUser({ name: "Guest", email: "guest@join.local", guest: true });
//       window.location.href = REDIRECT_AFTER_LOGIN;
//     });

//     emailEl.addEventListener("input", updateBtn);
//     pwEl.addEventListener("input", updateBtn);
//     updateBtn();
//   }

//   /* ================== SIGNUP ================== */
//   function initSignup() {
//     const form = $("signupForm");
//     if (!form) return;

//     const nameEl = $("suName");
//     const emailEl = $("suEmail");
//     const pwEl = $("suPw");
//     const pw2El = $("suPw2");
//     const policyEl = $("suPolicy");
//     const btn = $("btnSignup");

//     function updateBtn() {
//       btn.disabled = !(
//         nameEl.value &&
//         emailEl.value &&
//         pwEl.value &&
//         pw2El.value &&
//         policyEl.checked
//       );
//     }

//     form.addEventListener("submit", (e) => {
//       e.preventDefault();

//       if (pwEl.value !== pw2El.value) {
//         setText("suMsg", "Passwords do not match");
//         return;
//       }

//       const users = loadUsers();
//       if (users.some(u => u.email === emailEl.value)) {
//         setText("suMsg", "Email already exists");
//         return;
//       }

//       users.push({
//         name: nameEl.value.trim(),
//         email: emailEl.value.trim(),
//         pw: pwEl.value.trim()
//       });

//       saveUsers(users);
//       showToast("Sign Up successful");

//       setTimeout(() => {
//         window.location.href = "./index.html";
//       }, 800);
//     });

//     [nameEl, emailEl, pwEl, pw2El, policyEl].forEach(el => {
//       el.addEventListener("input", updateBtn);
//       el.addEventListener("change", updateBtn);
//     });

//     updateBtn();
//   }

//   /* ================== GLOBAL INIT ================== */
//   document.addEventListener("DOMContentLoaded", () => {
//     initAnimation();
//     initLogin();
//     initSignup();
//   });
// })();






document.addEventListener('DOMContentLoaded', () => {
    const passwordField = document.getElementById('password');
    const passwordLock = document.getElementById('passwordLock');
    const visibilityBtn = document.getElementById('visibilityImg');

    // Klick ins Passwort-Feld → Schloss weg, Visibility-Icon erscheint
    passwordField.addEventListener('click', (event) => {
        event.stopPropagation();
        passwordLock.classList.add('d-none');           // Schloss verstecken
        visibilityBtn.classList.remove('d-none');       // Visibility-Icon zeigen
        visibilityBtn.classList.add('input-icon-password'); // Position anpassen
        visibilityBtn.src = '/img/icons/visibility_off.png'; // Standard Icon
    });

    // Klick auf Visibility-Icon → Passwort anzeigen / verstecken
    visibilityBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Bubbling verhindern

        if (passwordField.type === 'password') {
            passwordField.type = 'text';                   // Passwort anzeigen
            visibilityBtn.src = '/img/icons/visibility.png'; // Icon ändern
            visibilityBtn.classList.add('input-icon-password'); // Position anpassen
        } else {
            passwordField.type = 'password';               // Passwort verstecken
            visibilityBtn.src = '/img/icons/visibility_off.png'; // Icon zurücksetzen
            visibilityBtn.classList.add('input-icon-password'); // Position anpassen
        }
    });

    // Optional: Schloss-Icon Klick stoppt Bubbling (falls parent click hat)
    passwordLock.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});

