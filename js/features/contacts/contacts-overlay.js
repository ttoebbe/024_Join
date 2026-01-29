let lastOverlayFocus = null;

function setupAddContactOverlay(listElement) {
  const elements = getOverlaySetupElements();
  if (!elements) return;
  wireOverlayEvents(elements, listElement);
}

function getContactOverlayElements() {
  const overlay = document.getElementById("contact-overlay");
  const form = document.getElementById("contact-form");
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");
  if (!overlay || !form || !nameInput || !emailInput || !phoneInput)
    return null;
  return { overlay, form, nameInput, emailInput, phoneInput };
}

function getOverlaySetupElements() {
  const base = getContactOverlayElements();
  const openButton = document.querySelector(".list-add-button");
  const deleteButton = document.getElementById("contact-delete");
  const cancelButton = document.getElementById("contact-cancel");
  const closeButtons = document.querySelectorAll("[data-overlay-close]");
  if (!base || !openButton) return null;
  return { ...base, openButton, deleteButton, cancelButton, closeButtons };
}

function wireOverlayEvents(elements, listElement) {
  registerOverlayInputHandlers(elements);
  registerOverlayButtons(elements, listElement);
  registerOverlayBackdropClick(elements);
}

function registerOverlayInputHandlers(elements) {
  const clear = () => clearContactFormErrors(elements);
  registerOverlayClearHandlers(elements, clear);
  registerOverlayValidationHandlers(elements);
  wireContactCounters(elements);
}

function registerOverlayClearHandlers(elements, clear) {
  elements.nameInput?.addEventListener("input", clear);
  elements.emailInput?.addEventListener("input", clear);
  elements.phoneInput?.addEventListener("input", clear);
}

function registerOverlayValidationHandlers(elements) {
  registerNameLengthValidation(elements);
  registerEmailLengthValidation(elements);
  registerPhoneValidation(elements);
}

function registerNameLengthValidation(elements) {
  elements.nameInput?.addEventListener("input", () => {
    validateContactLength(
      elements.nameInput,
      CONTACT_NAME_MAX,
      "contact-name-error",
      "Name",
    );
  });
}

function registerEmailLengthValidation(elements) {
  elements.emailInput?.addEventListener("input", () => {
    validateContactLength(
      elements.emailInput,
      CONTACT_EMAIL_MAX,
      "contact-email-error",
      "Email",
    );
  });
}

function registerPhoneValidation(elements) {
  elements.phoneInput?.addEventListener("input", () => {
    validatePhoneDigits(
      elements.phoneInput,
      CONTACT_PHONE_MIN,
      CONTACT_PHONE_MAX,
      "contact-phone-error",
    );
  });
}

function wireContactCounters(elements) {
  updateContactCounters(elements);
  elements.nameInput?.addEventListener("input", () =>
    updateContactCounters(elements),
  );
  elements.emailInput?.addEventListener("input", () =>
    updateContactCounters(elements),
  );
  elements.phoneInput?.addEventListener("input", () =>
    updateContactCounters(elements),
  );
}

function updateContactCounters(elements) {
  enforceContactMax(elements.nameInput, CONTACT_NAME_MAX);
  updateContactFieldCounter(
    elements.nameInput,
    "contact-name-counter",
    CONTACT_NAME_MAX,
  );
  enforceContactMax(elements.emailInput, CONTACT_EMAIL_MAX);
  updateContactFieldCounter(
    elements.emailInput,
    "contact-email-counter",
    CONTACT_EMAIL_MAX,
  );
  trimPhoneToMaxDigits(elements.phoneInput, CONTACT_PHONE_MAX);
  updateContactFieldCounter(
    elements.phoneInput,
    "contact-phone-counter",
    CONTACT_PHONE_MAX,
    getPhoneDigitsCount,
  );
}

function updateContactFieldCounter(input, counterId, max, countFn = null) {
  const counter = document.getElementById(counterId);
  if (!counter) return;
  const value = input?.value || "";
  const length = typeof countFn === "function" ? countFn(value) : value.length;
  counter.textContent = `${length}/${max}`;
}

function enforceContactMax(input, max) {
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= max) return;
  input.value = value.slice(0, max);
}

