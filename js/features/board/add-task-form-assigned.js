/**
 * @param {*} state
 * @returns {*}
 */
function initAssignedDropdown(state) {
  const dropdown = document.getElementById("assignedDropdown");
  if (!dropdown) return null;
  const parts = getAssignedDropdownParts(dropdown);
  wireAssignedToggle(parts);
  wireAssignedOutsideClose(parts);
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
  const valueEl = dropdown.querySelector("[data-assigned-value]");
  const avatarsEl = getAssignedAvatarsElement(dropdown);
  return { dropdown, toggle, menu, valueEl, avatarsEl };
}

function getAssignedAvatarsElement(dropdown) {
  const parent = dropdown.parentElement;
  if (!parent) return null;
  return parent.querySelector("[data-assigned-avatars]");
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedToggle(parts) {
  parts.toggle?.addEventListener("click", () => {
    setAssignedOpen(parts, parts.menu?.hidden);
  });
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
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedOutsideClose(parts) {
  document.addEventListener("click", (e) => {
    if (!parts.dropdown.contains(e.target)) setAssignedOpen(parts, false);
  });
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

function buildAssignedAvatar(contact, className = "assigned-avatar") {
  const avatar = document.createElement("span");
  avatar.className = className;
  avatar.textContent = getInitials(contact?.name || "");
  avatar.style.background = contact?.color || "#2a3647";
  return avatar;
}

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
  check.textContent = "x";
}

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
  const exists = state.selectedAssigned.find((a) => {
    return a.id === contact.id;
  });
  if (exists) {
    removeAssignedContact(state, contact, item, check);
  } else {
    addAssignedContact(state, contact, item, check);
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
  const remaining = [];
  for (const itemRef of state.selectedAssigned) {
    if (itemRef.id !== contact.id) remaining.push(itemRef);
  }
  state.selectedAssigned = remaining;
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
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function updateAssignedLabel(state, parts) {
  if (!parts.valueEl) return;
  if (state.selectedAssigned.length === 0) return resetAssignedLabel(parts);
  const names = collectAssignedNames(state.selectedAssigned);
  const shown = names.slice(0, 2).join(", ");
  const more = names.length > 2 ? ` +${names.length - 2}` : "";
  parts.valueEl.textContent = `${shown}${more}`;
  parts.dropdown.classList.add("has-value");
  renderAssignedAvatars(state, parts);
}

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
  parts.valueEl.textContent = "Select contacts to assign";
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
}

function renderAssignedAvatars(state, parts) {
  if (!parts.avatarsEl) return;
  parts.avatarsEl.innerHTML = "";
  state.selectedAssigned.forEach((person) => {
    const avatar = buildAssignedAvatar(person, "assigned-avatar assigned-avatar--sm");
    parts.avatarsEl.appendChild(avatar);
  });
  parts.avatarsEl.hidden = state.selectedAssigned.length === 0;
}

function clearAssignedAvatars(parts) {
  if (!parts.avatarsEl) return;
  parts.avatarsEl.innerHTML = "";
  parts.avatarsEl.hidden = true;
}

function clearAssignedMenuSelection(parts) {
  if (!parts.menu) return;
  parts.menu.querySelectorAll(".dropdown-item--assigned").forEach((item) => {
    item.classList.remove("is-selected");
    const check = item.querySelector(".assigned-check");
    if (check) check.textContent = "";
  });
}

/**
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
 * @param {*} data
 * @returns {*}
 */
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}
