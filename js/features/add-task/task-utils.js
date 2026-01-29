/**
 * Sets the minimum due date on the input.
 * @param {HTMLInputElement} input
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
 * Normalizes a due date value for a date input.
 * @param {string} value
 * @returns {string}
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
 * Normalizes assigned users from task data.
 * @param {any} raw
 * @returns {Array}
 */
function normalizeAssignedFromTask(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeAssignedItem(item))
    .filter((x) => x && x.name);
}

/**
 * Normalizes a single assigned entry.
 * @param {any} item
 * @returns {Object|null}
 */
function normalizeAssignedItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { id: "", name: item, color: null };
  if (typeof item === "object") return buildAssignedValue(item);
  return null;
}

/**
 * Builds a normalized assigned value.
 * @param {Object} item
 * @returns {Object}
 */
function buildAssignedValue(item) {
  return {
    id: item.id || "",
    name: item.name || item.fullName || item.username || "",
    color: item.color || null,
  };
}

/**
 * Normalizes subtasks from task data.
 * @param {any} raw
 * @returns {Array}
 */
function normalizeSubtasksFromTask(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeSubtaskItem(item))
    .filter((x) => x && x.title);
}

/**
 * Normalizes a single subtask entry.
 * @param {any} item
 * @returns {Object|null}
 */
function normalizeSubtaskItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { title: item, done: false };
  if (typeof item === "object") return buildSubtaskValue(item);
  return null;
}

/**
 * Builds a normalized subtask value.
 * @param {Object} item
 * @returns {Object}
 */
function buildSubtaskValue(item) {
  return {
    title: item.title || "",
    done: Boolean(item.done),
  };
}

/**
 * Normalizes raw data to an array.
 * @param {any} data
 * @returns {Array}
 */
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}

/**
 * Applies task defaults to the form state.
 * @param {Object} state
 * @param {Object} taskData
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
 * Sets the task description input.
 * @param {Object} taskData
 */
function setTaskDescription(taskData) {
  const descInput = document.getElementById("task-description");
  if (descInput) descInput.value = taskData.description || "";
}

/**
 * Sets the normalized due date.
 * @param {Object} state
 * @param {string} value
 */
function setNormalizedDueDate(state, value) {
  const normalizedDate = normalizeDueDateForInput(value);
  if (state.dueDateInput && normalizedDate)
    state.dueDateInput.value = normalizedDate;
}
