/**
 * @param {*} state
 * @returns {*}
 */
function initCategoryDropdown(state) {
  const dropdown = document.getElementById("categoryDropdown");
  if (!dropdown) return null;
  const parts = getCategoryDropdownParts(dropdown);
  wireCategoryToggle(parts);
  wireCategoryOutsideClose(parts);
  wireCategoryItems(state, parts);
  applyCategoryDefault(state, parts);
  return () => resetCategoryDropdown(parts);
}

/**
 * @param {*} dropdown
 * @returns {*}
 */
function getCategoryDropdownParts(dropdown) {
  const toggle = dropdown.querySelector("[data-category-toggle]");
  const menu = dropdown.querySelector("[data-category-menu]");
  const valueEl = dropdown.querySelector("[data-category-value]");
  const items = dropdown.querySelectorAll("[data-category-item]");
  return { dropdown, toggle, menu, valueEl, items };
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireCategoryToggle(parts) {
  parts.toggle?.addEventListener("click", () => {
    setCategoryOpen(parts, parts.menu?.hidden);
  });
}

/**
 * @param {*} parts
 * @param {*} open
 * @returns {*}
 */
function setCategoryOpen(parts, open) {
  if (!parts.menu || !parts.toggle) return;
  parts.menu.hidden = !open;
  parts.toggle.setAttribute("aria-expanded", String(open));
  parts.dropdown.classList.toggle("is-open", open);
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireCategoryOutsideClose(parts) {
  document.addEventListener("click", (e) => {
    if (!parts.dropdown.contains(e.target)) setCategoryOpen(parts, false);
  });
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function wireCategoryItems(state, parts) {
  parts.items.forEach((item) => wireCategoryItem(state, parts, item));
}

/**
 * @param {*} state
 * @param {*} parts
 * @param {*} item
 * @returns {*}
 */
function wireCategoryItem(state, parts, item) {
  item.addEventListener("click", () => {
    setSelectedCategory(state, parts, item);
  });
}

/**
 * @param {*} state
 * @param {*} parts
 * @param {*} item
 * @returns {*}
 */
function setSelectedCategory(state, parts, item) {
  state.selectedCategory = item.dataset.value || "";
  setCategoryValue(state, parts, item);
  clearAddTaskErrors(state);
  setCategoryOpen(parts, false);
  updateCreateButtonState(state);
}

/**
 * @param {*} state
 * @param {*} parts
 * @param {*} item
 * @returns {*}
 */
function setCategoryValue(state, parts, item) {
  if (state.categoryInput) state.categoryInput.value = state.selectedCategory;
  if (parts.valueEl) parts.valueEl.textContent = item.dataset.label || item.textContent || "";
  parts.dropdown.classList.toggle("has-value", Boolean(state.selectedCategory));
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function applyCategoryDefault(state, parts) {
  if (!state.selectedCategory) return;
  if (state.categoryInput) state.categoryInput.value = state.selectedCategory;
  if (parts.valueEl) parts.valueEl.textContent = getCategoryLabel(state.selectedCategory);
  parts.dropdown.classList.add("has-value");
}

/**
 * @param {*} value
 * @returns {*}
 */
function getCategoryLabel(value) {
  return value === "technical" ? "Technical Task" : "User Story";
}

/**
 * @param {*} parts
 * @returns {*}
 */
function resetCategoryDropdown(parts) {
  if (parts.valueEl) parts.valueEl.textContent = "Select task category";
  parts.dropdown.classList.remove("has-value", "is-open");
  if (parts.menu) parts.menu.hidden = true;
  if (parts.toggle) parts.toggle.setAttribute("aria-expanded", "false");
}

/**
 * @param {*} state
 * @returns {*}
 */
function getSelectedCategoryValue(state) {
  if (state.categoryInput?.value) return state.categoryInput.value;
  return state.selectedCategory;
}

/**
 * @param {*} state
 * @returns {*}
 */
function clearCategoryInput(state) {
  if (state.categoryInput) state.categoryInput.value = "";
}
