const MAX_ASSIGNED_AVATARS = 3;

/**
 * Opens the assigned dropdown.
 * @param {Object} state
 * @param {Object} parts
 */
function openAssignedDropdown(state, parts) {
  setAssignedOpen(parts, true);
  focusAssignedInput(parts);
  filterAssignedItems(parts, parts.input?.value || "");
  updateAssignedLabel(state, parts);
}

/**
 * Toggles the assigned dropdown.
 * @param {Object} state
 * @param {Object} parts
 */
function toggleAssignedDropdown(state, parts) {
  if (!parts.menu) return;
  const open = parts.menu.hidden;
  setAssignedOpen(parts, open);
  if (open) return openAssignedDropdown(state, parts);
  closeAssignedDropdown(state, parts);
}

/**
 * Focuses the assigned input.
 * @param {Object} parts
 */
function focusAssignedInput(parts) {
  if (!parts.input) return;
  parts.input.focus();
}

/**
 * Closes the assigned dropdown.
 * @param {Object} state
 * @param {Object} parts
 */
function closeAssignedDropdown(state, parts) {
  setAssignedOpen(parts, false);
  filterAssignedItems(parts, "");
  updateAssignedLabel(state, parts);
}

/**
 * Updates assigned input placeholder state.
 * @param {Object} parts
 * @param {boolean} open
 */
function updateAssignedInputState(parts, open) {
  if (!parts.input) return;
  if (open) return prepareAssignedSearch(parts);
  restoreAssignedPlaceholder(parts);
}

/**
 * Prepares the assigned input for searching.
 * @param {Object} parts
 */
function prepareAssignedSearch(parts) {
  parts.input.placeholder = "Search contacts";
}

/**
 * Restores the assigned input placeholder.
 * @param {Object} parts
 */
function restoreAssignedPlaceholder(parts) {
  parts.input.placeholder = "Select contacts to assign";
}

/**
 * Clears the assigned search input.
 * @param {Object} parts
 */
function clearAssignedSearch(parts) {
  if (!parts?.input) return;
  parts.input.value = "";
  filterAssignedItems(parts, "");
}

/**
 * Sets the assigned value text.
 * @param {Object} parts
 * @param {string} value
 */
function setAssignedValue(parts, value) {
  if (parts.valueEl) parts.valueEl.textContent = value;
}

/**
 * Filters assigned items by query.
 * @param {Object} parts
 * @param {string} query
 */
function filterAssignedItems(parts, query) {
  if (!parts.menu) return;
  const term = normalizeAssignedSearch(query);
  applyAssignedFilter(parts.menu, term);
}

/**
 * Applies the assigned filter to menu items.
 * @param {HTMLElement} menu
 * @param {string} term
 */
function applyAssignedFilter(menu, term) {
  const items = menu.querySelectorAll(".dropdown-item--assigned");
  items.forEach((item) => setAssignedItemVisibility(item, term));
}

/**
 * Updates visibility for an assigned item.
 * @param {HTMLElement} item
 * @param {string} term
 */
function setAssignedItemVisibility(item, term) {
  const shouldHide = isAssignedHidden(item, term);
  item.hidden = shouldHide;
  item.style.display = shouldHide ? "none" : "";
}

/**
 * Checks whether an item should be hidden.
 * @param {HTMLElement} item
 * @param {string} term
 * @returns {boolean}
 */
function isAssignedHidden(item, term) {
  if (term.length === 0) return false;
  const haystack = item.dataset.search || "";
  return !haystack.includes(term);
}

/**
 * Renders assigned avatars.
 * @param {Object} state
 * @param {Object} parts
 */
function renderAssignedAvatars(state, parts) {
  if (!parts.avatarsEl) return;
  const selected = getSelectedAssigned(state);
  clearAssignedAvatars(parts);
  appendAssignedAvatars(parts, selected);
  appendAssignedMoreBadge(parts, selected.length);
  parts.avatarsEl.hidden = selected.length === 0;
}

/**
 * Gets selected assigned list.
 * @param {Object} state
 * @returns {Array}
 */
function getSelectedAssigned(state) {
  return state.selectedAssigned || [];
}

/**
 * Appends assigned avatars.
 * @param {Object} parts
 * @param {Array} selected
 */
function appendAssignedAvatars(parts, selected) {
  const visible = selected.slice(0, MAX_ASSIGNED_AVATARS);
  visible.forEach((person) => {
    const avatar = buildAssignedAvatar(
      person,
      "assigned-avatar assigned-avatar--sm",
    );
    parts.avatarsEl.appendChild(avatar);
  });
}

/**
 * Appends the more badge if needed.
 * @param {Object} parts
 * @param {number} total
 */
function appendAssignedMoreBadge(parts, total) {
  if (total <= MAX_ASSIGNED_AVATARS) return;
  const extra = total - MAX_ASSIGNED_AVATARS;
  const more = buildAssignedMoreBadge(extra);
  parts.avatarsEl.appendChild(more);
}

/**
 * Builds the more badge element.
 * @param {number} count
 * @returns {HTMLElement}
 */
function buildAssignedMoreBadge(count) {
  const badge = document.createElement("span");
  badge.className = "assigned-avatar assigned-avatar--sm assigned-avatar--more";
  badge.textContent = `+${count}`;
  badge.setAttribute("aria-label", `${count} more assigned`);
  badge.title = `${count} more assigned`;
  return badge;
}

/**
 * Clears assigned avatars.
 * @param {Object} parts
 */
function clearAssignedAvatars(parts) {
  if (!parts.avatarsEl) return;
  parts.avatarsEl.innerHTML = "";
  parts.avatarsEl.hidden = true;
}

/**
 * Updates the assigned label text.
 * @param {Object} state
 * @param {Object} parts
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
 * Collects assigned names.
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
 * Resets the assigned label.
 * @param {Object} parts
 */
function resetAssignedLabel(parts) {
  if (parts.valueEl) setAssignedValue(parts, "Select contacts to assign");
  parts.dropdown.classList.remove("has-value");
  clearAssignedAvatars(parts);
}

/**
 * Resets the assigned dropdown UI.
 * @param {Object} parts
 */
function resetAssignedDropdown(parts) {
  resetAssignedLabel(parts);
  clearAssignedMenuSelection(parts);
  parts.dropdown.classList.remove("is-open");
  if (parts.menu) parts.menu.hidden = true;
  if (parts.toggle) parts.toggle.setAttribute("aria-expanded", "false");
  filterAssignedItems(parts, "");
}
