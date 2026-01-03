const demoContacts = [
	{ id: 'bz', firstName: 'Benedikt', lastName: 'Ziegler', email: 'benedikt@gmail.com', phone: '+49 221 0123456', color: '#7C5DFA' },
	{ id: 'de', firstName: 'David', lastName: 'Eisenberg', email: 'davideberg@gmail.com', phone: '+49 221 2345678', color: '#FF86C6' },
	{ id: 'ef', firstName: 'Eva', lastName: 'Fischer', email: 'eva@gmail.com', phone: '+49 221 2233445', color: '#FFBB33' },
	{ id: 'em', firstName: 'Emmanuel', lastName: 'Mauer', email: 'emmanuelma@gmail.com', phone: '+49 221 7766554', color: '#25A69A' },
	{ id: 'mb', firstName: 'Marcel', lastName: 'Bauer', email: 'bauer@gmail.com', phone: '+49 221 8899776', color: '#6D4CFF' },
	{ id: 'tw', firstName: 'Tatjana', lastName: 'Wolf', email: 'wolf@gmail.com', phone: '+49 2222 222222', color: '#FDBF00' }
];

let activeContactId = null;

document.addEventListener('DOMContentLoaded', initContactsPage);

function initContactsPage() {
	const page = document.querySelector('.contacts-page');
	if (!page) return;
	activeContactId = demoContacts[0]?.id || null;
	renderContactList(demoContacts);
	bindContactEvents();
	wireAddContactButtons();
	if (activeContactId) setActiveContact(activeContactId);
}

function renderContactList(list) {
	const target = document.querySelector('.contact-list');
	if (!target) return;
	target.innerHTML = list.map(getContactCardTemplate).join('');
}

function bindContactEvents() {
	document.querySelectorAll('.contact-entry').forEach((node) => {
		node.addEventListener('click', () => setActiveContact(node.dataset.contactId));
	});
}

function wireAddContactButtons() {
	document.querySelectorAll('.add-contact-btn').forEach((button) => {
		button.addEventListener('click', () => alert('Kontaktanlage folgt in Kürze.'));
	});
}

function setActiveContact(contactId) {
	activeContactId = contactId;
	document.querySelectorAll('.contact-entry').forEach((node) => {
		node.classList.toggle('is-active', node.dataset.contactId === contactId);
	});
	const contact = findContact(contactId);
	if (contact) renderContactDetail(contact);
}

function renderContactDetail(contact) {
	const target = document.querySelector('.contact-detail');
	if (!target || !contact) return;
	target.innerHTML = getContactDetailTemplate(contact);
}

function findContact(contactId) {
	return demoContacts.find((contact) => contact.id === contactId) || null;
}

function getContactCardTemplate(contact) {
	return `
		<article class="contact-entry" data-contact-id="${contact.id}">
			<div class="contact-avatar" style="background:${contact.color}">${getInitials(contact)}</div>
			<div class="contact-meta">
				<p class="contact-name">${contact.firstName} ${contact.lastName}</p>
				<p class="contact-email">${contact.email}</p>
			</div>
		</article>
	`;
}

function getContactDetailTemplate(contact) {
	return `
		<article class="contact-hero">
			<div class="contact-avatar contact-avatar-large" style="background:${contact.color}">${getInitials(contact)}</div>
			<div>
				<h3>${contact.firstName} ${contact.lastName}</h3>
				<p class="detail-subline">Teamgeist macht den Unterschied</p>
			</div>
		</article>
		<section class="detail-info">
			<h4>Kontaktinformationen</h4>
			<div class="detail-row">
				<span class="detail-label">E-Mail</span>
				<a href="mailto:${contact.email}">${contact.email}</a>
			</div>
			<div class="detail-row">
				<span class="detail-label">Telefon</span>
				<a href="tel:${contact.phone.replace(/\s+/g, '')}">${contact.phone}</a>
			</div>
		</section>
	`;
}

function getInitials(contact) {
	const first = contact.firstName?.charAt(0) || '';
	const last = contact.lastName?.charAt(0) || '';
	return `${first}${last}`.toUpperCase();
}
