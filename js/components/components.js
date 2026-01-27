document.addEventListener("DOMContentLoaded", handleComponentsReady);

/**
 * @returns {void}
 */
function handleComponentsReady() {
  withPageReady(runComponentsInit);
}

/**
 * @returns {void}
 */
function runComponentsInit() {
  if (shouldHideNavForGuest()) return applyGuestMode();
  renderNavBar();
  renderHeader();
  setActiveNavLink();
  renderUserInitials();
  initUserMenu();
}


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
  return path.endsWith("/legal-notice.html") || 
         path.endsWith("/privacy-policy.html") ||
         path.endsWith("/help.html");
}


/**
 * @returns {*}
 */
function applyGuestMode() {
  document.body.classList.add("guest-mode");
  const nav = document.getElementById("nav-bar-placeholder");
  const header = document.getElementById("header-placeholder");
  if (nav) nav.innerHTML = getGuestNavTemplate();
  if (header) header.innerHTML = getGuestHeaderTemplate();
}

/**
 * @returns {*}
 */
function renderNavBar() {
  const host = document.getElementById("nav-bar-placeholder");
  if (!host) return;
  host.innerHTML = getNavBarTemplate();
}

/**
 * @returns {*}
 */
function renderHeader() {
  const host = document.getElementById("header-placeholder");
  if (!host) return;
  host.innerHTML = getHeaderTemplate();
}

/**
 * @returns {*}
 */
function setActiveNavLink() {
  const nav = document.querySelector(".nav-links nav");
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
  const el = document.getElementById("user-initials");
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
  const wrap = document.getElementById("user-menu-wrap");
  const btn = document.getElementById("user-menu-btn");
  const dropdown = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("user-logout");
  if (!wrap || !btn || !dropdown) return null;
  return { wrap, btn, dropdown, logoutBtn };
}

/**
 * @param {*} dropdown
 * @returns {*}
 */
function setActiveDropdownLinks(dropdown) {
  const path = window.location.pathname.toLowerCase();
  dropdown.querySelectorAll("a.user-dropdown-item").forEach((a) => {
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
    sessionStorage.removeItem("mobileGreetingShown");
    window.location.href = "/index.html";
  });
}



