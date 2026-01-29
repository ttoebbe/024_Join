const TITLE_MAX_LENGTH = 40;
const DESCRIPTION_MAX_LENGTH = 200;

/**
 * Wires submit handlers for the form.
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
 * Handles the submit flow.
 */
async function handleSubmit(state, onClose) {
  const values = validateTaskForm(state);
  if (!values) return;
  await submitTaskForm(state, values, onClose);
}

/**
 * Collects task form values.
 * @returns {{ title: string, description: string, status: string, category: string, dueDate: string }}
 */
function getTaskFormValues(state) {
  const title = document.getElementById("task-title")?.value.trim();
  const dueDate = document.getElementById("task-due-date")?.value.trim();
  const category = getSelectedCategoryValue(state);
  const status = document.getElementById("task-status-preset")?.value || "todo";
  const description =
    document.getElementById("task-description")?.value.trim() || "";
  return { title, description, status, category, dueDate };
}

/**
 * Submits the task form and handles persistence.
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

/**
 * Handles a successful submit.
 */
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
 * Persists a task based on mode.
 */
async function persistTask(state, values) {
  if (state.mode === "edit" && state.task?.id)
    return updateExistingTask(state, values);
  return createNewTask(state, values);
}

/**
 * Sets busy state for the create button.
 */
function setCreateButtonBusy(state, busy) {
  if (!state.createBtn) return;
  if (busy) return void (state.createBtn.disabled = true);
  updateCreateButtonState(state);
}

/**
 * Updates an existing task.
 */
async function updateExistingTask(state, values) {
  const updatedTask = buildTaskPayload(state, values, state.task);
  await TaskService.update(state.task.id, updatedTask);
}

/**
 * Creates a new task.
 */
async function createNewTask(state, values) {
  const taskId = await generateTaskId();
  const newTask = buildTaskPayload(state, values, { id: taskId });
  await TaskService.create(newTask);
}

/**
 * Builds the task payload.
 * @returns {Object}
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
 * Reloads the board if available.
 */
async function refreshBoardIfNeeded() {
  if (typeof loadTasks !== "function") return;
  await loadTasks();
  if (typeof renderBoard === "function") renderBoard();
}
