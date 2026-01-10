document.addEventListener('DOMContentLoaded', () => {
  renderNavBar();
  renderHeader();
  setActiveNavLink();
  renderUserInitials();
  initUserMenu();
});

function renderNavBar() {
  const host = document.getElementById('nav-bar-placeholder');
  if (!host) return;

  host.innerHTML = `
    <div class="nav_bar">
      <div class="nav_logo">
        <img class="nav_img" src="../img/Capa 2.png" alt="Join Logo" />
      </div>

      <div class="nav_links">
        <nav>
          <a href="summary.html" data-route="summary">
            <img src="../img/icons/summary.png" alt="" />
            <p>Summary</p>
          </a>
          <a href="add_task.html" data-route="add_task">
            <img src="../img/icons/addtasks.png" alt="" />
            <p>Add Tasks</p>
          </a>
          <a href="board.html" data-route="board">
            <img src="../img/icons/board.png" alt="" />
            <p>Board</p>
          </a>
          <a href="contacts.html" data-route="contacts">
            <img src="../img/icons/contact.png" alt="" />
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
}

function renderHeader() {
  const host = document.getElementById('header-placeholder');
  if (!host) return;

  host.innerHTML = `
    <header class="topbar">
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

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'G';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderUserInitials() {
  const el = document.getElementById('userInitials');
  if (!el) return;

  // Neue Logik: join_current_user (gleich wie summary.js)
  let current = null;
  try {
    current = JSON.parse(localStorage.getItem('join_current_user'));
  } catch (_) {
    current = null;
  }

  const label = current?.name || current?.email || (current?.guest ? 'Guest' : '') || 'G';
  el.textContent = getInitials(label);
}

function initUserMenu() {
  const wrap = document.getElementById('userMenuWrap');
  const btn = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('userLogout');

  if (!wrap || !btn || !dropdown) return;

  // Active state im Dropdown (je nach aktueller Seite)
  const path = window.location.pathname.toLowerCase();
  dropdown.querySelectorAll('a.user-dropdown__item').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href && path.endsWith(href)) a.classList.add('is-active');
  });

  const open = () => {
    dropdown.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => dropdown.classList.add('open'));
  };

  const close = () => {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(() => { dropdown.hidden = true; }, 120);
  };

  const toggle = (e) => {
    e.stopPropagation();
    dropdown.hidden ? open() : close();
  };

  btn.addEventListener('click', toggle);

  // Klick außerhalb schließt
  document.addEventListener('click', (e) => {
    if (dropdown.hidden) return;
    if (wrap.contains(e.target)) return;
    close();
  });

  // ESC schließt
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dropdown.hidden) close();
  });

  // Logout
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('join_current_user');
    window.location.href = 'index.html';
  });
}