function registerOverlayButtons(elements, listElement) {
  registerOverlayOpenButton(elements);
  registerOverlayCloseButtons(elements);
  registerOverlayDeleteButton(elements, listElement);
  registerOverlaySubmit(elements, listElement);
}

function registerOverlayOpenButton(elements) {
  elements.openButton?.addEventListener("click", () => {
    setOverlayMode(elements.form, false);
    setOverlayAvatarDefault();
    elements.form?.reset();
    clearContactFormErrors(elements);
    updateContactCounters(elements);
    openOverlay(elements.overlay);
  });
}

function registerOverlayCloseButtons(elements) {
  if (!elements.closeButtons) return;
  elements.closeButtons.forEach((button) => {
    button.addEventListener("click", () =>
      closeOverlay(elements.overlay, elements.form),
    );
  });
}

function registerOverlayDeleteButton(elements, listElement) {
  elements.deleteButton?.addEventListener("click", async () => {
    const currentId = getCurrentEditId();
    if (!currentId) return;
    const confirmed = await showConfirmOverlay({
      title: "Delete contact?",
      message: "Do you really want to delete this contact?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    await deleteContact(currentId);
    closeOverlay(elements.overlay, elements.form);
  });
}

function registerOverlaySubmit(elements, listElement) {
  elements.form.addEventListener("submit", async (event) => {
    await handleNewContactSubmit(
      event,
      elements.overlay,
      elements.form,
      listElement,
    );
  });
}

function registerOverlayBackdropClick(elements) {
  elements.overlay.addEventListener("click", (event) => {
    if (event.target === elements.overlay) {
      closeOverlay(elements.overlay, elements.form);
    }
  });
}

function openOverlay(overlay) {
  storeLastFocusedElement(overlay);
  overlay.classList.add("is-visible");
  overlay.setAttribute("aria-hidden", "false");
}

function closeOverlay(overlay, form) {
  restoreLastFocusedElement(overlay);
  overlay.classList.remove("is-visible");
  overlay.setAttribute("aria-hidden", "true");
  setOverlayMode(form, false);
  setOverlayAvatarDefault();
  form?.reset();
}

function storeLastFocusedElement(overlay) {
  if (!overlay) return;
  lastOverlayFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
}

function restoreLastFocusedElement(overlay) {
  if (!overlay) return;
  const active = document.activeElement;
  if (active instanceof HTMLElement && overlay.contains(active)) active.blur();
  if (lastOverlayFocus && document.contains(lastOverlayFocus)) {
    lastOverlayFocus.focus();
  }
  lastOverlayFocus = null;
}

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

function updateOverlayTexts(title, submitButton, isEdit) {
  if (title) title.textContent = isEdit ? "Edit contact" : "Add contact";
  if (submitButton) {
    const label = submitButton.querySelector("span");
    const text = isEdit ? "Save changes" : "Create contact";
    if (label) label.textContent = text;
    else submitButton.textContent = text;
  }
}

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

function fillContactForm(elements, contact) {
  elements.nameInput.value = contact.name || "";
  elements.emailInput.value = contact.email || "";
  elements.phoneInput.value = contact.phone || "";
}

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

function ensureDefaultAvatarIcon(avatar) {
  if (avatar.querySelector("img")) return;
  const img = document.createElement("img");
  img.src = "/assets/img/icons/group-13.svg";
  img.alt = "User avatar";
  avatar.appendChild(img);
}

function setOverlayAvatarContact(contact) {
  const avatar = getOverlayAvatarCircle();
  if (!avatar) return;
  avatar.classList.add("is-contact");
  avatar.style.backgroundColor = contact?.color || "#2a3647";
  avatar.textContent = getInitials(contact?.name || "");
  removeAvatarIcon(avatar);
}

function removeAvatarIcon(avatar) {
  const img = avatar.querySelector("img");
  if (img) img.remove();
}

function openEditContact(contactId) {
  const contact = getContactById(contactId);
  if (!contact) return;
  const elements = getContactOverlayElements();
  if (!elements) return;
  fillContactForm(elements, contact);
  updateContactCounters(elements);
  setOverlayAvatarContact(contact);
  setOverlayMode(elements.form, true);
  setCurrentEditId(contactId);
  openOverlay(elements.overlay);
}
