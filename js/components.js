const NAV_BAR_SOURCE = '/pages/components/nav-bar.html';

async function loadNavBar() {
    const host = document.getElementById('nav-bar-placeholder');
    if (!host) return;
    const response = await fetch(NAV_BAR_SOURCE);
    host.innerHTML = await response.text();
}

loadNavBar();