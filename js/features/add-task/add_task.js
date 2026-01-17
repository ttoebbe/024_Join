/**
 * Initialisiert das Add-Task-Formular
 * @param {*} options = {}
 * @returns {*}
 */
function initAddTaskForm(options = {}) {
  const state = createAddTaskState(options);
  if (!state.form) return;
  setupAddTaskForm(state, options.onClose);
}

/**
 * Erstellt Add-Task State-Objekt
 * @param {*} options = {}
 * @returns {*}
 */
function createAddTaskState(options = {}) {
  const form = document.getElementById("addTaskForm");
  const state = initAddTaskState(form, options);
  attachAddTaskElements(state);
  return state;
}

/**
 * Initialisiert State mit Standardwerten
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
  };
}

/**
 * Bindet alle notwendigen DOM-Elemente an State
 * @param {*} state
 * @returns {*}
 */
function attachAddTaskElements(state) {
  attachMainInputs(state);
  attachSubtaskInputs(state);
}

/**
 * Bindet Main-Input-Elemente an State
 * @param {*} state
 * @returns {*}
 */
function attachMainInputs(state) {
  state.createBtn = document.getElementById("createBtn");
  state.titleInput = document.getElementById("taskTitle");
  state.dueDateInput = document.getElementById("taskDueDate");
  state.categoryInput = document.getElementById("taskCategoryValue");
  state.categoryDropdown = document.getElementById("categoryDropdown");
  state.categoryToggle = state.categoryDropdown?.querySelector("[data-category-toggle]");
  state.formMsg = document.getElementById("addTaskFormMsg");
}

/**
 * Bindet Subtask-Input-Elemente an State
 * @param {*} state
 * @returns {*}
 */
function attachSubtaskInputs(state) {
  state.subtaskInput = document.getElementById("subtaskInput");
  state.subtaskAddBtn = document.getElementById("subtaskAddBtn");
  state.subtaskList = document.getElementById("subtaskList");
}

/**
 * Setzt das komplette Formular auf
 * @param {*} state
 * @param {*} onClose
 * @returns {*}
 */
function setupAddTaskForm(state, onClose) {
  setDueDateMin(state.dueDateInput);
  wirePrioButtons(state);
  applyEditDefaults(state);
  const resets = initDropdowns(state);
  initSubtasks(state);
  wireCreateButtonState(state);
  wireValidationCleanup(state);
  updateCreateButtonState(state);
  wireClearButton(state, resets);
  wireSubmitHandler(state, onClose);
}

/**
 * Wendet Edit-Defaults an wenn Mode = "edit"
 * @param {*} state
 * @returns {*}
 */
function applyEditDefaults(state) {
  if (state.mode !== "edit" || !state.task) return;
  applyTaskDefaults(state, state.task);
}

/**
 * Initialisiert beide Dropdowns (Kategorie & Assigned)
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
 * Wendet Prio-Button Styles basierend auf State an
 * @param {*} state
 * @returns {*}
 */
function applyPrioButtonStyles(state) {
  state.form.querySelectorAll(".prio-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.prio === state.selectedPrio);
  });
}

/**
 * Boots the add-task page form.
 * @returns {void}
 */
window.addEventListener("DOMContentLoaded", () => {
  initAddTaskForm({
    onClose: () => {
      window.location.href = "board.html";
    },
  });
});
