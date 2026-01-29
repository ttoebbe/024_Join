/**
 * Clears title length errors.
 */
function clearTitleLimitState(state) {
  clearFieldError("task-title-error", state.titleInput);
  clearInputError(state.titleInput);
}

/**
 * Clears description length errors.
 */
function clearDescriptionLimitState() {
  const desc = document.getElementById("task-description");
  clearFieldError("task-description-error", desc);
  clearInputError(desc);
}

/**
 * Clears subtask length errors.
 */
function clearSubtaskLimitState() {
  const input = document.getElementById("subtask-input");
  const errorEl = document.getElementById("subtask-error");
  if (errorEl) errorEl.classList.remove("is-visible");
  if (errorEl) errorEl.textContent = "";
  clearInputError(input);
}

/**
 * Wires validation cleanup handlers.
 */
function wireValidationCleanup(state) {
  state.form.addEventListener("input", () => {
    clearAddTaskErrors(state);
  });
  state.form.addEventListener("change", () => {
    clearAddTaskErrors(state);
  });
}

/**
 * Validates the task form.
 * @returns {Object|null}
 */
function validateTaskForm(state) {
  clearAddTaskErrors(state);
  const values = getTaskFormValues(state);
  const error = getTaskValidationError(values);
  if (!error) return values;
  showAddTaskError(state, values, error);
  return null;
}

/**
 * Returns a validation error message.
 * @returns {string}
 */
function getTaskValidationError(values) {
  if (!values.title) return "Please enter a title.";
  if (!values.dueDate) return "Please select a due date.";
  if (!values.category) return "Please select a category.";
  return "";
}

/**
 * Shows a validation error in the form.
 */
function showAddTaskError(state, values, error) {
  setAddTaskFormMsg(state, error);
  markMissingTaskFields(state, values);
}

/**
 * Sets the add-task form message.
 */
function setAddTaskFormMsg(state, message) {
  if (!state.formMsg) return;
  state.formMsg.textContent = message || "";
}

/**
 * Marks missing required fields.
 */
function markMissingTaskFields(state, values) {
  if (!values.title) addInputError(state.titleInput);
  if (!values.dueDate) addInputError(state.dueDateInput);
  if (!values.category) addInputError(state.categoryToggle);
}

/**
 * Adds error styling to an input.
 */
function addInputError(element) {
  if (element) element.classList.add("input-error");
}

/**
 * Clears add-task form errors.
 */
function clearAddTaskErrors(state) {
  setAddTaskFormMsg(state, "");
  clearInputError(state.dueDateInput);
  clearInputError(state.categoryToggle);
}

/**
 * Clears error styling on an input.
 */
function clearInputError(element) {
  if (element) element.classList.remove("input-error");
}

/**
 * Checks whether the title hits the max length.
 * @returns {boolean}
 */
function isTitleAtLimit(title) {
  return Boolean(title && title.length >= TITLE_MAX_LENGTH);
}

/**
 * Gets the title length error message.
 * @returns {string}
 */
function getTitleLimitMessage() {
  return `Title is too long (max ${TITLE_MAX_LENGTH} characters).`;
}

/**
 * Checks whether the description hits the max length.
 * @returns {boolean}
 */
function isDescriptionAtLimit(value) {
  return Boolean(value && value.length >= DESCRIPTION_MAX_LENGTH);
}

/**
 * Validates title length.
 */
function validateTitleLength(state) {
  const value = state.titleInput?.value.trim() || "";
  if (!value) return clearFieldError("task-title-error", state.titleInput);
  if (isTitleAtLimit(value)) return showTitleLimitError(state);
  clearFieldError("task-title-error", state.titleInput);
}

/**
 * Validates description length.
 */
function validateDescriptionLength(state) {
  const desc = document.getElementById("task-description");
  const value = desc?.value.trim() || "";
  if (!value) return clearFieldError("task-description-error", desc);
  if (isDescriptionAtLimit(value)) return showDescriptionLimitError(desc);
  clearFieldError("task-description-error", desc);
}

/**
 * Shows the title length error.
 */
function showTitleLimitError(state) {
  showFieldError("task-title-error", getTitleLimitMessage(), state.titleInput);
}

/**
 * Shows the description length error.
 */
function showDescriptionLimitError(desc) {
  showFieldError(
    "task-description-error",
    `Description is too long (max ${DESCRIPTION_MAX_LENGTH} characters).`,
    desc,
  );
}

/**
 * Shows a field error message.
 */
function showFieldError(errorId, message, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.classList.toggle("is-visible", Boolean(message));
  if (inputEl) inputEl.classList.toggle("input-error", Boolean(message));
}

/**
 * Clears a field error message.
 */
function clearFieldError(errorId, inputEl) {
  showFieldError(errorId, "", inputEl);
}
