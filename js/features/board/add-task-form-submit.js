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
  state.form.querySelectorAll(".prio-btn").forEach((b) => b.classList.remove("is-active"));
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
  clearInputError(state.titleInput);
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

/**
 * @param {*} state
 * @returns {*}
 */
function wireValidationCleanup(state) {
  state.form.addEventListener("input", () => clearAddTaskErrors(state));
  state.form.addEventListener("change", () => clearAddTaskErrors(state));
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
    onClose?.();
  } finally {
    setCreateButtonBusy(state, false);
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
  const newTask = buildTaskPayload(state, values, { id: generateTaskId() });
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
  state.titleInput?.addEventListener("input", () => updateCreateButtonState(state));
  state.dueDateInput?.addEventListener("input", () => updateCreateButtonState(state));
  state.dueDateInput?.addEventListener("change", () => updateCreateButtonState(state));
  state.form.addEventListener("input", () => updateCreateButtonState(state));
  state.form.addEventListener("change", () => updateCreateButtonState(state));
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
