document.addEventListener('DOMContentLoaded', () => {
  renderNavBar();
  renderHeader();
  setActiveNavLink();
  renderUserInitials();
});

function renderNavBar() {
  const host = document.getElementById('nav-bar-placeholder');
  if (!host) return;

  host.innerHTML = `
    <div class="nav_bar">
      <div class="nav_logo">
        <img class="nav_img" src="/imgs/homepage_join.png" alt="Join Logo" />
      </div>

      <div class="nav_links">
        <nav>
          <a href="/pages/summary.html" data-route="summary">
            <img src="/imgs/icons/summary.png" alt="" />
            <p>Summary</p>
          </a>
          <a href="/pages/add_task.html" data-route="add_task">
            <img src="/imgs/icons/add_task.png" alt="" />
            <p>Add Tasks</p>
          </a>
          <a href="/pages/board.html" data-route="board">
            <img src="/imgs/icons/board.png" alt="" />
            <p>Board</p>
          </a>
          <a href="/pages/contacts.html" data-route="contacts">
            <img src="/imgs/icons/contacts.png" alt="" />
            <p>Contacts</p>
          </a>
        </nav>

        <div class="footer_links">
          <a href="/pages/privacy_policy.html">Privacy Policy</a>
          <a href="/pages/legal_notice.html">Legal notice</a>
        </div>
      </div>
    </div>
  `;
}

function renderHeader() {
  const host = document.getElementById('header-placeholder');
  if (!host) return;

  host.innerHTML = `
    <header class="topbar">
      <div class="topbar-logo" aria-hidden="true"></div>

      <p class="topbar-title">Kanban Project Management Tool</p>

      <div class="topbar-actions">
        <a class="topbar-help" href="/pages/help.html" aria-label="Help">?</a>

        <button class="topbar-user" type="button" aria-label="User">
          <span id="userInitials">G</span>
        </button>
      </div>
    </header>
  `;
}

function setActiveNavLink() {
  const nav = document.querySelector('.nav_links nav');
  if (!nav) return;

  const path = window.location.pathname.toLowerCase();

  nav.querySelectorAll('a').forEach(a => a.classList.remove('nav-active'));

  const match = [...nav.querySelectorAll('a')].find(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    return href && path.endsWith(href);
  });

  if (match) match.classList.add('nav-active');
}

function renderUserInitials() {
  const el = document.getElementById('userInitials');
  if (!el) return;

  // gleiche Logik wie in summary.js (Index in users-Array)
  const currentUser = localStorage.getItem('currentUser');
  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (!currentUser || currentUser === "0" || !users[currentUser]) {
    el.textContent = 'G';
    return;
  }

  const user = users[currentUser];
  const first = (user.firstName || user.firstname || '').trim();
  const last  = (user.lastName || user.lastname || '').trim();

  const initials =
    (first ? first[0] : '') +
    (last ? last[0] : '');

  el.textContent = (initials || 'U').toUpperCase();
}
