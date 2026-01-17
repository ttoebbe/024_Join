/**
 * Setzt Mindest-Datum auf heute für Due-Date-Input
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
 * Konvertiert Datum zu Input-Format (YYYY-MM-DD)
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
 * Normalisiert Assigned-Daten von Task in Array-Format
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
 * Normalisiert einzelnes Assigned-Item
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
 * Erstellt Assigned-Wert-Objekt aus Item
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
 * Normalisiert Subtasks von Task
 * @param {*} raw
 * @returns {*}
 */
function normalizeSubtasksFromTask(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeSubtaskItem(item))
    .filter((x) => x && x.title);
}

/**
 * Normalisiert einzelnes Subtask-Item
 * @param {*} item
 * @returns {*}
 */
function normalizeSubtaskItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { title: item, done: false };
  if (typeof item === "object") return buildSubtaskValue(item);
  return null;
}

/**
 * Erstellt Subtask-Wert-Objekt aus Item
 * @param {*} item
 * @returns {*}
 */
function buildSubtaskValue(item) {
  return {
    title: item.title || "",
    done: Boolean(item.done),
  };
}

/**
 * Konvertiert beliebige Daten zu Array
 * @param {*} data
 * @returns {*}
 */
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}

/**
 * Wendet gespeicherte Task-Daten auf Formular an (Edit-Mode)
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
 * Setzt Description in Input
 * @param {*} taskData
 * @returns {*}
 */
function setTaskDescription(taskData) {
  const descInput = document.getElementById("taskDescription");
  if (descInput) descInput.value = taskData.description || "";
}

/**
 * Setzt normalisiertes Datum in Due-Date-Input
 * @param {*} state
 * @param {*} value
 * @returns {*}
 */
function setNormalizedDueDate(state, value) {
  const normalizedDate = normalizeDueDateForInput(value);
  if (state.dueDateInput && normalizedDate) state.dueDateInput.value = normalizedDate;
}
