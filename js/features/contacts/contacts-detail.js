/**
 * Renders the contact detail view.
 * @param {Object} contact
 */
function renderContactDetail(contact) {
  const container = document.getElementById("contact-detail-injection");
  if (!container) return;
  container.innerHTML = getContactDetailTemplate(contact);
  setupDetailActions(contact?.id);
  setupMobileDetailButtons(contact?.id);
}

/**
 * Wires edit/delete actions in the detail view.
 * @param {string} contactId
 */
function setupDetailActions(contactId) {
  const container = document.getElementById("contact-detail-injection");
  if (!container || !contactId) return;
  const { editButton, deleteButton } = getDetailActionButtons(container);
  editButton?.addEventListener("click", () => {
    openEditContact(contactId);
  });
  deleteButton?.addEventListener("click", () => {
    confirmDeleteContact(contactId);
  });
}

/**
 * Gets detail action buttons from the container.
 * @param {HTMLElement} container
 * @returns {{ editButton: HTMLElement, deleteButton: HTMLElement }}
 */
function getDetailActionButtons(container) {
  const actionButtons = container.querySelectorAll(
    ".detail-actions .secondary-button",
  );
  const editButton = actionButtons[0];
  const deleteButton = actionButtons[1];
  return { editButton, deleteButton };
}

/**
 * Confirms contact deletion.
 * @param {string} contactId
 */
async function confirmDeleteContact(contactId) {
  const confirmed = await showConfirmOverlay({
    title: "Delete contact?",
    message: "Do you really want to delete this contact?",
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  if (!confirmed) return;
  deleteContact(contactId);
}

/**
 * Wires mobile detail buttons.
 * @param {string} contactId
 */
function setupMobileDetailButtons(contactId) {
  const container = document.getElementById("contact-detail-injection");
  if (!container || !contactId) return;
  const menuButton = container.querySelector(".contact-menu-button");
  menuButton?.addEventListener("click", () => {
    openEditContact(contactId);
  });
}

function setupHeaderBackButton() {
  const headerBackButton = document.querySelector(
    ".contacts-header .contact-back-button",
  );
  if (!headerBackButton) return;
  headerBackButton.addEventListener("click", closeMobileDetailView);
}

/**
 * Checks whether the layout is mobile.
 * @returns {boolean}
 */
function isMobileLayout() {
  return window.matchMedia("(max-width: 800px)").matches;
}

/**
 * Sets the mobile detail panel state.
 * @param {boolean} isActive
 */
function setMobileDetailState(isActive) {
  const page = document.querySelector(".contacts-page");
  if (!page) return;
  page.classList.toggle("is-detail-open", isActive);
}

function openMobileDetailView() {
  if (isMobileLayout()) setMobileDetailState(true);
}

function closeMobileDetailView() {
  if (isMobileLayout()) setMobileDetailState(false);
}
