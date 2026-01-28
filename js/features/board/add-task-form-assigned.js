const MAX_ASSIGNED_AVATARS = 3;

function isAssignedInputClick(parts, event) {
  if (!parts.input) return false;
  return event.target === parts.input;
}

function isAssignedCaretClick(parts, event) {
  if (!parts.caret) return false;
  return event.target === parts.caret;
}

function openAssignedDropdown(state, parts) {
  setAssignedOpen(parts, true);
  focusAssignedInput(parts);
  filterAssignedItems(parts, parts.input?.value || "");
  updateAssignedLabel(state, parts);
}

function toggleAssignedDropdown(state, parts) {
  if (!parts.menu) return;
  const open = parts.menu.hidden;
  setAssignedOpen(parts, open);
  if (open) return openAssignedDropdown(state, parts);
  closeAssignedDropdown(state, parts);
}

function focusAssignedInput(parts) {
  if (!parts.input) return;
  parts.input.focus();
}

function closeAssignedDropdown(state, parts) {
  setAssignedOpen(parts, false);
  filterAssignedItems(parts, "");
  updateAssignedLabel(state, parts);
}

function updateAssignedInputState(parts, open) {
  if (!parts.input) return;
  if (open) return prepareAssignedSearch(parts);
  restoreAssignedPlaceholder(parts);
}

function prepareAssignedSearch(parts) {
  parts.input.placeholder = "Search contacts";
}

function restoreAssignedPlaceholder(parts) {
  parts.input.placeholder = "Select contacts to assign";
}

function clearAssignedSearch(parts) {
  if (!parts?.input) return;
  parts.input.value = "";
  filterAssignedItems(parts, "");
}

function setAssignedValue(parts, value) {
  if (parts.valueEl) parts.valueEl.textContent = value;
}

function filterAssignedItems(parts, query) {
  if (!parts.menu) return;
  const term = normalizeAssignedSearch(query);
  applyAssignedFilter(parts.menu, term);
}

function normalizeAssignedSearch(value) {
  const plain = stripDiacritics(String(value || ""));
  return plain.trim().toLowerCase().replace(/\s+/g, " ");
}

function applyAssignedFilter(menu, term) {
  const items = menu.querySelectorAll(".dropdown-item--assigned");
  items.forEach((item) => setAssignedItemVisibility(item, term));
}

function setAssignedItemVisibility(item, term) {
  const shouldHide = isAssignedHidden(item, term);
  item.hidden = shouldHide;
  item.style.display = shouldHide ? "none" : "";
}

function isAssignedHidden(item, term) {
  if (term.length === 0) return false;
  const haystack = item.dataset.search || "";
  return !haystack.includes(term);
}

