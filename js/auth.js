
(() => {
  const LS_CURRENT = "join_current_user";
  const LS_USERS = "join_users";
  const REDIRECT_AFTER_LOGIN = "./summary.html";

  const $ = (id) => document.getElementById(id);

  function setText(id, txt) {
    const el = $(id);
    if (el) el.textContent = txt || "";
  }

  function isEmailLike(v) {
    const s = (v || "").trim();
    if (!s.includes("@")) return false;
    const parts = s.split("@");
    if (parts.length !== 2) return false;
    if (!parts[0] || !parts[1] || !parts[1].includes(".")) return false;
    return true;
  }

  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(LS_USERS)) || [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }

  function saveCurrentUser(user) {
    localStorage.setItem(LS_CURRENT, JSON.stringify(user));
  }

  function showToast(msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    window.setTimeout(() => t.classList.remove("show"), 1800);
  }

  function initLogin() {
    const form = $("loginForm");
    if (!form) return;

    const emailEl = $("email");
    const pwEl = $("password");
    const btnLogin = $("btnLogin");
    const btnGuest = $("btnGuest");

    function updateBtn() {
      const email = (emailEl?.value || "").trim();
      const pw = (pwEl?.value || "").trim();
      if (btnLogin) btnLogin.disabled = !(email && pw);
    }

    function loginNormal() {
      const email = (emailEl?.value || "").trim();
      const pw = (pwEl?.value || "").trim();

      if (!email || !pw) return setText("formMsg", "Please fill in email and password.");
      if (!isEmailLike(email)) return setText("formMsg", "Please enter a valid email address.");

     
      const users = loadUsers();
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      const nameFromEmail = email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase())
        .trim();

      const name = (found?.name || nameFromEmail || "User").trim();

      saveCurrentUser({ name, email, guest: false });
      window.location.href = REDIRECT_AFTER_LOGIN;
    }

    function loginGuest() {
      saveCurrentUser({ name: "Guest", email: "guest@join.local", guest: true });
      window.location.href = REDIRECT_AFTER_LOGIN;
    }

    emailEl?.addEventListener("input", () => {
      setText("formMsg", "");
      updateBtn();
    });

    pwEl?.addEventListener("input", () => {
      setText("formMsg", "");
      updateBtn();
    });

    updateBtn();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      setText("formMsg", "");
      loginNormal();
    });

    btnGuest?.addEventListener("click", (e) => {
      e.preventDefault();
      setText("formMsg", "");
      loginGuest();
    });
  }

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
      const name = (nameEl?.value || "").trim();
      const email = (emailEl?.value || "").trim();
      const pw = (pwEl?.value || "").trim();
      const pw2 = (pw2El?.value || "").trim();
      const ok = policyEl?.checked && name && email && pw && pw2;
      if (btn) btn.disabled = !ok;
    }

    function signup() {
      const name = (nameEl?.value || "").trim();
      const email = (emailEl?.value || "").trim();
      const pw = (pwEl?.value || "").trim();
      const pw2 = (pw2El?.value || "").trim();

      setText("suMsg", "");

      if (!name || !email || !pw || !pw2) return setText("suMsg", "Please fill in all fields.");
      if (!isEmailLike(email)) return setText("suMsg", "Please enter a valid email address.");
      if (pw.length < 6) return setText("suMsg", "Password must be at least 6 characters.");
      if (pw !== pw2) return setText("suMsg", "Passwords do not match.");
      if (!policyEl?.checked) return setText("suMsg", "Please accept the privacy policy.");

      const users = loadUsers();
      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) return setText("suMsg", "This email is already registered.");

      users.push({ name, email, pw });
      saveUsers(users);

      showToast("You Signed Up successfully");

  
      window.setTimeout(() => {
        window.location.href = "./index.html";
      }, 900);
    }

    [nameEl, emailEl, pwEl, pw2El, policyEl].forEach((el) => {
      el?.addEventListener("input", () => {
        setText("suMsg", "");
        updateBtn();
      });
      el?.addEventListener("change", () => {
        setText("suMsg", "");
        updateBtn();
      });
    });

    updateBtn();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      signup();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLogin();
    initSignup();
  });
})();
