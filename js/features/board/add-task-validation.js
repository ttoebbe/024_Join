/**
 * Validate add-task form state and return normalized values.
 * @param {object} state
 * @returns {object|null}
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
 * Return first validation error message or empty string.
 * @param {object} values
 * @returns {string}
 */
function getTaskValidationError(values) {
  if (!values.title) return "Please enter a title.";
  if (!values.dueDate) return "Please select a due date.";
  if (!values.category) return "Please select a category.";
  return "";
}

/**
 * Show the error and mark missing fields.
 * @param {object} state
 * @param {object} values
 * @param {string} error
 * @returns {void}
 */
function showAddTaskError(state, values, error) {
  setAddTaskFormMsg(state, error);
  markMissingTaskFields(state, values);
}

/**
 * Update the form message text.
 * @param {object} state
 * @param {string} message
 * @returns {void}
 */
function setAddTaskFormMsg(state, message) {
  if (!state.formMsg) return;
  state.formMsg.textContent = message || "";
}

/**
 * Mark missing required fields.
 * @param {object} state
 * @param {object} values
 * @returns {void}
 */
function markMissingTaskFields(state, values) {
  if (!values.title) addInputError(state.titleInput);
  if (!values.dueDate) addInputError(state.dueDateInput);
  if (!values.category) addInputError(state.categoryToggle);
}

/**
 * Add error styling to an input.
 * @param {HTMLElement|null} element
 * @returns {void}
 */
function addInputError(element) {
  if (element) element.classList.add("input-error");
}

/**
 * Clear validation errors on the add-task form.
 * @param {object} state
 * @returns {void}
 */
function clearAddTaskErrors(state) {
  setAddTaskFormMsg(state, "");
  clearInputError(state.dueDateInput);
  clearInputError(state.categoryToggle);
}

/**
 * Remove error styling from an input.
 * @param {HTMLElement|null} element
 * @returns {void}
 */
function clearInputError(element) {
  if (element) element.classList.remove("input-error");
}

/**
 * Check if the title is at or over the limit.
 * @param {string} title
 * @returns {boolean}
 */
function isTitleAtLimit(title) {
  return Boolean(title && title.length >= TITLE_MAX_LENGTH);
}

/**
 * Build the title limit message.
 * @returns {string}
 */
function getTitleLimitMessage() {
  return `Title is too long (max ${TITLE_MAX_LENGTH} characters).`;
}

/**
 * Check if the description is at or over the limit.
 * @param {string} value
 * @returns {boolean}
 */
function isDescriptionAtLimit(value) {
  return Boolean(value && value.length >= DESCRIPTION_MAX_LENGTH);
}

/**
 * Validate the title length and toggle errors.
 * @param {object} state
 * @returns {void}
 */
function validateTitleLength(state) {
  const value = state.titleInput?.value.trim() || "";
  if (!value) return clearFieldError("task-title-error", state.titleInput);
  if (isTitleAtLimit(value)) return showTitleLimitError(state);
  clearFieldError("task-title-error", state.titleInput);
}

/**
 * Validate the description length and toggle errors.
 * @param {object} state
 * @returns {void}
 */
function validateDescriptionLength(state) {
  const desc = document.getElementById("task-description");
  const value = desc?.value.trim() || "";
  if (!value) return clearFieldError("task-description-error", desc);
  if (isDescriptionAtLimit(value)) return showDescriptionLimitError(desc);
  clearFieldError("task-description-error", desc);
}

/**
 * Show title limit error.
 * @param {object} state
 * @returns {void}
 */
function showTitleLimitError(state) {
  showFieldError("task-title-error", getTitleLimitMessage(), state.titleInput);
}

/**
 * Show description limit error.
 * @param {HTMLTextAreaElement|null} desc
 * @returns {void}
 */
function showDescriptionLimitError(desc) {
  showFieldError(
    "task-description-error",
    `Description is too long (max ${DESCRIPTION_MAX_LENGTH} characters).`,
    desc
  );
}

/**
 * Show or clear a field error message.
 * @param {string} errorId
 * @param {string} message
 * @param {HTMLElement|null} inputEl
 * @returns {void}
 */
function showFieldError(errorId, message, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.classList.toggle("is-visible", Boolean(message));
  if (inputEl) inputEl.classList.toggle("input-error", Boolean(message));
}

/**
 * Clear a field error message.
 * @param {string} errorId
 * @param {HTMLElement|null} inputEl
 * @returns {void}
 */
function clearFieldError(errorId, inputEl) {
  showFieldError(errorId, "", inputEl);
}
