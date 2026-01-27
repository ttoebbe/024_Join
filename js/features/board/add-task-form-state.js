/**
 * @param {*} options = {}
 * @returns {Promise<void>}
 */
async function initAddTaskForm(options = {}) {
  const state = createAddTaskState(options);
  if (!state.form) return;
  await setupAddTaskForm(state, options.onClose);
}

/**
 * @param {*} options = {}
 * @returns {*}
 */
function createAddTaskState(options = {}) {
  const form = document.getElementById("add-task-form");
  const state = initAddTaskState(form, options);
  attachAddTaskElements(state);
  return state;
}

/**
 * @param {*} form
 * @param {*} options
 * @returns {*}
 */
function initAddTaskState(form, options) {
  return {
    form,
    mode: options.mode || "create",
    task: options.task,
    selectedPrio: "medium",
    selectedCategory: "",
    selectedAssigned: [],
    selectedSubtasks: [],
    editingIndex: null,
    editingValue: "",
  };
}

/**
 * @param {*} state
 * @returns {*}
 */
function attachAddTaskElements(state) {
  attachMainInputs(state);
  attachSubtaskInputs(state);
}

/**
 * @param {*} state
 * @returns {*}
 */
function attachMainInputs(state) {
  state.createBtn = document.getElementById("create-btn");
  state.titleInput = document.getElementById("task-title");
  state.dueDateInput = document.getElementById("task-due-date");
  state.categoryInput = document.getElementById("task-category-value");
  state.categoryDropdown = document.getElementById("category-dropdown");
  state.categoryToggle = state.categoryDropdown?.querySelector("[data-category-toggle]");
  state.formMsg = document.getElementById("add-task-form-msg");
}

/**
 * @param {*} state
 * @returns {*}
 */
function attachSubtaskInputs(state) {
  state.subtaskInput = document.getElementById("subtask-input");
  state.subtaskAddBtn = document.getElementById("subtask-add-btn");
  state.subtaskList = document.getElementById("subtask-list");
}

/**
 * @param {*} state
 * @param {*} onClose
 * @returns {Promise<void>}
 */
async function setupAddTaskForm(state, onClose) {
  setDueDateMin(state.dueDateInput);
  wirePrioButtons(state);
  applyEditDefaults(state);
  const resets = initDropdowns(state);
  initSubtasks(state);
  await waitForAssignedReady(state);
  wireCreateButtonState(state);
  wireValidationCleanup(state);
  updateCreateButtonState(state);
  wireClearButton(state, resets);
  wireSubmitHandler(state, onClose);
}

/**
 * @param {*} state
 * @returns {Promise<void>}
 */
async function waitForAssignedReady(state) {
  if (!state?.assignedReady) return;
  await state.assignedReady;
}

/**
 * @param {*} state
 * @returns {*}
 */
function applyEditDefaults(state) {
  if (state.mode !== "edit" || !state.task) return;
  applyTaskDefaults(state, state.task);
}

/**
 * @param {*} state
 * @returns {*}
 */
function initDropdowns(state) {
  return {
    resetCategoryUi: initCategoryDropdown(state),
    resetAssignedUi: initAssignedDropdown(state),
  };
}

/**
 * @param {*} input
 * @returns {*}
 */
function setDueDateMin(input) {
  if (!input) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  input.min = `${yyyy}-${mm}-${dd}`;
}

/**
 * @param {*} state
 * @param {*} taskData
 * @returns {*}
 */
function applyTaskDefaults(state, taskData) {
  if (state.titleInput) state.titleInput.value = taskData.title || "";
  setTaskDescription(taskData);
  setNormalizedDueDate(state, taskData.dueDate);
  state.selectedCategory = String(taskData.category || "").toLowerCase();
  if (state.categoryInput) state.categoryInput.value = state.selectedCategory;
  state.selectedPrio = String(taskData.prio || "medium").toLowerCase();
  applyPrioButtonStyles(state);
  state.selectedAssigned = normalizeAssignedFromTask(taskData.assigned);
  state.selectedSubtasks = normalizeSubtasksFromTask(taskData.subtasks);
  renderSubtasks(state);
}

/**
 * @param {*} taskData
 * @returns {*}
 */
function setTaskDescription(taskData) {
  const descInput = document.getElementById("task-description");
  if (descInput) descInput.value = taskData.description || "";
}

/**
 * @param {*} state
 * @param {*} value
 * @returns {*}
 */
function setNormalizedDueDate(state, value) {
  const normalizedDate = normalizeDueDateForInput(value);
  if (state.dueDateInput && normalizedDate) state.dueDateInput.value = normalizedDate;
}

/**
 * @param {*} value
 * @returns {*}
 */
function normalizeDueDateForInput(value) {
  if (!value) return "";
  const v = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const match = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return "";
}

/**
 * @param {*} raw
 * @returns {*}
 */
function normalizeAssignedFromTask(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeAssignedItem(item))
    .filter((x) => x && x.name);
}

/**
 * @param {*} item
 * @returns {*}
 */
function normalizeAssignedItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { id: "", name: item, color: null };
  if (typeof item === "object") return buildAssignedValue(item);
  return null;
}

/**
 * @param {*} item
 * @returns {*}
 */
function buildAssignedValue(item) {
  return {
    id: item.id || "",
    name: item.name || item.fullName || item.username || "",
    color: item.color || null,
  };
}

/**
 * @param {*} state
 * @returns {*}
 */
function applyPrioButtonStyles(state) {
  state.form.querySelectorAll(".prio-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.prio === state.selectedPrio);
  });
}

