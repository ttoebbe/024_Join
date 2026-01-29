/**
 * Builds the main navigation bar HTML.
 * @returns {string}
 */
function getNavBarTemplate() {
  return `
  <div class="nav-bar">
    <div class="nav-logo">
      <img class="nav-img" src="../../assets/img/capa-2.svg" alt="Join Logo" />
    </div>

    <div class="nav-links">
      <nav>
        <a href="summary.html" data-route="summary">
          <img src="../../assets/img/icons/summary.svg" alt="" />
          <p>Summary</p>
        </a>
        <a href="add-task.html" data-route="add_task">
          <img src="../../assets/img/icons/addtasks.svg" alt="" />
          <p>Add Tasks</p>
        </a>
        <a href="board.html" data-route="board">
          <img src="../../assets/img/icons/board.svg" alt="" />
          <p>Board</p>
        </a>
        <a href="contacts.html" data-route="contacts">
          <img src="../../assets/img/icons/contact.svg" alt="" />
          <p>Contacts</p>
        </a>
      </nav>

      <div class="footer-links">
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="legal-notice.html">Legal notice</a>
      </div>
    </div>
  </div>
`;
}

/**
 * Builds the guest navigation bar HTML.
 * @returns {string}
 */
function getGuestNavTemplate() {
  return `
  <div class="nav-bar">
    <div class="nav-logo">
      <img class="nav-img" src="../../assets/img/capa-2.svg" alt="Join Logo" />
    </div>

    <div class="nav-links">
      <nav>
        <a href="../../index.html" data-route="login">
          <img src="../../assets/img/icons/lock.svg" alt="" />
          <p>Log In</p>
        </a>
      </nav>

      <div class="footer-links">
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="legal-notice.html">Legal notice</a>
      </div>
    </div>
  </div>
`;
}

/**
 * Builds the guest header HTML.
 * @returns {string}
 */
function getGuestHeaderTemplate() {
  return `
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
}

/**
 * Builds the authenticated header HTML.
 * @returns {string}
 */
function getHeaderTemplate() {
  return `
  <header class="topbar">
    <div class="topbar-inner">
      <div class="topbar-logo" aria-hidden="true"></div>

      <p class="topbar-title">Kanban Project Management Tool</p>

      <div class="topbar-actions">
        <a class="topbar-help" href="help.html" aria-label="Help">?</a>

        <div class="user-menu-wrap" id="user-menu-wrap">
          <button class="topbar-user" id="user-menu-btn" type="button" aria-label="User menu" aria-haspopup="menu" aria-expanded="false">
            <span id="user-initials">G</span>
          </button>

          <div class="user-dropdown" id="user-dropdown" role="menu" hidden>
            <a class="user-dropdown-item" href="legal-notice.html" role="menuitem">Legal Notice</a>
            <a class="user-dropdown-item" href="privacy-policy.html" role="menuitem">Privacy Policy</a>
            <button class="user-dropdown-item user-dropdown-logout" type="button" id="user-logout" role="menuitem">Log out</button>
          </div>
        </div>
      </div>
    </div>
  </header>
`;
}

/**
 * Generates the HTML for the confirm overlay dialog.
 * @param {Object} options - Title, message, and button texts
 * @returns {string} HTML string
 */
function getConfirmOverlayTemplate({
  title,
  message,
  confirmText,
  cancelText,
}) {
  return `<div class="confirm-backdrop" data-confirm-cancel></div><div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmOverlayTitle"><h3 class="confirm-title" id="confirmOverlayTitle">${title}</h3><p class="confirm-message">${message}</p><div class="confirm-actions"><button type="button" class="confirm-btn confirm-btn-secondary" data-confirm-cancel>${cancelText}</button><button type="button" class="confirm-btn confirm-btn-primary" data-confirm-ok>${confirmText}</button></div></div>`;
}
