const NAV_BAR_TEMPLATE = `
  <div class="nav_bar">
    <div class="nav_logo">
      <img class="nav_img" src="../../assets/img/Capa 2.png" alt="Join Logo" />
    </div>

    <div class="nav_links">
      <nav>
        <a href="summary.html" data-route="summary">
          <img src="../../assets/img/icons/summary.png" alt="" />
          <p>Summary</p>
        </a>
        <a href="add_task.html" data-route="add_task">
          <img src="../../assets/img/icons/addtasks.png" alt="" />
          <p>Add Tasks</p>
        </a>
        <a href="board.html" data-route="board">
          <img src="../../assets/img/icons/board.png" alt="" />
          <p>Board</p>
        </a>
        <a href="contacts.html" data-route="contacts">
          <img src="../../assets/img/icons/contact.png" alt="" />
          <p>Contacts</p>
        </a>
      </nav>

      <div class="footer_links">
        <a href="privacy_policy.html">Privacy Policy</a>
        <a href="legal_notice.html">Legal notice</a>
      </div>
    </div>
  </div>
`;

const GUEST_NAV_TEMPLATE = `
  <div class="nav_bar">
    <div class="nav_logo">
      <img class="nav_img" src="../../assets/img/Capa 2.png" alt="Join Logo" />
    </div>

    <div class="nav_links">
      <nav>
        <a href="../../index.html" data-route="login">
          <img src="../../assets/img/icons/lock.png" alt="" />
          <p>Log In</p>
        </a>
      </nav>

      <div class="footer_links">
        <a href="privacy_policy.html">Privacy Policy</a>
        <a href="legal_notice.html">Legal notice</a>
      </div>
    </div>
  </div>
`;

const GUEST_HEADER_TEMPLATE = `
  <header class="topbar">
    <div class="topbar-inner">
      <div class="topbar-logo" aria-hidden="true"></div>

      <p class="topbar-title">Kanban Project Management Tool</p>

      <div class="topbar-actions">
        <a class="topbar-help" href="help.html" aria-label="Help">?</a>
      </div>
    </div>
  </header>
`;

const HEADER_TEMPLATE = `
  <header class="topbar">
    <div class="topbar-inner">
      <div class="topbar-logo" aria-hidden="true"></div>

      <p class="topbar-title">Kanban Project Management Tool</p>

      <div class="topbar-actions">
        <a class="topbar-help" href="help.html" aria-label="Help">?</a>

        <div class="user-menu-wrap" id="userMenuWrap">
          <button class="topbar-user" id="userMenuBtn" type="button" aria-label="User menu" aria-haspopup="menu" aria-expanded="false">
            <span id="userInitials">G</span>
          </button>

          <div class="user-dropdown" id="userDropdown" role="menu" hidden>
            <a class="user-dropdown__item" href="legal_notice.html" role="menuitem">Legal Notice</a>
            <a class="user-dropdown__item" href="privacy_policy.html" role="menuitem">Privacy Policy</a>
            <button class="user-dropdown__item user-dropdown__logout" type="button" id="userLogout" role="menuitem">Log out</button>
          </div>
        </div>
      </div>
    </div>
  </header>
`;

document.addEventListener("DOMContentLoaded", () => {
  if (shouldHideNavForGuest()) {
    applyGuestMode();
    return;
  }
  renderNavBar();
  renderHeader();
  setActiveNavLink();
  renderUserInitials();
  initUserMenu();
});


/**
 * @returns {*}
 */
function shouldHideNavForGuest() {
  if (getCurrentUser()) return false;
  return isPolicyPage();
}


/**
 * @returns {*}
 */
function isPolicyPage() {
  const path = window.location.pathname.toLowerCase();
  return path.endsWith("/legal_notice.html") || 
         path.endsWith("/privacy_policy.html") ||
         path.endsWith("/help.html");
}


/**
 * @returns {*}
 */
function applyGuestMode() {
  document.body.classList.add("guest-mode");
  const nav = document.getElementById("nav-bar-placeholder");
  const header = document.getElementById("header-placeholder");
  if (nav) nav.innerHTML = GUEST_NAV_TEMPLATE;
  if (header) header.innerHTML = GUEST_HEADER_TEMPLATE;
}

