/**
 * @param {*} state
 * @returns {*}
 */
function renderSubtasks(state) {
  if (!state.subtaskList) return;
  resetSubtaskList(state);
  appendSubtaskRows(state);
}

/**
 * @param {*} state
 * @returns {*}
 */
function resetSubtaskList(state) {
  state.subtaskList.innerHTML = "";
}

/**
 * @param {*} state
 * @returns {*}
 */
function appendSubtaskRows(state) {
  state.selectedSubtasks.forEach((subtask, index) => {
    state.subtaskList.appendChild(buildAddTaskSubtaskRow(state, subtask, index));
  });
}

/**
 * @param {*} state
 * @param {*} subtask
 * @param {number} index
 * @returns {HTMLElement}
 */
function buildAddTaskSubtaskRow(state, subtask, index) {
  const row = createSubtaskRow(index);
  row.appendChild(buildSubtaskBullet());
  appendSubtaskContent(row, state, subtask, index);
  row.appendChild(buildSubtaskActions(state, index));
  return row;
}

/**
 * @param {number} index
 * @returns {HTMLElement}
 */
function createSubtaskRow(index) {
  const row = document.createElement("div");
  row.className = "subtask-item";
  row.dataset.index = String(index);
  return row;
}

/**
 * @param {HTMLElement} row
 * @param {*} state
 * @param {*} subtask
 * @param {number} index
 * @returns {*}
 */
function appendSubtaskContent(row, state, subtask, index) {
  if (!isSubtaskEditing(state, index)) return row.appendChild(buildAddTaskSubtaskText(subtask));
  row.classList.add("is-editing");
  row.appendChild(buildSubtaskEditInput(state, subtask, index));
}

/**
 * @returns {HTMLElement}
 */
function buildSubtaskBullet() {
  const bullet = document.createElement("span");
  bullet.className = "subtask-bullet";
  bullet.textContent = "•";
  return bullet;
}

/**
 * @param {*} subtask
 * @returns {HTMLElement}
 */
function buildAddTaskSubtaskText(subtask) {
  const text = document.createElement("span");
  text.className = "subtask-text";
  text.textContent = subtask.title || "Subtask";
  return text;
}

/**
 * @param {*} state
 * @param {*} subtask
 * @param {number} index
 * @returns {HTMLElement}
 */
function buildSubtaskEditInput(state, subtask, index) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "subtask-edit-input";
  input.value = getEditingValue(state, subtask, index);
  input.dataset.index = String(index);
  input.setAttribute("aria-label", "Edit subtask");
  return input;
}

/**
 * @param {*} state
 * @param {number} index
 * @returns {HTMLElement}
 */
function buildSubtaskActions(state, index) {
  const actions = document.createElement("div");
  actions.className = "subtask-actions";
  appendSubtaskActionButtons(actions, isSubtaskEditing(state, index), index);
  return actions;
}

/**
 * @param {HTMLElement} actions
 * @param {boolean} isEditing
 * @param {number} index
 * @returns {*}
 */
function appendSubtaskActionButtons(actions, isEditing, index) {
  getSubtaskActions(isEditing).forEach((config) => {
    actions.appendChild(buildSubtaskActionButton(config, index));
  });
}

/**
 * @param {boolean} isEditing
 * @returns {Array}
 */
function getSubtaskActions(isEditing) {
  if (isEditing) return getSubtaskEditActions();
  return getSubtaskViewActions();
}

/**
 * @returns {Array}
 */
function getSubtaskViewActions() {
  return [
    { action: "edit", icon: "/assets/img/icons/edit.png", label: "Edit subtask" },
    { action: "delete", icon: "/assets/img/icons/delete.png", label: "Delete subtask" },
  ];
}

/**
 * @returns {Array}
 */
function getSubtaskEditActions() {
  return [
    { action: "delete", icon: "/assets/img/icons/delete.png", label: "Delete subtask" },
    { action: "done", icon: "/assets/img/icons/done.png", label: "Save subtask" },
  ];
}

/**
 * @param {{action:string,icon:string,label:string}} config
 * @param {number} index
 * @returns {HTMLButtonElement}
 */
function buildSubtaskActionButton(config, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "subtask-action";
  button.dataset.subtaskAction = config.action;
  button.dataset.index = String(index);
  button.setAttribute("aria-label", config.label);
  button.appendChild(buildSubtaskActionIcon(config));
  return button;
}

