/**
 * Initialisiert Assigned-Dropdown (Kontakt-Auswahl)
 * @param {*} state
 * @returns {*}
 */
function initAssignedDropdown(state) {
  const dropdown = document.getElementById("assignedDropdown");
  if (!dropdown) return null;
  const parts = getAssignedDropdownParts(dropdown);
  wireAssignedToggle(parts);
  wireAssignedOutsideClose(parts);
  loadAssignedContacts(state, parts);
  return () => resetAssignedDropdown(parts);
}

/**
 * Extrahiert DOM-Elemente aus Assigned-Dropdown
 * @param {*} dropdown
 * @returns {*}
 */
function getAssignedDropdownParts(dropdown) {
  const toggle = dropdown.querySelector("[data-assigned-toggle]");
  const menu = dropdown.querySelector("[data-assigned-menu]");
  const valueEl = dropdown.querySelector("[data-assigned-value]");
  return { dropdown, toggle, menu, valueEl };
}

/**
 * Registriert Toggle-Button Event für Assigned-Dropdown
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedToggle(parts) {
  parts.toggle?.addEventListener("click", () => {
    setAssignedOpen(parts, parts.menu?.hidden);
  });
}

/**
 * Öffnet/Schließt Assigned-Dropdown
 * @param {*} parts
 * @param {*} open
 * @returns {*}
 */
function setAssignedOpen(parts, open) {
  if (!parts.menu || !parts.toggle) return;
  parts.menu.hidden = !open;
  parts.toggle.setAttribute("aria-expanded", String(open));
  parts.dropdown.classList.toggle("is-open", open);
}

/**
 * Registriert Outside-Click Handler zum Schließen des Dropdowns
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedOutsideClose(parts) {
  document.addEventListener("click", (e) => {
    if (!parts.dropdown.contains(e.target)) setAssignedOpen(parts, false);
  });
}

/**
 * Lädt Kontakte und rendert sie im Dropdown
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
async function loadAssignedContacts(state, parts) {
  if (!parts.menu) return;
  parts.menu.innerHTML = "";
  const contacts = await loadContacts();
  contacts.forEach((contact) => appendAssignedItem(state, parts, contact));
  updateAssignedLabel(state, parts);
}

/**
 * Erstellt und fügt ein Kontakt-Item zum Dropdown hinzu
 * @param {*} state
 * @param {*} parts
 * @param {*} contact
 * @returns {*}
 */
function appendAssignedItem(state, parts, contact) {
  const item = buildAssignedItem(contact);
  const check = item.querySelector(".assigned-check");
  setAssignedSelectionState(state, item, check, contact);
  item.addEventListener("click", () => {
    toggleAssignedContact(state, contact, item, check, parts);
  });
  parts.menu.appendChild(item);
}

/**
 * Erstellt ein Kontakt-Item-Element
 * @param {*} contact
 * @returns {*}
 */
function buildAssignedItem(contact) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "dropdown-item dropdown-item--assigned";
  item.dataset.contactId = contact.id || "";
  item.appendChild(buildAssignedLabel(contact));
  item.appendChild(buildAssignedCheck());
  return item;
}

/**
 * Erstellt Label-Element für Kontakt
 * @param {*} contact
 * @returns {*}
 */
function buildAssignedLabel(contact) {
  const label = document.createElement("span");
  label.textContent = contact.name || "";
  return label;
}

/**
 * Erstellt Check-Element für Selektionsstatus
 * @returns {*}
 */
function buildAssignedCheck() {
  const check = document.createElement("span");
  check.className = "assigned-check";
  return check;
}

/**
 * Setzt Selektionsstatus für ein Kontakt-Item
 * @param {*} state
 * @param {*} item
 * @param {*} check
 * @param {*} contact
 * @returns {*}
 */
function setAssignedSelectionState(state, item, check, contact) {
  const isSelected = state.selectedAssigned.some((a) => a.id ? a.id === contact.id : a.name === contact.name);
  if (!isSelected) return;
  item.classList.add("is-selected");
  check.textContent = "x";
}

/**
 * Togglet Kontakt-Selektion
 * @param {*} state
 * @param {*} contact
 * @param {*} item
 * @param {*} check
 * @param {*} parts
 * @returns {*}
 */
function toggleAssignedContact(state, contact, item, check, parts) {
  const exists = state.selectedAssigned.find((a) => a.id === contact.id);
  if (exists) {
    removeAssignedContact(state, contact, item, check);
  } else {
    addAssignedContact(state, contact, item, check);
  }
  updateAssignedLabel(state, parts);
}

/**
 * Entfernt Kontakt aus Selektion
 * @param {*} state
 * @param {*} contact
 * @param {*} item
 * @param {*} check
 * @returns {*}
 */
function removeAssignedContact(state, contact, item, check) {
  state.selectedAssigned = state.selectedAssigned.filter((a) => a.id !== contact.id);
  item.classList.remove("is-selected");
  check.textContent = "";
}

/**
 * Fügt Kontakt zur Selektion hinzu
 * @param {*} state
 * @param {*} contact
 * @param {*} item
 * @param {*} check
 * @returns {*}
 */
function addAssignedContact(state, contact, item, check) {
  state.selectedAssigned.push({
    id: contact.id,
    name: contact.name || "",
    color: contact.color || null,
  });
  item.classList.add("is-selected");
  check.textContent = "x";
}

/**
 * Aktualisiert Label mit ausgewählten Kontakten
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function updateAssignedLabel(state, parts) {
  if (!parts.valueEl) return;
  if (state.selectedAssigned.length === 0) return resetAssignedLabel(parts);
  const names = state.selectedAssigned.map((a) => a.name).filter(Boolean);
  const shown = names.slice(0, 2).join(", ");
  const more = names.length > 2 ? ` +${names.length - 2}` : "";
  parts.valueEl.textContent = `${shown}${more}`;
  parts.dropdown.classList.add("has-value");
}

/**
 * Setzt Assigned-Label auf Standard-Wert
 * @param {*} parts
 * @returns {*}
 */
function resetAssignedLabel(parts) {
  parts.valueEl.textContent = "Select contacts to assign";
  parts.dropdown.classList.remove("has-value");
}

/**
 * Setzt Assigned-Dropdown auf Standard-Zustand
 * @param {*} parts
 * @returns {*}
 */
function resetAssignedDropdown(parts) {
  resetAssignedLabel(parts);
  parts.dropdown.classList.remove("is-open");
  if (parts.menu) parts.menu.hidden = true;
  if (parts.toggle) parts.toggle.setAttribute("aria-expanded", "false");
}

/**
 * Lädt alle Kontakte vom ContactService
 * @returns {*}
 */
async function loadContacts() {
  try {
    const data = await ContactService.getAll();
    const arr = normalizeToArray(data);
    return arr.length > 0 ? arr : [];
  } catch (err) {
    return [];
  }
}

/**
 * Konvertiert beliebige Daten zu Array
 * @param {*} data
 * @returns {*}
 */
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}
