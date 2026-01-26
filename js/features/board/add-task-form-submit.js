/**
 * @param {*} state
 * @returns {*}
 */
function wirePrioButtons(state) {
  state.form.querySelectorAll(".prio-btn").forEach((btn) => {
    btn.addEventListener("click", () => handlePrioButton(state, btn));
  });
}
/**
 * @param {*} state
 * @param {*} btn
 * @returns {*}
 */
function handlePrioButton(state, btn) {
  clearPrioActive(state);
  btn.classList.add("is-active");
  state.selectedPrio = btn.dataset.prio;
}
/**
 * @param {*} state
 * @returns {*}
 */
function clearPrioActive(state) {
  state.form.querySelectorAll(".prio-btn").forEach((b) => {
    b.classList.remove("is-active");
  });
}
/**
 * @param {*} state
 * @param {*} resets
 * @returns {*}
 */
function wireClearButton(state, resets) {
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    clearAddTaskForm(state, resets);
  });
}
/**
 * @param {*} state
 * @param {*} resets
 * @returns {*}
 */
function clearAddTaskForm(state, resets) {
  resetForm(state);
  updateAddTaskCounters(state);
  resetStatusPreset();
  resetSelectionState(state);
  clearCategoryInput(state);
  resets.resetCategoryUi?.();
  resets.resetAssignedUi?.();
  renderSubtasks(state);
  clearAddTaskErrors(state);
  updateCreateButtonState(state);
}
/**
 * @param {*} state
 * @returns {*}
 */
function resetForm(state) {
  state.form.reset();
}
/**
 * @returns {*}
 */
function resetStatusPreset() {
  const statusField = document.getElementById("taskStatusPreset");
  if (statusField) statusField.value = statusField.value || "todo";
}
/**
 * @param {*} state
 * @returns {*}
 */
function resetSelectionState(state) {
  state.selectedCategory = "";
  state.selectedAssigned = [];
  state.selectedSubtasks = [];
}
/**
 * @param {*} state
 * @param {*} onClose
 * @returns {*}
 */
function wireSubmitHandler(state, onClose) {
  state.createBtn.addEventListener("click", async (e) => {
    e?.preventDefault();
    await handleSubmit(state, onClose);
  });
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSubmit(state, onClose);
  });
}
/**
 * @param {*} state
 * @param {*} onClose
 * @returns {*}
 */
async function handleSubmit(state, onClose) {
  const values = validateTaskForm(state);
  if (!values) return;
  await submitTaskForm(state, values, onClose);
}
/**
 * @param {*} state
 * @returns {*}
 */
function getTaskFormValues(state) {
  const title = document.getElementById("taskTitle")?.value.trim();
  const dueDate = document.getElementById("taskDueDate")?.value.trim();
  const category = getSelectedCategoryValue(state);
  const status = document.getElementById("taskStatusPreset")?.value || "todo";
  const description = document.getElementById("taskDescription")?.value.trim() || "";
  return { title, description, status, category, dueDate };
}
/**
 * @param {*} state
 * @returns {*}
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
 * @param {*} values
 * @returns {*}
 */
function getTaskValidationError(values) {
  if (!values.title) return "Please enter a title.";
  if (!values.dueDate) return "Please select a due date.";
  if (!values.category) return "Please select a category.";
  return "";
}
/**
 * @param {*} state
 * @param {*} values
 * @param {*} error
 * @returns {*}
 */
function showAddTaskError(state, values, error) {
  setAddTaskFormMsg(state, error);
  markMissingTaskFields(state, values);
}
/**
 * @param {*} state
 * @param {*} message
 * @returns {*}
 */
function setAddTaskFormMsg(state, message) {
  if (!state.formMsg) return;
  state.formMsg.textContent = message || "";
}
/**
 * @param {*} state
 * @param {*} values
 * @returns {*}
 */
function markMissingTaskFields(state, values) {
  if (!values.title) addInputError(state.titleInput);
  if (!values.dueDate) addInputError(state.dueDateInput);
  if (!values.category) addInputError(state.categoryToggle);
}
/**
 * @param {*} element
 * @returns {*}
 */
function addInputError(element) {
  if (element) element.classList.add("input-error");
}
/**
 * @param {*} state
 * @returns {*}
 */
function clearAddTaskErrors(state) {
  setAddTaskFormMsg(state, "");
  clearInputError(state.dueDateInput);
  clearInputError(state.categoryToggle);
}
/**
 * @param {*} element
 * @returns {*}
 */
function clearInputError(element) {
  if (element) element.classList.remove("input-error");
}

const TITLE_MAX_LENGTH = 40;
const DESCRIPTION_MAX_LENGTH = 200;

function isTitleAtLimit(title) {
  return Boolean(title && title.length >= TITLE_MAX_LENGTH);
}

function getTitleLimitMessage() {
  return `Title is too long (max ${TITLE_MAX_LENGTH} characters).`;
}

