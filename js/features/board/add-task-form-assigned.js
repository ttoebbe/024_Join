/**
 * Initializes the assigned dropdown.
 * @param {Object} state
 * @returns {Function|null}
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
 * Gets assigned dropdown DOM parts.
 * @param {HTMLElement} dropdown
 * @returns {Object}
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
 * Gets the avatars element for assigned selection.
 * @param {HTMLElement} dropdown
 * @returns {HTMLElement|null}
 */
function getAssignedAvatarsElement(dropdown) {
  const parent = dropdown.parentElement;
  if (!parent) return null;
  return parent.querySelector("[data-assigned-avatars]");
}

/**
 * Wires the assigned toggle handler.
 * @param {Object} state
 * @param {Object} parts
 */
function wireAssignedToggle(state, parts) {
  parts.toggle?.addEventListener("click", (event) => {
    handleAssignedToggleClick(state, parts, event);
  });
}

/**
 * Handles toggle clicks for the assigned dropdown.
 * @param {Object} state
 * @param {Object} parts
 * @param {Event} event
 */
function handleAssignedToggleClick(state, parts, event) {
  if (!parts.menu) return;
  if (isAssignedCaretClick(parts, event))
    return toggleAssignedDropdown(state, parts);
  if (isAssignedInputClick(parts, event))
    return openAssignedDropdown(state, parts);
  toggleAssignedDropdown(state, parts);
}

/**
 * Checks if the assigned input was clicked.
 * @param {Object} parts
 * @param {Event} event
 * @returns {boolean}
 */
function isAssignedInputClick(parts, event) {
  if (!parts.input) return false;
  return event.target === parts.input;
}

/**
 * Checks if the assigned caret was clicked.
 * @param {Object} parts
 * @param {Event} event
 * @returns {boolean}
 */
function isAssignedCaretClick(parts, event) {
  if (!parts.caret) return false;
  return event.target === parts.caret;
}

/**
 * Opens or closes the assigned dropdown.
 * @param {Object} parts
 * @param {boolean} open
 */
function setAssignedOpen(parts, open) {
  if (!parts.menu || !parts.toggle) return;
  parts.menu.hidden = !open;
  parts.toggle.setAttribute("aria-expanded", String(open));
  parts.dropdown.classList.toggle("is-open", open);
  updateAssignedInputState(parts, open);
}

/**
 * Wires outside click handling for the assigned dropdown.
 * @param {Object} state
 * @param {Object} parts
 */
function wireAssignedOutsideClose(state, parts) {
  document.addEventListener("click", (e) => {
    if (!parts.dropdown.contains(e.target)) closeAssignedDropdown(state, parts);
  });
}

/**
 * Wires assigned search input handlers.
 * @param {Object} state
 * @param {Object} parts
 */
function wireAssignedSearch(state, parts) {
  if (!parts.input) return;
  wireAssignedInputClick(state, parts);
  wireAssignedInputFocus(parts);
  wireAssignedInputChange(parts);
  wireAssignedInputEscape(state, parts);
}

/**
 * Wires input click handling.
 * @param {Object} state
 * @param {Object} parts
 */
function wireAssignedInputClick(state, parts) {
  parts.input.addEventListener("click", (event) => {
    handleAssignedInputClick(state, parts, event);
  });
}

/**
 * Wires input focus handling.
 * @param {Object} parts
 */
function wireAssignedInputFocus(parts) {
  parts.input.addEventListener("focus", () => setAssignedOpen(parts, true));
}

/**
 * Wires input change handling.
 * @param {Object} parts
 */
function wireAssignedInputChange(parts) {
  parts.input.addEventListener("input", () => {
    setAssignedOpen(parts, true);
    filterAssignedItems(parts, parts.input.value);
  });
}

/**
 * Wires input escape handling.
 * @param {Object} state
 * @param {Object} parts
 */
function wireAssignedInputEscape(state, parts) {
  parts.input.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeAssignedDropdown(state, parts);
    parts.input.blur();
  });
}

/**
 * Handles assigned input clicks.
 * @param {Object} state
 * @param {Object} parts
 * @param {Event} event
 */
function handleAssignedInputClick(state, parts, event) {
  event.stopPropagation();
  openAssignedDropdown(state, parts);
}
