(() => {
  /* ================== ANIMATION ================== */
  function initAnimation() {
    setTimeout(startAnimation, 200);
  }

  function startAnimation() {
    const homepageImage = document.getElementById("img_animation");
    const bg = document.getElementById("bg");

    homepageImage?.classList.add("animiert");
    bg?.classList.add("bg-animiert");

    setTimeout(() => {
      if (bg) bg.style.display = "none";
    }, 500);
  }

  /* ================== KONSTANTEN ================== */
  const LS_CURRENT = "join_current_user";
  const LS_USERS = "join_users";
  const REDIRECT_AFTER_LOGIN = "/pages/summary.html";
  const $ = (id) => document.getElementById(id);

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

    function updateBtn() {
      btnLogin.disabled = !(emailEl.value && pwEl.value);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      saveCurrentUser({ email: emailEl.value });
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

    function updateBtn() {
      btn.disabled = !(
        nameEl.value &&
        emailEl.value &&
        pwEl.value &&
        pw2El.value &&
        policyEl.checked
      );
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (pwEl.value !== pw2El.value) {
        return;
      }

      const users = JSON.parse(localStorage.getItem(LS_USERS)) || [];
      users.push({
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        pw: pwEl.value.trim()
      });

      localStorage.setItem(LS_USERS, JSON.stringify(users));
      setTimeout(() => window.location.href = "/index.html", 800);
    });

    [nameEl, emailEl, pwEl, pw2El, policyEl].forEach(el => {
      el.addEventListener("input", updateBtn);
      el.addEventListener("change", updateBtn);
    });

    updateBtn();

    // 🔐 PASSWORD TOGGLES
    setupPasswordToggle("suPw", "lockPw", "eyePw");
    setupPasswordToggle("suPw2", "lockPw2", "eyePw2");
  }

  /* ================== GLOBAL INIT ================== */
  document.addEventListener("DOMContentLoaded", () => {
    initAnimation();
    initLogin();
    initSignup();
  });

})();
