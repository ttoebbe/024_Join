/**
 * @param {*} parts
 * @param {MouseEvent} event
 * @returns {boolean}
 */
function isAssignedInputClick(parts, event) {
  if (!parts.input) return false;
  return event.target === parts.input;
}

/**
 * @param {*} parts
 * @param {MouseEvent} event
 * @returns {boolean}
 */
function isAssignedCaretClick(parts, event) {
  if (!parts.caret) return false;
  return event.target === parts.caret;
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function openAssignedDropdown(state, parts) {
  setAssignedOpen(parts, true);
  focusAssignedInput(parts);
  filterAssignedItems(parts, parts.input?.value || "");
  updateAssignedLabel(state, parts);
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function toggleAssignedDropdown(state, parts) {
  if (!parts.menu) return;
  const open = parts.menu.hidden;
  setAssignedOpen(parts, open);
  if (open) return openAssignedDropdown(state, parts);
  closeAssignedDropdown(state, parts);
}

/**
 * @param {*} parts
 * @returns {*}
 */
function focusAssignedInput(parts) {
  if (!parts.input) return;
  parts.input.focus();
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function closeAssignedDropdown(state, parts) {
  setAssignedOpen(parts, false);
  filterAssignedItems(parts, "");
  updateAssignedLabel(state, parts);
}

/**
 * @param {*} parts
 * @param {boolean} open
 * @returns {*}
 */
function updateAssignedInputState(parts, open) {
  if (!parts.input) return;
  if (open) return prepareAssignedSearch(parts);
  restoreAssignedPlaceholder(parts);
}

/**
 * @param {*} parts
 * @returns {*}
 */
function prepareAssignedSearch(parts) {
  parts.input.placeholder = "Search contacts";
}

/**
 * @param {*} parts
 * @returns {*}
 */
function restoreAssignedPlaceholder(parts) {
  parts.input.placeholder = "Select contacts to assign";
}

/**
 * @param {*} parts
 * @returns {*}
 */
function clearAssignedSearch(parts) {
  if (!parts?.input) return;
  parts.input.value = "";
  filterAssignedItems(parts, "");
}

/**
 * @param {*} parts
 * @param {string} value
 * @returns {*}
 */
function setAssignedValue(parts, value) {
  if (parts.valueEl) parts.valueEl.textContent = value;
}

/**
 * @param {*} parts
 * @param {string} query
 * @returns {*}
 */
function filterAssignedItems(parts, query) {
  if (!parts.menu) return;
  const term = normalizeAssignedSearch(query);
  applyAssignedFilter(parts.menu, term);
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeAssignedSearch(value) {
  const plain = stripDiacritics(String(value || ""));
  return plain.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * @param {HTMLElement} menu
 * @param {string} term
 * @returns {*}
 */
function applyAssignedFilter(menu, term) {
  const items = menu.querySelectorAll(".dropdown-item--assigned");
  items.forEach((item) => setAssignedItemVisibility(item, term));
}

/**
 * @param {HTMLElement} item
 * @param {string} term
 * @returns {*}
 */
function setAssignedItemVisibility(item, term) {
  const shouldHide = isAssignedHidden(item, term);
  item.hidden = shouldHide;
  item.style.display = shouldHide ? "none" : "";
}

/**
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
 * @param {string} value
 * @returns {string}
 */
function stripDiacritics(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const MAX_ASSIGNED_AVATARS = 3;

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
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
 * @param {*} state
 * @returns {Array}
 */
function getSelectedAssigned(state) {
  return state.selectedAssigned || [];
}

/**
 * @param {*} parts
 * @param {Array} selected
 * @returns {*}
 */
function appendAssignedAvatars(parts, selected) {
  const visible = selected.slice(0, MAX_ASSIGNED_AVATARS);
  visible.forEach((person) => {
    const avatar = buildAssignedAvatar(person, "assigned-avatar assigned-avatar--sm");
    parts.avatarsEl.appendChild(avatar);
  });
}

/**
 * @param {*} parts
 * @param {number} total
 * @returns {*}
 */
function appendAssignedMoreBadge(parts, total) {
  if (total <= MAX_ASSIGNED_AVATARS) return;
  const extra = total - MAX_ASSIGNED_AVATARS;
  const more = buildAssignedMoreBadge(extra);
  parts.avatarsEl.appendChild(more);
}

/**
 * @param {number} count
 * @returns {*}
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
 * @param {*} parts
 * @returns {*}
 */
function clearAssignedAvatars(parts) {
  if (!parts.avatarsEl) return;
  parts.avatarsEl.innerHTML = "";
  parts.avatarsEl.hidden = true;
}

/**
 * @param {*} parts
 * @returns {*}
 */
function clearAssignedMenuSelection(parts) {
  if (!parts.menu) return;
  parts.menu.querySelectorAll(".dropdown-item--assigned").forEach((item) => {
    item.classList.remove("is-selected");
    const check = item.querySelector(".assigned-check");
    if (check) check.textContent = "";
  });
}

/**
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
 * @param {*} data
 * @returns {Array}
 */
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}
