/**
 * @param {*} state
 * @returns {*}
 */
function initAssignedDropdown(state) {
  const dropdown = document.getElementById("assigned-dropdown");
  if (!dropdown) return null;
  const parts = getAssignedDropdownParts(dropdown);
  wireAssignedToggle(state, parts);
  wireAssignedOutsideClose(state, parts);
  wireAssignedSearch(state, parts);
  state.assignedReady = loadAssignedContacts(state, parts);
  onPageVisible(() => loadAssignedContacts(state, parts));
  return () => resetAssignedDropdown(parts);
}

/**
 * @param {*} dropdown
 * @returns {*}
 */
function getAssignedDropdownParts(dropdown) {
  const toggle = dropdown.querySelector("[data-assigned-toggle]");
  const menu = dropdown.querySelector("[data-assigned-menu]");
  const input = dropdown.querySelector("[data-assigned-input]");
  const valueEl = dropdown.querySelector("[data-assigned-value]");
  const caret = dropdown.querySelector(".dropdown-caret");
  const avatarsEl = getAssignedAvatarsElement(dropdown);
  return { dropdown, toggle, menu, input, valueEl, caret, avatarsEl };
}

/**
 * @param {*} dropdown
 * @returns {*}
 */
function getAssignedAvatarsElement(dropdown) {
  const parent = dropdown.parentElement;
  if (!parent) return null;
  return parent.querySelector("[data-assigned-avatars]");
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedToggle(state, parts) {
  parts.toggle?.addEventListener("click", (event) => {
    handleAssignedToggleClick(state, parts, event);
  });
}

/**
 * @param {*} state
 * @param {*} parts
 * @param {MouseEvent} event
 * @returns {*}
 */
function handleAssignedToggleClick(state, parts, event) {
  if (!parts.menu) return;
  if (isAssignedCaretClick(parts, event)) return toggleAssignedDropdown(state, parts);
  if (isAssignedInputClick(parts, event)) return openAssignedDropdown(state, parts);
  toggleAssignedDropdown(state, parts);
}

/**
 * @param {*} parts
 * @param {*} open
 * @returns {*}
 */
function setAssignedOpen(parts, open) {
  if (!parts.menu || !parts.toggle) return;
  parts.menu.hidden = !open;
  parts.toggle.setAttribute("aria-expanded", String(open));
  parts.dropdown.classList.toggle("is-open", open);
  updateAssignedInputState(parts, open);
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedOutsideClose(state, parts) {
  document.addEventListener("click", (e) => {
    if (!parts.dropdown.contains(e.target)) closeAssignedDropdown(state, parts);
  });
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedSearch(state, parts) {
  if (!parts.input) return;
  wireAssignedInputClick(state, parts);
  wireAssignedInputFocus(parts);
  wireAssignedInputChange(parts);
  wireAssignedInputEscape(state, parts);
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedInputClick(state, parts) {
  parts.input.addEventListener("click", (event) => {
    handleAssignedInputClick(state, parts, event);
  });
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedInputFocus(parts) {
  parts.input.addEventListener("focus", () => setAssignedOpen(parts, true));
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedInputChange(parts) {
  parts.input.addEventListener("input", () => {
    setAssignedOpen(parts, true);
    filterAssignedItems(parts, parts.input.value);
  });
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedInputEscape(state, parts) {
  parts.input.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeAssignedDropdown(state, parts);
    parts.input.blur();
  });
}

/**
 * @param {*} state
 * @param {*} parts
 * @param {MouseEvent} event
 * @returns {*}
 */
function handleAssignedInputClick(state, parts, event) {
  event.stopPropagation();
  openAssignedDropdown(state, parts);
}

/**
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
 * @param {*} contact
 * @returns {*}
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
 * @param {*} contact
 * @returns {*}
 */
function buildAssignedLabel(contact) {
  const label = document.createElement("span");
  label.className = "assigned-label";
  label.appendChild(buildAssignedAvatar(contact));
  label.appendChild(buildAssignedName(contact));
  return label;
}

/**
 * @param {*} contact
 * @param {string} className
 * @returns {*}
 */
function buildAssignedAvatar(contact, className = "assigned-avatar") {
  const avatar = document.createElement("span");
  avatar.className = className;
  avatar.textContent = getInitials(contact?.name || "");
  avatar.style.background = contact?.color || "#2a3647";
  return avatar;
}

/**
 * @param {*} contact
 * @returns {*}
 */
function buildAssignedName(contact) {
  const name = document.createElement("span");
  name.textContent = contact.name || "";
  return name;
}
/**
 * @returns {*}
 */
function buildAssignedCheck() {
  const check = document.createElement("span");
  check.className = "assigned-check";
  return check;
}

/**
 * @param {*} state
 * @param {*} item
 * @param {*} check
 * @param {*} contact
 * @returns {*}
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
 * @param {*} assigned
 * @param {*} contact
 * @returns {boolean}
 */
function isAssignedMatch(assigned, contact) {
  if (assigned?.id) return assigned.id === contact.id;
  return assigned?.name === contact.name;
}

/**
 * @param {*} state
 * @param {*} contact
 * @param {*} item
 * @param {*} check
 * @param {*} parts
 * @returns {*}
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
 * @param {*} state
 * @param {*} contact
 * @param {*} item
 * @param {*} check
 * @returns {*}
 */
function removeAssignedContact(state, contact, item, check) {
  state.selectedAssigned = state.selectedAssigned.filter((assigned) => {
    return !isAssignedMatch(assigned, contact);
  });
  item.classList.remove("is-selected");
  check.textContent = "";
}

/**
 * @param {*} state
 * @param {*} contact
 * @param {*} item
 * @param {*} check
 * @returns {*}
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
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function updateAssignedLabel(state, parts) {
  if (!parts.valueEl && !parts.input) return;
  if (state.selectedAssigned.length === 0) return resetAssignedLabel(parts);
  const names = collectAssignedNames(state.selectedAssigned);
  const shown = names.slice(0, 2).join(", ");
  const more = names.length > 2 ? ` +${names.length - 2}` : "";
  if (parts.valueEl && !parts.dropdown.classList.contains("is-open")) {
    setAssignedValue(parts, `${shown}${more}`);
  }
  parts.dropdown.classList.add("has-value");
  renderAssignedAvatars(state, parts);
}

/**
 * @param {Array} list
 * @returns {Array}
 */
function collectAssignedNames(list) {
  const names = [];
  for (const item of list || []) {
    if (item?.name) names.push(item.name);
  }
  return names;
}

/**
 * @param {*} parts
 * @returns {*}
 */
function resetAssignedLabel(parts) {
  if (parts.valueEl) setAssignedValue(parts, "Select contacts to assign");
  parts.dropdown.classList.remove("has-value");
  clearAssignedAvatars(parts);
}

/**
 * @param {*} parts
 * @returns {*}
 */
function resetAssignedDropdown(parts) {
  resetAssignedLabel(parts);
  clearAssignedMenuSelection(parts);
  parts.dropdown.classList.remove("is-open");
  if (parts.menu) parts.menu.hidden = true;
  if (parts.toggle) parts.toggle.setAttribute("aria-expanded", "false");
  filterAssignedItems(parts, "");
}
