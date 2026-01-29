/**
 * Loads contacts from storage.
 * @returns {Promise<Array>}
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
 * Normalizes raw data to an array.
 * @param {any} data
 * @returns {Array}
 */
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}

/**
 * Normalizes assigned search input.
 * @param {string} value
 * @returns {string}
 */
function normalizeAssignedSearch(value) {
  const plain = stripDiacritics(String(value || ""));
  return plain.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Strips diacritics from a value.
 * @param {string} value
 * @returns {string}
 */
function stripDiacritics(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Loads assigned contacts into the dropdown.
 * @param {Object} state
 * @param {Object} parts
 */
async function loadAssignedContacts(state, parts) {
  if (!parts.menu) return;
  parts.menu.innerHTML = "";
  const contacts = await loadContacts();
  contacts.forEach((contact) => appendAssignedItem(state, parts, contact));
  updateAssignedLabel(state, parts);
}

/**
 * Appends an assigned item to the menu.
 * @param {Object} state
 * @param {Object} parts
 * @param {Object} contact
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
 * Builds an assigned dropdown item.
 * @param {Object} contact
 * @returns {HTMLElement}
 */
function buildAssignedItem(contact) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "dropdown-item dropdown-item--assigned";
  item.dataset.contactId = contact.id || "";
  item.dataset.search = normalizeAssignedSearch(contact?.name || "");
  item.appendChild(buildAssignedLabel(contact));
  item.appendChild(buildAssignedCheck());
  return item;
}

/**
 * Builds the assigned label node.
 * @param {Object} contact
 * @returns {HTMLElement}
 */
function buildAssignedLabel(contact) {
  const label = document.createElement("span");
  label.className = "assigned-label";
  label.appendChild(buildAssignedAvatar(contact));
  label.appendChild(buildAssignedName(contact));
  return label;
}

/**
 * Builds an assigned avatar.
 * @param {Object} contact
 * @param {string} className
 * @returns {HTMLElement}
 */
function buildAssignedAvatar(contact, className = "assigned-avatar") {
  const avatar = document.createElement("span");
  avatar.className = className;
  avatar.textContent = getInitials(contact?.name || "");
  avatar.style.background = contact?.color || "#2a3647";
  return avatar;
}

/**
 * Builds an assigned name node.
 * @param {Object} contact
 * @returns {HTMLElement}
 */
function buildAssignedName(contact) {
  const name = document.createElement("span");
  name.textContent = contact.name || "";
  return name;
}

/**
 * Builds the assigned check node.
 * @returns {HTMLElement}
 */
function buildAssignedCheck() {
  const check = document.createElement("span");
  check.className = "assigned-check";
  return check;
}

/**
 * Sets selection state for an item.
 * @param {Object} state
 * @param {HTMLElement} item
 * @param {HTMLElement} check
 * @param {Object} contact
 */
function setAssignedSelectionState(state, item, check, contact) {
  const isSelected = state.selectedAssigned.some((a) => {
    return isAssignedMatch(a, contact);
  });
  if (!isSelected) return;
  item.classList.add("is-selected");
  check.textContent = "";
}

/**
 * Checks whether an assigned entry matches a contact.
 * @param {Object} assigned
 * @param {Object} contact
 * @returns {boolean}
 */
function isAssignedMatch(assigned, contact) {
  if (assigned?.id) return assigned.id === contact.id;
  return assigned?.name === contact.name;
}

/**
 * Toggles an assigned contact.
 * @param {Object} state
 * @param {Object} contact
 * @param {HTMLElement} item
 * @param {HTMLElement} check
 * @param {Object} parts
 */
function toggleAssignedContact(state, contact, item, check, parts) {
  const exists = state.selectedAssigned.find((assigned) => {
    return isAssignedMatch(assigned, contact);
  });
  if (exists) {
    removeAssignedContact(state, contact, item, check);
  } else {
    addAssignedContact(state, contact, item, check, parts);
  }
  updateAssignedLabel(state, parts);
}

/**
 * Removes an assigned contact.
 * @param {Object} state
 * @param {Object} contact
 * @param {HTMLElement} item
 * @param {HTMLElement} check
 */
function removeAssignedContact(state, contact, item, check) {
  state.selectedAssigned = state.selectedAssigned.filter((assigned) => {
    return !isAssignedMatch(assigned, contact);
  });
  item.classList.remove("is-selected");
  check.textContent = "";
}

/**
 * Adds an assigned contact.
 * @param {Object} state
 * @param {Object} contact
 * @param {HTMLElement} item
 * @param {HTMLElement} check
 * @param {Object} parts
 */
function addAssignedContact(state, contact, item, check, parts) {
  state.selectedAssigned.push({
    id: contact.id,
    name: contact.name || "",
    color: contact.color || null,
  });
  item.classList.add("is-selected");
  check.textContent = "";
  clearAssignedSearch(parts);
}

/**
 * Clears assigned menu selection state.
 * @param {Object} parts
 */
function clearAssignedMenuSelection(parts) {
  if (!parts.menu) return;
  parts.menu.querySelectorAll(".dropdown-item--assigned").forEach((item) => {
    item.classList.remove("is-selected");
    const check = item.querySelector(".assigned-check");
    if (check) check.textContent = "";
  });
}
