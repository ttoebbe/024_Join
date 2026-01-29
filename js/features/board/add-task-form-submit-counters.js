/**
 * Wires create button state updates.
 */
function wireCreateButtonState(state) {
  const handler = function () {
    updateCreateButtonState(state);
  };
  attachCreateButtonListeners(state, handler);
}

/**
 * Attaches listeners for create button state.
 */
function attachCreateButtonListeners(state, handler) {
  state.titleInput?.addEventListener("input", handler);
  state.titleInput?.addEventListener("input", () => validateTitleLength(state));
  state.dueDateInput?.addEventListener("input", handler);
  state.dueDateInput?.addEventListener("change", handler);
  state.form.addEventListener("input", handler);
  state.form.addEventListener("change", handler);
  wireAddTaskCounters(state);
}

/**
 * Updates the create button enabled state.
 */
function updateCreateButtonState(state) {
  if (!state.createBtn) return;
  const isReady = Boolean(
    state.titleInput?.value.trim() &&
      state.dueDateInput?.value.trim() &&
      getSelectedCategoryValue(state),
  );
  state.createBtn.disabled = !isReady;
  state.createBtn.classList.toggle("is-active", isReady);
}

/**
 * Wires the title/description counters.
 */
function wireAddTaskCounters(state) {
  updateAddTaskCounters(state);
  state.titleInput?.addEventListener("input", () =>
    updateAddTaskCounters(state),
  );
  const desc = document.getElementById("task-description");
  desc?.addEventListener("input", () => updateAddTaskCounters(state));
}

/**
 * Updates the title/description counters.
 */
function updateAddTaskCounters(state) {
  enforceMaxLength(state.titleInput, TITLE_MAX_LENGTH);
  if (typeof validateTitleLength === "function") validateTitleLength(state);
  updateFieldCounter(state.titleInput, "task-title-counter", TITLE_MAX_LENGTH);
  const desc = document.getElementById("task-description");
  enforceMaxLength(desc, DESCRIPTION_MAX_LENGTH);
  if (typeof validateDescriptionLength === "function")
    validateDescriptionLength(state);
  updateFieldCounter(desc, "task-description-counter", DESCRIPTION_MAX_LENGTH);
}

/**
 * Updates a field counter.
 */
function updateFieldCounter(input, counterId, max) {
  const counter = document.getElementById(counterId);
  if (!counter) return;
  const length = (input?.value || "").length;
  counter.textContent = `${length}/${max}`;
}

/**
 * Enforces a max length for an input.
 */
function enforceMaxLength(input, max) {
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= max) return;
  input.value = value.slice(0, max);
}
