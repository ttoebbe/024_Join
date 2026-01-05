/**
 * Initialisiert die Kontaktliste nach dem Laden der Seite.
 */
function initContactsPage() {
	const listElement = document.querySelector('.contact-list');
	if (!listElement) {
		return;
	}
	const data = getContactData();
	renderContactList(listElement, data);
}

/**
 * Liefert verfügbare Kontaktdaten aus dem Dummy-Datensatz.
 * @returns {Array<Object>} Sammlung der Kontaktdaten
 */
function getContactData() {
	if (Array.isArray(window.contacts)) {
		return window.contacts;
	}
	if (typeof contacts !== 'undefined' && Array.isArray(contacts)) {
		return contacts;
	}
	console.warn('Keine Kontaktdaten verfügbar.');
	return [];
}

/**
 * Rendert die übergebenen Kontakte in den Listencontainer.
 * @param {HTMLElement} container Ziel-Element für die Liste
 * @param {Array<Object>} data darzustellende Kontakte
 */
function renderContactList(container, data) {
	if (!data.length) {
		container.innerHTML = '';
		return;
	}
	container.innerHTML = data
		.map((item) => getContactTemplate(item))
		.join('');
}

/**
 * Erzeugt das HTML-Template für einen einzelnen Kontakt.
 * @param {Object} contact Kontaktobjekt
 * @returns {string} Template-String
 */
function getContactTemplate(contact) {
	const initials = getInitials(contact.name);
	const avatarColor = contact.color || '#2a3647';
	return `
		<article class="contact-entry" data-contact-id="${contact.id}">
			<span class="contact-avatar" style="background:${avatarColor}">${initials}</span>
			<div class="contact-meta">
				<p class="contact-name">${contact.name}</p>
				<p class="contact-email">${contact.email}</p>
			</div>
		</article>
	`;
}

/**
 * Ermittelt Initialen aus einem vollständigen Namen.
 * @param {string} name Kontaktname
 * @returns {string} Initialen-String
 */
function getInitials(name) {
	if (!name) {
		return '';
	}
	return name
		.split(' ')
		.filter(Boolean)
		.map((part) => part[0].toUpperCase())
		.slice(0, 2)
		.join('');
}
