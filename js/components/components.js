/**
 * Initialisiert die Komponenten nach DOM-Ready.
 */
document.addEventListener("DOMContentLoaded", handleComponentsReady);

function handleComponentsReady() {
  withPageReady(runComponentsInit);
}

function runComponentsInit() {
  if (shouldHideNavForGuest()) return applyGuestMode();
  renderNavBar();
  renderHeader();
  setActiveNavLink();
  renderUserInitials();
  initUserMenu();
}

function shouldHideNavForGuest() {
  if (getCurrentUser()) return false;
  return isPolicyPage();
}

function isPolicyPage() {
  const path = window.location.pathname.toLowerCase();
  return (
    path.endsWith("/legal-notice.html") ||
    path.endsWith("/privacy-policy.html") ||
    path.endsWith("/help.html")
  );
}

function applyGuestMode() {
  document.body.classList.add("guest-mode");
  const nav = document.getElementById("nav-bar-placeholder");
  const header = document.getElementById("header-placeholder");
  if (nav) nav.innerHTML = getGuestNavTemplate();
  if (header) header.innerHTML = getGuestHeaderTemplate();
}

function renderNavBar() {
  const host = document.getElementById("nav-bar-placeholder");
  if (!host) return;
  host.innerHTML = getNavBarTemplate();
}

function renderHeader() {
  const host = document.getElementById("header-placeholder");
  if (!host) return;
  host.innerHTML = getHeaderTemplate();
}

function setActiveNavLink() {
  const nav = document.querySelector(".nav-links nav");
  if (!nav) return;
  resetNavActive(nav);
  const match = findActiveNavLink(nav);
  if (match) match.classList.add("nav-active");
}

/**
 * Setzt den aktiven Zustand im Navigationsbereich zurück.
 * @param {HTMLElement} nav
 */
function resetNavActive(nav) {
  nav
    .querySelectorAll("a")
    .forEach((link) => link.classList.remove("nav-active"));
}

/**
 * Ermittelt den passenden aktiven Navigationslink.
 * @param {HTMLElement} nav
 * @returns {HTMLElement | undefined}
 */
function findActiveNavLink(nav) {
  const path = window.location.pathname.toLowerCase();
  return [...nav.querySelectorAll("a")].find((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    return href && path.endsWith(href);
  });
}

function renderUserInitials() {
  const el = document.getElementById("user-initials");
  if (!el) return;
  const current = getCurrentUser();
  const label =
    current?.name || current?.email || (current?.guest ? "Guest" : "") || "G";
  el.textContent = getInitials(label);
}

function initUserMenu() {
  const parts = getUserMenuParts();
  if (!parts) return;
  setActiveDropdownLinks(parts.dropdown);
  wireUserMenuEvents(parts);
  wireLogout(parts.logoutBtn);
}

function getUserMenuParts() {
  const wrap = document.getElementById("user-menu-wrap");
  const btn = document.getElementById("user-menu-btn");
  const dropdown = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("user-logout");
  if (!wrap || !btn || !dropdown) return null;
  return { wrap, btn, dropdown, logoutBtn };
}

/**
 * Markiert den aktiven Link im User-Menü.
 * @param {HTMLElement} dropdown
 */
function setActiveDropdownLinks(dropdown) {
  const path = window.location.pathname.toLowerCase();
  dropdown.querySelectorAll("a.user-dropdown-item").forEach((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    if (href && path.endsWith(href)) link.classList.add("is-active");
  });
}

/**
 * Verdrahtet die User-Menü-Events.
 * @param {{ wrap: HTMLElement, btn: HTMLElement, dropdown: HTMLElement, logoutBtn: (HTMLElement | null) }} parts
 */
function wireUserMenuEvents(parts) {
  parts.btn.addEventListener("click", (event) => toggleUserMenu(event, parts));
  document.addEventListener("click", (event) =>
    closeOnOutsideClick(event, parts),
  );
  document.addEventListener("keydown", (event) => closeOnEscape(event, parts));
}

/**
 * Öffnet oder schließt das User-Menü.
 * @param {MouseEvent} event
 * @param {{ wrap: HTMLElement, btn: HTMLElement, dropdown: HTMLElement, logoutBtn: (HTMLElement | null) }} parts
 */
function toggleUserMenu(event, parts) {
  event.stopPropagation();
  parts.dropdown.hidden ? openUserMenu(parts) : closeUserMenu(parts);
}

/**
 * Öffnet das User-Menü.
 * @param {{ btn: HTMLElement, dropdown: HTMLElement }} parts
 */
function openUserMenu(parts) {
  parts.dropdown.hidden = false;
  parts.btn.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => parts.dropdown.classList.add("open"));
}

/**
 * Schließt das User-Menü.
 * @param {{ btn: HTMLElement, dropdown: HTMLElement }} parts
 */
function closeUserMenu(parts) {
  parts.dropdown.classList.remove("open");
  parts.btn.setAttribute("aria-expanded", "false");
  setTimeout(() => {
    parts.dropdown.hidden = true;
  }, 120);
}

/**
 * Schließt das Menü bei Klick außerhalb.
 * @param {MouseEvent} event
 * @param {{ wrap: HTMLElement, dropdown: HTMLElement }} parts
 */
function closeOnOutsideClick(event, parts) {
  if (parts.dropdown.hidden) return;
  if (parts.wrap.contains(event.target)) return;
  closeUserMenu(parts);
}

/**
 * Schließt das Menü bei Escape.
 * @param {KeyboardEvent} event
 * @param {{ dropdown: HTMLElement }} parts
 */
function closeOnEscape(event, parts) {
  if (event.key !== "Escape" || parts.dropdown.hidden) return;
  closeUserMenu(parts);
}

/**
 * Verdrahtet den Logout.
 * @param {HTMLElement | null} logoutBtn
 */
function wireLogout(logoutBtn) {
  logoutBtn?.addEventListener("click", () => {
    setCurrentUser(null);
    sessionStorage.removeItem("mobileGreetingShown");
    window.location.href = "/index.html";
  });
}
