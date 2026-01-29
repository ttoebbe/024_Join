/**
 * Clears the subtask list container.
 * @param {Object} state
 */
function resetSubtaskList(state) {
  state.subtaskList.innerHTML = "";
}

/**
 * Appends all subtask rows to the list.
 * @param {Object} state
 */
function appendSubtaskRows(state) {
  state.selectedSubtasks.forEach((subtask, index) => {
    state.subtaskList.appendChild(
      buildAddTaskSubtaskRow(state, subtask, index),
    );
  });
}

/**
 * Builds a single subtask row.
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
 * Creates the subtask row container.
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
 * Appends the subtask text or edit input.
 * @param {HTMLElement} row
 * @param {Object} state
 * @param {Object} subtask
 * @param {number} index
 */
function appendSubtaskContent(row, state, subtask, index) {
  if (!isSubtaskEditing(state, index))
    return row.appendChild(buildAddTaskSubtaskText(subtask));
  row.classList.add("is-editing");
  row.appendChild(buildSubtaskEditInput(state, subtask, index));
}

/**
 * Builds the bullet element.
 * @returns {HTMLElement}
 */
function buildSubtaskBullet() {
  const bullet = document.createElement("span");
  bullet.className = "subtask-bullet";
  bullet.textContent = "•";
  return bullet;
}

/**
 * Builds the subtask text element.
 * @param {Object} subtask
 * @returns {HTMLElement}
 */
function buildAddTaskSubtaskText(subtask) {
  const text = document.createElement("span");
  text.className = "subtask-text";
  text.textContent = subtask.title || "Subtask";
  return text;
}

/**
 * Builds the subtask edit input.
 * @param {Object} state
 * @param {Object} subtask
 * @param {number} index
 * @returns {HTMLInputElement}
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
 * Builds the subtask actions container.
 * @param {Object} state
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
 * Appends action buttons based on edit state.
 * @param {HTMLElement} actions
 * @param {boolean} isEditing
 * @param {number} index
 */
function appendSubtaskActionButtons(actions, isEditing, index) {
  getSubtaskActions(isEditing).forEach((config) => {
    actions.appendChild(buildSubtaskActionButton(config, index));
  });
}

/**
 * Gets subtask actions for the current state.
 * @param {boolean} isEditing
 * @returns {Array}
 */
function getSubtaskActions(isEditing) {
  if (isEditing) return getSubtaskEditActions();
  return getSubtaskViewActions();
}

/**
 * Gets actions for view mode.
 * @returns {Array}
 */
function getSubtaskViewActions() {
  return [
    {
      action: "edit",
      icon: "/assets/img/icons/edit.svg",
      label: "Edit subtask",
    },
    {
      action: "delete",
      icon: "/assets/img/icons/delete.svg",
      label: "Delete subtask",
    },
  ];
}

/**
 * Gets actions for edit mode.
 * @returns {Array}
 */
function getSubtaskEditActions() {
  return [
    {
      action: "delete",
      icon: "/assets/img/icons/delete.svg",
      label: "Delete subtask",
    },
    {
      action: "done",
      icon: "/assets/img/icons/done.svg",
      label: "Save subtask",
    },
  ];
}

/**
 * Builds a subtask action button.
 * @param {Object} config
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
 * Builds a subtask action icon.
 * @param {Object} config
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
 * Checks whether a subtask is in edit mode.
 * @param {Object} state
 * @param {number} index
 * @returns {boolean}
 */
function isSubtaskEditing(state, index) {
  return state.editingIndex === index;
}

/**
 * Gets the current edit value for a subtask.
 * @param {Object} state
 * @param {Object} subtask
 * @param {number} index
 * @returns {string}
 */
function getEditingValue(state, subtask, index) {
  if (!isSubtaskEditing(state, index)) return subtask.title || "";
  return state.editingValue || subtask.title || "";
}
