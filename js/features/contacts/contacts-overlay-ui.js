let lastOverlayFocus = null;

/**
 * Opens the overlay and sets focus state.
 * @param {HTMLElement} overlay
 */
function openOverlay(overlay) {
  storeLastFocusedElement(overlay);
  overlay.classList.add("is-visible");
  overlay.setAttribute("aria-hidden", "false");
}

/**
 * Closes the overlay and resets the form.
 * @param {HTMLElement} overlay
 * @param {HTMLFormElement} form
 */
function closeOverlay(overlay, form) {
  restoreLastFocusedElement(overlay);
  overlay.classList.remove("is-visible");
  overlay.setAttribute("aria-hidden", "true");
  setOverlayMode(form, false);
  setOverlayAvatarDefault();
  form?.reset();
}

/**
 * Stores the last focused element before opening.
 * @param {HTMLElement} overlay
 */
function storeLastFocusedElement(overlay) {
  if (!overlay) return;
  lastOverlayFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
}

/**
 * Restores focus after closing the overlay.
 * @param {HTMLElement} overlay
 */
function restoreLastFocusedElement(overlay) {
  if (!overlay) return;
  const active = document.activeElement;
  if (active instanceof HTMLElement && overlay.contains(active)) active.blur();
  if (lastOverlayFocus && document.contains(lastOverlayFocus)) {
    lastOverlayFocus.focus();
  }
  lastOverlayFocus = null;
}

/**
 * Updates overlay mode between add and edit.
 * @param {HTMLFormElement} form
 * @param {boolean} isEdit
 */
function setOverlayMode(form, isEdit) {
  const title = document.getElementById("contact-overlay-title");
  const submitButton = form?.querySelector('button[type="submit"]');
  const deleteButton = document.getElementById("contact-delete");
  const cancelButton = document.getElementById("contact-cancel");
  const overlayLogo = document.querySelector(".overlay-logo");
  updateOverlayTexts(title, submitButton, isEdit);
  updateOverlayVisibility(overlayLogo, deleteButton, cancelButton, isEdit);
  if (!isEdit) setCurrentEditId(null);
}

/**
 * Updates overlay texts for the active mode.
 * @param {HTMLElement} title
 * @param {HTMLButtonElement} submitButton
 * @param {boolean} isEdit
 */
function updateOverlayTexts(title, submitButton, isEdit) {
  if (title) title.textContent = isEdit ? "Edit contact" : "Add contact";
  if (submitButton) {
    const label = submitButton.querySelector("span");
    const text = isEdit ? "Save changes" : "Create contact";
    if (label) label.textContent = text;
    else submitButton.textContent = text;
  }
}

/**
 * Updates visibility of overlay controls.
 * @param {HTMLElement} overlayLogo
 * @param {HTMLElement} deleteButton
 * @param {HTMLElement} cancelButton
 * @param {boolean} isEdit
 */
function updateOverlayVisibility(
  overlayLogo,
  deleteButton,
  cancelButton,
  isEdit,
) {
  if (overlayLogo) overlayLogo.style.display = isEdit ? "none" : "flex";
  if (deleteButton)
    deleteButton.style.display = isEdit ? "inline-flex" : "none";
  if (cancelButton)
    cancelButton.style.display = isEdit ? "none" : "inline-flex";
}

/**
 * Fills the overlay form with contact data.
 * @param {Object} elements
 * @param {Object} contact
 */
function fillContactForm(elements, contact) {
  elements.nameInput.value = contact.name || "";
  elements.emailInput.value = contact.email || "";
  elements.phoneInput.value = contact.phone || "";
}

/**
 * Gets the overlay avatar circle element.
 * @returns {HTMLElement|null}
 */
function getOverlayAvatarCircle() {
  return document.querySelector(".overlay-avatar .avatar-circle");
}

function setOverlayAvatarDefault() {
  const avatar = getOverlayAvatarCircle();
  if (!avatar) return;
  avatar.classList.remove("is-contact");
  avatar.style.backgroundColor = "";
  avatar.textContent = "";
  ensureDefaultAvatarIcon(avatar);
}

/**
 * Ensures the default avatar icon is present.
 * @param {HTMLElement} avatar
 */
function ensureDefaultAvatarIcon(avatar) {
  if (avatar.querySelector("img")) return;
  const img = document.createElement("img");
  img.src = "/assets/img/icons/group-13.svg";
  img.alt = "User avatar";
  avatar.appendChild(img);
}

/**
 * Sets the overlay avatar from a contact.
 * @param {Object} contact
 */
function setOverlayAvatarContact(contact) {
  const avatar = getOverlayAvatarCircle();
  if (!avatar) return;
  avatar.classList.add("is-contact");
  avatar.style.backgroundColor = contact?.color || "#2a3647";
  avatar.textContent = getInitials(contact?.name || "");
  removeAvatarIcon(avatar);
}

/**
 * Removes the avatar icon image.
 * @param {HTMLElement} avatar
 */
function removeAvatarIcon(avatar) {
  const img = avatar.querySelector("img");
  if (img) img.remove();
}