function showTitleLimitError(state) {
  showFieldError("taskTitle-error", getTitleLimitMessage(), state.titleInput);
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
/**
 * @param {*} state
 * @returns {*}
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
 * @param {*} state
 * @param {*} values
 * @param {*} onClose
 * @returns {*}
 */
async function submitTaskForm(state, values, onClose) {
  setCreateButtonBusy(state, true);
  try {
    await persistTask(state, values);
    await refreshBoardIfNeeded();
    handleSubmitSuccess(state, onClose);
  } finally {
    setCreateButtonBusy(state, false);
  }
}

function handleSubmitSuccess(state, onClose) {
  if (state.mode !== "edit" && typeof showAddedToBoardToast === "function") {
    showAddedToBoardToast();
  }
  if (!onClose) return;
  if (document.body.classList.contains("addtask-page")) {
    setTimeout(() => onClose(), 1200);
  } else {
    onClose();
  }
}
/**
 * @param {*} state
 * @param {*} values
 * @returns {*}
 */
async function persistTask(state, values) {
  if (state.mode === "edit" && state.task?.id) return updateExistingTask(state, values);
  return createNewTask(state, values);
}
/**
 * @param {*} state
 * @param {*} busy
 * @returns {*}
 */
function setCreateButtonBusy(state, busy) {
  if (!state.createBtn) return;
  if (busy) return void (state.createBtn.disabled = true);
  updateCreateButtonState(state);
}
/**
 * @param {*} state
 * @param {*} values
 * @returns {*}
 */
async function updateExistingTask(state, values) {
  const updatedTask = buildTaskPayload(state, values, state.task);
  await TaskService.update(state.task.id, updatedTask);
}
/**
 * @param {*} state
 * @param {*} values
 * @returns {*}
 */
async function createNewTask(state, values) {
  const taskId = await generateTaskId();
  const newTask = buildTaskPayload(state, values, { id: taskId });
  await TaskService.create(newTask);
}
/**
 * @param {*} state
 * @param {*} values
 * @param {*} base
 * @returns {*}
 */
function buildTaskPayload(state, values, base) {
  return {
    ...base,
    title: values.title,
    description: values.description,
    status: values.status,
    category: values.category,
    prio: state.selectedPrio,
    assigned: state.selectedAssigned,
    dueDate: values.dueDate,
    subtasks: state.selectedSubtasks,
  };
}
/**
 * @returns {*}
 */
async function refreshBoardIfNeeded() {
  if (typeof loadTasks !== "function") return;
  await loadTasks();
  if (typeof renderBoard === "function") renderBoard();
}
/**
 * @param {*} state
 * @returns {*}
 */
function wireCreateButtonState(state) {
  const handler = function () {
    updateCreateButtonState(state);
  };
  attachCreateButtonListeners(state, handler);
}
function attachCreateButtonListeners(state, handler) {
  state.titleInput?.addEventListener("input", handler);
  state.titleInput?.addEventListener("input", () => validateTitleLength(state));
  state.dueDateInput?.addEventListener("input", handler);
  state.dueDateInput?.addEventListener("change", handler);
  state.form.addEventListener("input", handler);
  state.form.addEventListener("change", handler);
  wireAddTaskCounters(state);
}
function validateTitleLength(state) {
  const value = state.titleInput?.value.trim() || "";
  if (!value) return clearFieldError("taskTitle-error", state.titleInput);
  if (isTitleAtLimit(value)) return showTitleLimitError(state);
  clearFieldError("taskTitle-error", state.titleInput);
}

function wireAddTaskCounters(state) {
  updateAddTaskCounters(state);
  state.titleInput?.addEventListener("input", () => updateAddTaskCounters(state));
  const desc = document.getElementById("taskDescription");
  desc?.addEventListener("input", () => validateDescriptionLength(state));
  desc?.addEventListener("input", () => updateAddTaskCounters(state));
}

function updateAddTaskCounters(state) {
  enforceMaxLength(state.titleInput, TITLE_MAX_LENGTH);
  validateTitleLength(state);
  updateFieldCounter(state.titleInput, "taskTitle-counter", TITLE_MAX_LENGTH);
  const desc = document.getElementById("taskDescription");
  enforceMaxLength(desc, DESCRIPTION_MAX_LENGTH);
  updateFieldCounter(desc, "taskDescription-counter", DESCRIPTION_MAX_LENGTH);
}

function updateFieldCounter(input, counterId, max) {
  const counter = document.getElementById(counterId);
  if (!counter) return;
  const length = (input?.value || "").length;
  counter.textContent = `${length}/${max}`;
}

function enforceMaxLength(input, max) {
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= max) return;
  input.value = value.slice(0, max);
}

function validateDescriptionLength(state) {
  const desc = document.getElementById("taskDescription");
  const value = desc?.value.trim() || "";
  if (!value) return clearFieldError("taskDescription-error", desc);
  if (isDescriptionAtLimit(value)) return showDescriptionLimitError(desc);
  clearFieldError("taskDescription-error", desc);
}

function isDescriptionAtLimit(value) {
  return Boolean(value && value.length >= DESCRIPTION_MAX_LENGTH);
}

function showDescriptionLimitError(desc) {
  showFieldError(
    "taskDescription-error",
    `Description is too long (max ${DESCRIPTION_MAX_LENGTH} characters).`,
    desc
  );
}
/**
 * @param {*} state
 * @returns {*}
 */
function updateCreateButtonState(state) {
  if (!state.createBtn) return;
  const isReady = Boolean(
    state.titleInput?.value.trim() &&
      state.dueDateInput?.value.trim() &&
      getSelectedCategoryValue(state)
  );
  state.createBtn.disabled = !isReady;
  state.createBtn.classList.toggle("is-active", isReady);
}