/**
 * @param {{icon:string,label:string}} config
 * @returns {HTMLImageElement}
 */
function buildSubtaskActionIcon(config) {
  const icon = document.createElement("img");
  icon.src = config.icon;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

/**
 * @param {*} state
 * @param {number} index
 * @returns {boolean}
 */
function isSubtaskEditing(state, index) {
  return state.editingIndex === index;
}

/**
 * @param {*} state
 * @param {*} subtask
 * @param {number} index
 * @returns {string}
 */
function getEditingValue(state, subtask, index) {
  if (!isSubtaskEditing(state, index)) return subtask.title || "";
  return state.editingValue || subtask.title || "";
}

/**
 * @param {*} event
 * @returns {{action:string,index:number}|null}
 */
function getSubtaskActionFromEvent(event) {
  const button = event.target.closest("[data-subtask-action]");
  if (!button) return null;
  const index = Number(button.dataset.index);
  if (Number.isNaN(index)) return null;
  return { action: button.dataset.subtaskAction || "", index };
}

/**
 * @param {*} target
 * @returns {boolean}
 */
function isSubtaskActionTarget(target) {
  return Boolean(target?.closest?.("[data-subtask-action]"));
}

/**
 * @param {*} target
 * @returns {boolean}
 */
function isSubtaskEditInput(target) {
  return target?.classList?.contains("subtask-edit-input");
}

/**
 * @param {string} value
 * @returns {string}
 */
function clampSubtaskValue(value) {
  return String(value || "").slice(0, SUBTASK_MAX_LENGTH);
}

/**
 * @param {HTMLInputElement} input
 * @param {string} value
 * @returns {*}
 */
function syncSubtaskInputValue(input, value) {
  if (!input) return;
  if (input.value === value) return;
  input.value = value;
}

/**
 * @param {*} state
 * @param {string} value
 * @returns {*}
 */
function updateEditingValue(state, value) {
  state.editingValue = value;
}

/**
 * @param {*} state
 * @param {number} index
 * @returns {*}
 */
function startSubtaskEdit(state, index) {
  const title = getSubtaskTitle(state, index);
  setEditingState(state, index, title);
  renderSubtasks(state);
  focusEditingInput(state, index);
}

/**
 * @param {*} state
 * @param {number} index
 * @returns {*}
 */
function commitSubtaskEdit(state, index) {
  if (index < 0) return;
  const value = normalizeSubtaskValue(state.editingValue);
  if (!value) return removeSubtaskAndRender(state, index);
  updateSubtaskTitle(state, index, value);
  clearEditingState(state);
  renderSubtasks(state);
}

/**
 * @param {*} state
 * @returns {*}
 */
function cancelSubtaskEdit(state) {
  clearEditingState(state);
  renderSubtasks(state);
}

/**
 * @param {*} state
 * @param {number} index
 * @returns {*}
 */
function removeSubtaskAndRender(state, index) {
  removeSubtask(state, index);
  clearEditingState(state);
  renderSubtasks(state);
}

/**
 * @param {*} state
 * @param {number} index
 * @returns {string}
 */
function getSubtaskTitle(state, index) {
  return state.selectedSubtasks[index]?.title || "";
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeSubtaskValue(value) {
  return String(value || "").trim().slice(0, SUBTASK_MAX_LENGTH);
}

/**
 * @param {*} state
 * @param {number} index
 * @param {string} value
 * @returns {*}
 */
function updateSubtaskTitle(state, index, value) {
  state.selectedSubtasks[index].title = value;
}

/**
 * @param {*} state
 * @param {number} index
 * @returns {*}
 */
function removeSubtask(state, index) {
  state.selectedSubtasks.splice(index, 1);
}

/**
 * @param {*} state
 * @param {number} index
 * @param {string} value
 * @returns {*}
 */
function setEditingState(state, index, value) {
  state.editingIndex = index;
  state.editingValue = value;
}

/**
 * @param {*} state
 * @returns {*}
 */
function clearEditingState(state) {
  state.editingIndex = null;
  state.editingValue = "";
}

/**
 * @param {*} state
 * @param {number} index
 * @returns {*}
 */
function focusEditingInput(state, index) {
  const input = state.subtaskList?.querySelector(`.subtask-edit-input[data-index="${index}"]`);
  input?.focus();
  input?.select?.();
}