function stripDiacritics(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function renderAssignedAvatars(state, parts) {
  if (!parts.avatarsEl) return;
  const selected = getSelectedAssigned(state);
  clearAssignedAvatars(parts);
  appendAssignedAvatars(parts, selected);
  appendAssignedMoreBadge(parts, selected.length);
  parts.avatarsEl.hidden = selected.length === 0;
}

function getSelectedAssigned(state) {
  return state.selectedAssigned || [];
}

function appendAssignedAvatars(parts, selected) {
  const visible = selected.slice(0, MAX_ASSIGNED_AVATARS);
  visible.forEach((person) => {
    const avatar = buildAssignedAvatar(person, "assigned-avatar assigned-avatar--sm");
    parts.avatarsEl.appendChild(avatar);
  });
}

function appendAssignedMoreBadge(parts, total) {
  if (total <= MAX_ASSIGNED_AVATARS) return;
  const extra = total - MAX_ASSIGNED_AVATARS;
  const more = buildAssignedMoreBadge(extra);
  parts.avatarsEl.appendChild(more);
}

function buildAssignedMoreBadge(count) {
  const badge = document.createElement("span");
  badge.className = "assigned-avatar assigned-avatar--sm assigned-avatar--more";
  badge.textContent = `+${count}`;
  badge.setAttribute("aria-label", `${count} more assigned`);
  badge.title = `${count} more assigned`;
  return badge;
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

async function loadContacts() {
  try {
    const data = await ContactService.getAll();
    const arr = normalizeToArray(data);
    return arr.length > 0 ? arr : [];
  } catch (err) {
    return [];
  }
}

function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}

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

function getAssignedDropdownParts(dropdown) {
  const toggle = dropdown.querySelector("[data-assigned-toggle]");
  const menu = dropdown.querySelector("[data-assigned-menu]");
  const input = dropdown.querySelector("[data-assigned-input]");
  const valueEl = dropdown.querySelector("[data-assigned-value]");
  const caret = dropdown.querySelector(".dropdown-caret");
  const avatarsEl = getAssignedAvatarsElement(dropdown);
  return { dropdown, toggle, menu, input, valueEl, caret, avatarsEl };
}

function getAssignedAvatarsElement(dropdown) {
  const parent = dropdown.parentElement;
  if (!parent) return null;
  return parent.querySelector("[data-assigned-avatars]");
}

function wireAssignedToggle(state, parts) {
  parts.toggle?.addEventListener("click", (event) => { // Toggle assigned dropdown
    handleAssignedToggleClick(state, parts, event);
  });
}

function handleAssignedToggleClick(state, parts, event) {
  if (!parts.menu) return;
  if (isAssignedCaretClick(parts, event)) return toggleAssignedDropdown(state, parts);
  if (isAssignedInputClick(parts, event)) return openAssignedDropdown(state, parts);
  toggleAssignedDropdown(state, parts);
}

function setAssignedOpen(parts, open) {
  if (!parts.menu || !parts.toggle) return;
  parts.menu.hidden = !open;
  parts.toggle.setAttribute("aria-expanded", String(open));
  parts.dropdown.classList.toggle("is-open", open);
  updateAssignedInputState(parts, open);
}

function wireAssignedOutsideClose(state, parts) {
  document.addEventListener("click", (e) => { // Close assigned dropdown on outside click
    if (!parts.dropdown.contains(e.target)) closeAssignedDropdown(state, parts);
  });
}

function wireAssignedSearch(state, parts) {
  if (!parts.input) return;
  wireAssignedInputClick(state, parts);
  wireAssignedInputFocus(parts);
  wireAssignedInputChange(parts);
  wireAssignedInputEscape(state, parts);
}

function wireAssignedInputClick(state, parts) {
  parts.input.addEventListener("click", (event) => { // Open assigned dropdown
    handleAssignedInputClick(state, parts, event);
  });
}

function wireAssignedInputFocus(parts) {
  parts.input.addEventListener("focus", () => setAssignedOpen(parts, true)); // Open assigned dropdown on focus
}

function wireAssignedInputChange(parts) {
  parts.input.addEventListener("input", () => { // Filter assigned contacts
    setAssignedOpen(parts, true);
    filterAssignedItems(parts, parts.input.value);
  });
}

function wireAssignedInputEscape(state, parts) {
  parts.input.addEventListener("keydown", (e) => { // Close assigned dropdown on Escape
    if (e.key !== "Escape") return;
    closeAssignedDropdown(state, parts);
    parts.input.blur();
  });
}

function handleAssignedInputClick(state, parts, event) {
  event.stopPropagation();
  openAssignedDropdown(state, parts);
}

async function loadAssignedContacts(state, parts) {
  if (!parts.menu) return;
  parts.menu.innerHTML = "";
  const contacts = await loadContacts();
  contacts.forEach((contact) => appendAssignedItem(state, parts, contact));
  updateAssignedLabel(state, parts);
}

function appendAssignedItem(state, parts, contact) {
  const item = buildAssignedItem(contact);
  const check = item.querySelector(".assigned-check");
  setAssignedSelectionState(state, item, check, contact);
  item.addEventListener("click", () => { // Toggle assigned contact
    toggleAssignedContact(state, contact, item, check, parts);
  });
  parts.menu.appendChild(item);
}

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

function buildAssignedCheck() {
  const check = document.createElement("span");
  check.className = "assigned-check";
  return check;
}

function setAssignedSelectionState(state, item, check, contact) {
  const isSelected = state.selectedAssigned.some((a) => {
    return isAssignedMatch(a, contact);
  });
  if (!isSelected) return;
  item.classList.add("is-selected");
  check.textContent = "";
}

function isAssignedMatch(assigned, contact) {
  if (assigned?.id) return assigned.id === contact.id;
  return assigned?.name === contact.name;
}

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

function removeAssignedContact(state, contact, item, check) {
  state.selectedAssigned = state.selectedAssigned.filter((assigned) => {
    return !isAssignedMatch(assigned, contact);
  });
  item.classList.remove("is-selected");
  check.textContent = "";
}

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

function collectAssignedNames(list) {
  const names = [];
  for (const item of list || []) {
    if (item?.name) names.push(item.name);
  }
  return names;
}

function resetAssignedLabel(parts) {
  if (parts.valueEl) setAssignedValue(parts, "Select contacts to assign");
  parts.dropdown.classList.remove("has-value");
  clearAssignedAvatars(parts);
}

function resetAssignedDropdown(parts) {
  resetAssignedLabel(parts);
  clearAssignedMenuSelection(parts);
  parts.dropdown.classList.remove("is-open");
  if (parts.menu) parts.menu.hidden = true;
  if (parts.toggle) parts.toggle.setAttribute("aria-expanded", "false");
  filterAssignedItems(parts, "");
}
