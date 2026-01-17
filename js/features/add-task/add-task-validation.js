/**
 * Validiert das Task-Formular und gibt validierte Werte zurück
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
 * Liest alle Task-Formulardaten aus
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
 * Prüft Formulardaten auf Validierungsfehler
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
 * Zeigt Validierungsfehler in der UI an
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
 * Setzt Fehlermeldung im Formular
 * @param {*} state
 * @param {*} message
 * @returns {*}
 */
function setAddTaskFormMsg(state, message) {
  if (!state.formMsg) return;
  state.formMsg.textContent = message || "";
}

/**
 * Markiert fehlende Felder mit Error-Klasse
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
 * Fügt Error-Klasse zu Element hinzu
 * @param {*} element
 * @returns {*}
 */
function addInputError(element) {
  if (element) element.classList.add("input-error");
}

/**
 * Entfernt alle Fehlerindikatoren aus dem Formular
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
 * Entfernt Error-Klasse von Element
 * @param {*} element
 * @returns {*}
 */
function clearInputError(element) {
  if (element) element.classList.remove("input-error");
}

/**
 * Registriert Input-Events zum Löschen von Validierungsfehlern
 * @param {*} state
 * @returns {*}
 */
function wireValidationCleanup(state) {
  state.form.addEventListener("input", () => clearAddTaskErrors(state));
  state.form.addEventListener("change", () => clearAddTaskErrors(state));
}
