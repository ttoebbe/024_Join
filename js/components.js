const NAV_BAR_SOURCE = '/pages/components/nav-bar.html';
const HEADER_SOURCE = '/pages/components/header.html';

async function loadNavBar() {
    const host = document.getElementById('nav-bar-placeholder');
    if (!host) return;
    const response = await fetch(NAV_BAR_SOURCE);
    host.innerHTML = await response.text();
}

loadNavBar();

async function loadHeader() {
    const host = document.getElementById('header-placeholder');
    if (!host) return;
    const response = await fetch(HEADER_SOURCE);
    host.innerHTML = await response.text();
}

loadHeader();