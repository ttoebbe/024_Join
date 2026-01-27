function validateTaskForm(state) {
  clearAddTaskErrors(state);
  const values = getTaskFormValues(state);
  const error = getTaskValidationError(values);
  if (!error) return values;
  showAddTaskError(state, values, error);
  return null;
}

function getTaskValidationError(values) {
  if (!values.title) return "Please enter a title.";
  if (!values.dueDate) return "Please select a due date.";
  if (!values.category) return "Please select a category.";
  return "";
}

function showAddTaskError(state, values, error) {
  setAddTaskFormMsg(state, error);
  markMissingTaskFields(state, values);
}

function setAddTaskFormMsg(state, message) {
  if (!state.formMsg) return;
  state.formMsg.textContent = message || "";
}

function markMissingTaskFields(state, values) {
  if (!values.title) addInputError(state.titleInput);
  if (!values.dueDate) addInputError(state.dueDateInput);
  if (!values.category) addInputError(state.categoryToggle);
}

function addInputError(element) {
  if (element) element.classList.add("input-error");
}

function clearAddTaskErrors(state) {
  setAddTaskFormMsg(state, "");
  clearInputError(state.dueDateInput);
  clearInputError(state.categoryToggle);
}

function clearInputError(element) {
  if (element) element.classList.remove("input-error");
}

function isTitleAtLimit(title) {
  return Boolean(title && title.length >= TITLE_MAX_LENGTH);
}

function getTitleLimitMessage() {
  return `Title is too long (max ${TITLE_MAX_LENGTH} characters).`;
}

function isDescriptionAtLimit(value) {
  return Boolean(value && value.length >= DESCRIPTION_MAX_LENGTH);
}

function validateTitleLength(state) {
  const value = state.titleInput?.value.trim() || "";
  if (!value) return clearFieldError("task-title-error", state.titleInput);
  if (isTitleAtLimit(value)) return showTitleLimitError(state);
  clearFieldError("task-title-error", state.titleInput);
}

function validateDescriptionLength(state) {
  const desc = document.getElementById("task-description");
  const value = desc?.value.trim() || "";
  if (!value) return clearFieldError("task-description-error", desc);
  if (isDescriptionAtLimit(value)) return showDescriptionLimitError(desc);
  clearFieldError("task-description-error", desc);
}

function showTitleLimitError(state) {
  showFieldError("task-title-error", getTitleLimitMessage(), state.titleInput);
}

function showDescriptionLimitError(desc) {
  showFieldError(
    "task-description-error",
    `Description is too long (max ${DESCRIPTION_MAX_LENGTH} characters).`,
    desc
  );
}

function showFieldError(errorId, message, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.classList.toggle("is-visible", Boolean(message));
  if (inputEl) inputEl.classList.toggle("input-error", Boolean(message));
}

function clearFieldError(errorId, inputEl) {
  showFieldError(errorId, "", inputEl);
}
