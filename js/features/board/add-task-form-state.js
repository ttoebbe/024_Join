
async function initAddTaskForm(options = {}) {
  const state = createAddTaskState(options);
  if (!state.form) return;
  await setupAddTaskForm(state, options.onClose);
}

function createAddTaskState(options = {}) {
  const form = document.getElementById("add-task-form");
  const state = initAddTaskState(form, options);
  attachAddTaskElements(state);
  return state;
}

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

function attachAddTaskElements(state) {
  attachMainInputs(state);
  attachSubtaskInputs(state);
}

function attachMainInputs(state) {
  state.createBtn = document.getElementById("create-btn");
  state.titleInput = document.getElementById("task-title");
  state.dueDateInput = document.getElementById("task-due-date");
  state.categoryInput = document.getElementById("task-category-value");
  state.categoryDropdown = document.getElementById("category-dropdown");
  state.categoryToggle = state.categoryDropdown?.querySelector("[data-category-toggle]");
  state.formMsg = document.getElementById("add-task-form-msg");
}

function attachSubtaskInputs(state) {
  state.subtaskInput = document.getElementById("subtask-input");
  state.subtaskAddBtn = document.getElementById("subtask-add-btn");
  state.subtaskList = document.getElementById("subtask-list");
}

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

async function waitForAssignedReady(state) {
  if (!state?.assignedReady) return;
  await state.assignedReady;
}

function applyEditDefaults(state) {
  if (state.mode !== "edit" || !state.task) return;
  applyTaskDefaults(state, state.task);
}

function initDropdowns(state) {
  return {
    resetCategoryUi: initCategoryDropdown(state),
    resetAssignedUi: initAssignedDropdown(state),
  };
}

function setDueDateMin(input) {
  if (!input) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  input.min = `${yyyy}-${mm}-${dd}`;
}

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

function setTaskDescription(taskData) {
  const descInput = document.getElementById("task-description");
  if (descInput) descInput.value = taskData.description || "";
}

function setNormalizedDueDate(state, value) {
  const normalizedDate = normalizeDueDateForInput(value);
  if (state.dueDateInput && normalizedDate) state.dueDateInput.value = normalizedDate;
}

function normalizeDueDateForInput(value) {
  if (!value) return "";
  const v = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const match = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return "";
}

function normalizeAssignedFromTask(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeAssignedItem(item))
    .filter((x) => x && x.name);
}

function normalizeAssignedItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { id: "", name: item, color: null };
  if (typeof item === "object") return buildAssignedValue(item);
  return null;
}

function buildAssignedValue(item) {
  return {
    id: item.id || "",
    name: item.name || item.fullName || item.username || "",
    color: item.color || null,
  };
}

function applyPrioButtonStyles(state) {
  state.form.querySelectorAll(".prio-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.prio === state.selectedPrio);
  });
}

