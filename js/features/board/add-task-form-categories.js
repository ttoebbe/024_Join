/**
 * Initializes the category dropdown.
 * @param {Object} state
 * @returns {Function|null}
 */
function initCategoryDropdown(state) {
  const dropdown = document.getElementById("category-dropdown");
  if (!dropdown) return null;
  const parts = getCategoryDropdownParts(dropdown);
  wireCategoryToggle(parts);
  wireCategoryOutsideClose(parts);
  wireCategoryItems(state, parts);
  applyCategoryDefault(state, parts);
  return () => resetCategoryDropdown(parts);
}

/**
 * Gets category dropdown DOM parts.
 * @param {HTMLElement} dropdown
 * @returns {Object}
 */
function getCategoryDropdownParts(dropdown) {
  const toggle = dropdown.querySelector("[data-category-toggle]");
  const menu = dropdown.querySelector("[data-category-menu]");
  const valueEl = dropdown.querySelector("[data-category-value]");
  const items = dropdown.querySelectorAll("[data-category-item]");
  return { dropdown, toggle, menu, valueEl, items };
}

/**
 * Wires the category toggle.
 * @param {Object} parts
 */
function wireCategoryToggle(parts) {
  parts.toggle?.addEventListener("click", () => {
    setCategoryOpen(parts, parts.menu?.hidden);
  });
}

/**
 * Opens or closes the category menu.
 * @param {Object} parts
 * @param {boolean} open
 */
function setCategoryOpen(parts, open) {
  if (!parts.menu || !parts.toggle) return;
  parts.menu.hidden = !open;
  parts.toggle.setAttribute("aria-expanded", String(open));
  parts.dropdown.classList.toggle("is-open", open);
}

/**
 * Closes the category menu on outside click.
 * @param {Object} parts
 */
function wireCategoryOutsideClose(parts) {
  document.addEventListener("click", (e) => {
    if (!parts.dropdown.contains(e.target)) setCategoryOpen(parts, false);
  });
}

/**
 * Wires category item click handlers.
 * @param {Object} state
 * @param {Object} parts
 */
function wireCategoryItems(state, parts) {
  parts.items.forEach((item) => wireCategoryItem(state, parts, item));
}

/**
 * Wires a single category item.
 * @param {Object} state
 * @param {Object} parts
 * @param {HTMLElement} item
 */
function wireCategoryItem(state, parts, item) {
  item.addEventListener("click", () => {
    setSelectedCategory(state, parts, item);
  });
}

/**
 * Sets the selected category.
 * @param {Object} state
 * @param {Object} parts
 * @param {HTMLElement} item
 */
function setSelectedCategory(state, parts, item) {
  state.selectedCategory = item.dataset.value || "";
  setCategoryValue(state, parts, item);
  clearAddTaskErrors(state);
  setCategoryOpen(parts, false);
  updateCreateButtonState(state);
}

/**
 * Updates the category value UI.
 * @param {Object} state
 * @param {Object} parts
 * @param {HTMLElement} item
 */
function setCategoryValue(state, parts, item) {
  if (state.categoryInput) state.categoryInput.value = state.selectedCategory;
  if (parts.valueEl)
    parts.valueEl.textContent = item.dataset.label || item.textContent || "";
  parts.dropdown.classList.toggle("has-value", Boolean(state.selectedCategory));
}

/**
 * Applies the default category selection.
 * @param {Object} state
 * @param {Object} parts
 */
function applyCategoryDefault(state, parts) {
  if (!state.selectedCategory) return;
  if (state.categoryInput) state.categoryInput.value = state.selectedCategory;
  if (parts.valueEl)
    parts.valueEl.textContent = getCategoryLabel(state.selectedCategory);
  parts.dropdown.classList.add("has-value");
}

/**
 * Gets the display label for a category.
 * @param {string} value
 * @returns {string}
 */
function getCategoryLabel(value) {
  return value === "technical" ? "Technical Task" : "User Story";
}

/**
 * Resets the category dropdown UI.
 * @param {Object} parts
 */
function resetCategoryDropdown(parts) {
  if (parts.valueEl) parts.valueEl.textContent = "Select task category";
  parts.dropdown.classList.remove("has-value", "is-open");
  if (parts.menu) parts.menu.hidden = true;
  if (parts.toggle) parts.toggle.setAttribute("aria-expanded", "false");
}

/**
 * Gets the selected category value.
 * @param {Object} state
 * @returns {string}
 */
function getSelectedCategoryValue(state) {
  if (state.categoryInput?.value) return state.categoryInput.value;
  return state.selectedCategory;
}

/**
 * Clears the category input value.
 * @param {Object} state
 */
function clearCategoryInput(state) {
  if (state.categoryInput) state.categoryInput.value = "";
}