/**
 * @returns {*}
 */
function renderNavBar() {
  const host = document.getElementById("nav-bar-placeholder");
  if (!host) return;
  host.innerHTML = NAV_BAR_TEMPLATE;
}

/**
 * @returns {*}
 */
function renderHeader() {
  const host = document.getElementById("header-placeholder");
  if (!host) return;
  host.innerHTML = HEADER_TEMPLATE;
}

/**
 * @returns {*}
 */
function setActiveNavLink() {
  const nav = document.querySelector(".nav_links nav");
  if (!nav) return;
  resetNavActive(nav);
  const match = findActiveNavLink(nav);
  if (match) match.classList.add("nav-active");
}

/**
 * @param {*} nav
 * @returns {*}
 */
function resetNavActive(nav) {
  nav.querySelectorAll("a").forEach((a) => a.classList.remove("nav-active"));
}

/**
 * @param {*} nav
 * @returns {*}
 */
function findActiveNavLink(nav) {
  const path = window.location.pathname.toLowerCase();
  return [...nav.querySelectorAll("a")].find((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    return href && path.endsWith(href);
  });
}

/**
 * @returns {*}
 */
function renderUserInitials() {
  const el = document.getElementById("userInitials");
  if (!el) return;
  const current = getCurrentUser();
  const label = current?.name || current?.email || (current?.guest ? "Guest" : "") || "G";
  el.textContent = getInitials(label);
}

/**
 * @returns {*}
 */
function initUserMenu() {
  const parts = getUserMenuParts();
  if (!parts) return;
  setActiveDropdownLinks(parts.dropdown);
  wireUserMenuEvents(parts);
  wireLogout(parts.logoutBtn);
}

/**
 * @returns {*}
 */
function getUserMenuParts() {
  const wrap = document.getElementById("userMenuWrap");
  const btn = document.getElementById("userMenuBtn");
  const dropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("userLogout");
  if (!wrap || !btn || !dropdown) return null;
  return { wrap, btn, dropdown, logoutBtn };
}

/**
 * @param {*} dropdown
 * @returns {*}
 */
function setActiveDropdownLinks(dropdown) {
  const path = window.location.pathname.toLowerCase();
  dropdown.querySelectorAll("a.user-dropdown__item").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href && path.endsWith(href)) a.classList.add("is-active");
  });
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireUserMenuEvents(parts) {
  parts.btn.addEventListener("click", (e) => toggleUserMenu(e, parts));
  document.addEventListener("click", (e) => closeOnOutsideClick(e, parts));
  document.addEventListener("keydown", (e) => closeOnEscape(e, parts));
}

/**
 * @param {*} e
 * @param {*} parts
 * @returns {*}
 */
function toggleUserMenu(e, parts) {
  e.stopPropagation();
  parts.dropdown.hidden ? openUserMenu(parts) : closeUserMenu(parts);
}

/**
 * @param {*} parts
 * @returns {*}
 */
function openUserMenu(parts) {
  parts.dropdown.hidden = false;
  parts.btn.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => parts.dropdown.classList.add("open"));
}

/**
 * @param {*} parts
 * @returns {*}
 */
function closeUserMenu(parts) {
  parts.dropdown.classList.remove("open");
  parts.btn.setAttribute("aria-expanded", "false");
  setTimeout(() => { parts.dropdown.hidden = true; }, 120);
}

/**
 * @param {*} e
 * @param {*} parts
 * @returns {*}
 */
function closeOnOutsideClick(e, parts) {
  if (parts.dropdown.hidden) return;
  if (parts.wrap.contains(e.target)) return;
  closeUserMenu(parts);
}

/**
 * @param {*} e
 * @param {*} parts
 * @returns {*}
 */
function closeOnEscape(e, parts) {
  if (e.key !== "Escape" || parts.dropdown.hidden) return;
  closeUserMenu(parts);
}

/**
 * @param {*} logoutBtn
 * @returns {*}
 */
function wireLogout(logoutBtn) {
  logoutBtn?.addEventListener("click", () => {
    setCurrentUser(null);
    window.location.href = "/index.html";
  });
}
