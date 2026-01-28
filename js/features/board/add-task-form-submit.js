const TITLE_MAX_LENGTH = 40;
const DESCRIPTION_MAX_LENGTH = 200;

function wirePrioButtons(state) {
  state.form.querySelectorAll(".prio-btn").forEach((btn) => {
    btn.addEventListener("click", () => handlePrioButton(state, btn)); // Set priority
  });
}

function handlePrioButton(state, btn) {
  clearPrioActive(state);
  btn.classList.add("is-active");
  state.selectedPrio = btn.dataset.prio;
}

function clearPrioActive(state) {
  state.form.querySelectorAll(".prio-btn").forEach((b) => {
    b.classList.remove("is-active");
  });
}

function wireClearButton(state, resets) {
  document.getElementById("clear-btn")?.addEventListener("click", () => { // Clear form
    clearAddTaskForm(state, resets);
  });
}

function clearAddTaskForm(state, resets) {
  resetForm(state); updateAddTaskCounters(state); clearTitleLimitState(state);
  clearDescriptionLimitState(); clearSubtaskLimitState();
  resetStatusPreset(); resetPrioSelection(state); resetSelectionState(state);
  clearCategoryInput(state); resets.resetCategoryUi?.(); resets.resetAssignedUi?.();
  renderSubtasks(state); clearAddTaskErrors(state); updateCreateButtonState(state);
}

function resetPrioSelection(state) {
  state.selectedPrio = "medium";
  applyPrioButtonStyles(state);
}

function resetForm(state) {
  state.form.reset();
}

function resetStatusPreset() {
  const statusField = document.getElementById("task-status-preset");
  if (statusField) statusField.value = statusField.value || "todo";
}

function resetSelectionState(state) {
  state.selectedCategory = "";
  state.selectedAssigned = [];
  state.selectedSubtasks = [];
}

function wireSubmitHandler(state, onClose) {
  state.createBtn.addEventListener("click", async (e) => { // Submit task
    e?.preventDefault();
    await handleSubmit(state, onClose);
  });
  state.form.addEventListener("submit", async (e) => { // Submit task
    e.preventDefault();
    await handleSubmit(state, onClose);
  });
}

async function handleSubmit(state, onClose) {
  const values = validateTaskForm(state);
  if (!values) return;
  await submitTaskForm(state, values, onClose);
}

function getTaskFormValues(state) {
  const title = document.getElementById("task-title")?.value.trim();
  const dueDate = document.getElementById("task-due-date")?.value.trim();
  const category = getSelectedCategoryValue(state);
  const status = document.getElementById("task-status-preset")?.value || "todo";
  const description = document.getElementById("task-description")?.value.trim() || "";
  return { title, description, status, category, dueDate };
}

function clearTitleLimitState(state) {
  clearFieldError("task-title-error", state.titleInput);
  clearInputError(state.titleInput);
}

function clearDescriptionLimitState() {
  const desc = document.getElementById("task-description");
  clearFieldError("task-description-error", desc);
  clearInputError(desc);
}

function clearSubtaskLimitState() {
  const input = document.getElementById("subtask-input");
  const errorEl = document.getElementById("subtask-error");
  if (errorEl) errorEl.classList.remove("is-visible");
  if (errorEl) errorEl.textContent = "";
  clearInputError(input);
}

function wireValidationCleanup(state) {
  state.form.addEventListener("input", () => { // Clear validation on input
    clearAddTaskErrors(state);
  });
  state.form.addEventListener("change", () => { // Clear validation on change
    clearAddTaskErrors(state);
  });
}

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

async function persistTask(state, values) {
  if (state.mode === "edit" && state.task?.id) return updateExistingTask(state, values);
  return createNewTask(state, values);
}

function setCreateButtonBusy(state, busy) {
  if (!state.createBtn) return;
  if (busy) return void (state.createBtn.disabled = true);
  updateCreateButtonState(state);
}

async function updateExistingTask(state, values) {
  const updatedTask = buildTaskPayload(state, values, state.task);
  await TaskService.update(state.task.id, updatedTask);
}

async function createNewTask(state, values) {
  const taskId = await generateTaskId();
  const newTask = buildTaskPayload(state, values, { id: taskId });
  await TaskService.create(newTask);
}

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

async function refreshBoardIfNeeded() {
  if (typeof loadTasks !== "function") return;
  await loadTasks();
  if (typeof renderBoard === "function") renderBoard();
}

function wireCreateButtonState(state) {
  const handler = function () {
    updateCreateButtonState(state);
  };
  attachCreateButtonListeners(state, handler);
}

function attachCreateButtonListeners(state, handler) {
  state.titleInput?.addEventListener("input", handler); // Update create button
  state.titleInput?.addEventListener("input", () => validateTitleLength(state)); // Validate title
  state.dueDateInput?.addEventListener("input", handler); // Update create button
  state.dueDateInput?.addEventListener("change", handler); // Update create button
  state.form.addEventListener("input", handler); // Update create button
  state.form.addEventListener("change", handler); // Update create button
  wireAddTaskCounters(state);
}


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

function wireAddTaskCounters(state) {
  updateAddTaskCounters(state);
  state.titleInput?.addEventListener("input", () => updateAddTaskCounters(state)); // Update counters
  const desc = document.getElementById("task-description");
  desc?.addEventListener("input", () => updateAddTaskCounters(state)); // Update counters
}

function updateAddTaskCounters(state) {
  enforceMaxLength(state.titleInput, TITLE_MAX_LENGTH);
  if (typeof validateTitleLength === "function") validateTitleLength(state);
  updateFieldCounter(state.titleInput, "task-title-counter", TITLE_MAX_LENGTH);
  const desc = document.getElementById("task-description");
  enforceMaxLength(desc, DESCRIPTION_MAX_LENGTH);
  if (typeof validateDescriptionLength === "function") validateDescriptionLength(state);
  updateFieldCounter(desc, "task-description-counter", DESCRIPTION_MAX_LENGTH);
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
