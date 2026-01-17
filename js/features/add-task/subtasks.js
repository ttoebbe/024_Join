/**
 * Initialisiert Subtasks-Handling (Input, Add-Button, Rendering)
 * @param {*} state
 * @returns {*}
 */
function initSubtasks(state) {
  if (!state.subtaskInput || !state.subtaskAddBtn || !state.subtaskList) return;
  state.subtaskAddBtn.addEventListener("click", () => addSubtaskFromInput(state));
  state.subtaskInput.addEventListener("keydown", (e) => handleSubtaskKeydown(e, state));
  renderSubtasks(state);
}

/**
 * Behandelt Enter-Key im Subtask-Input
 * @param {*} e
 * @param {*} state
 * @returns {*}
 */
function handleSubtaskKeydown(e, state) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  addSubtaskFromInput(state);
}

/**
 * Fügt Subtask aus Input-Feld hinzu
 * @param {*} state
 * @returns {*}
 */
function addSubtaskFromInput(state) {
  const value = state.subtaskInput?.value.trim();
  if (!value) return;
  state.selectedSubtasks.push({ title: value, done: false });
  state.subtaskInput.value = "";
  renderSubtasks(state);
}

/**
 * Rendert alle Subtasks als Liste
 * @param {*} state
 * @returns {*}
 */
function renderSubtasks(state) {
  if (!state.subtaskList) return;
  state.subtaskList.innerHTML = "";
  state.selectedSubtasks.forEach((subtask, index) => {
    state.subtaskList.appendChild(buildSubtaskRow(state, subtask, index));
  });
}

/**
 * Erstellt ein Subtask-List-Item
 * @param {*} state
 * @param {*} subtask
 * @param {*} index
 * @returns {*}
 */
function buildSubtaskRow(state, subtask, index) {
  const row = document.createElement("div");
  row.className = "subtask-item";
  row.appendChild(buildSubtaskText(subtask));
  row.appendChild(buildRemoveSubtaskButton(state, index));
  return row;
}

/**
 * Erstellt Text-Element für Subtask
 * @param {*} subtask
 * @returns {*}
 */
function buildSubtaskText(subtask) {
  const text = document.createElement("span");
  text.textContent = subtask.title || "Subtask";
  return text;
}

/**
 * Erstellt Delete-Button für Subtask
 * @param {*} state
 * @param {*} index
 * @returns {*}
 */
function buildRemoveSubtaskButton(state, index) {
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "subtask-remove";
  removeBtn.textContent = "x";
  removeBtn.addEventListener("click", () => removeSubtask(state, index));
  return removeBtn;
}

/**
 * Entfernt Subtask aus Liste
 * @param {*} state
 * @param {*} index
 * @returns {*}
 */
function removeSubtask(state, index) {
  state.selectedSubtasks.splice(index, 1);
  renderSubtasks(state);
}
