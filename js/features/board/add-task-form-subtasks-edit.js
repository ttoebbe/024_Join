/**
 * Starts editing a subtask.
 * @param {Object} state
 * @param {number} index
 */
function startSubtaskEdit(state, index) {
  const title = getSubtaskTitle(state, index);
  setEditingState(state, index, title);
  renderSubtasks(state);
  focusEditingInput(state, index);
}

/**
 * Commits the current subtask edit.
 * @param {Object} state
 * @param {number} index
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
 * Cancels subtask editing.
 * @param {Object} state
 */
function cancelSubtaskEdit(state) {
  clearEditingState(state);
  renderSubtasks(state);
}

/**
 * Removes a subtask and re-renders.
 * @param {Object} state
 * @param {number} index
 */
function removeSubtaskAndRender(state, index) {
  removeSubtask(state, index);
  clearEditingState(state);
  renderSubtasks(state);
}

/**
 * Gets a subtask title by index.
 * @param {Object} state
 * @param {number} index
 * @returns {string}
 */
function getSubtaskTitle(state, index) {
  return state.selectedSubtasks[index]?.title || "";
}

/**
 * Normalizes a subtask value.
 * @param {string} value
 * @returns {string}
 */
function normalizeSubtaskValue(value) {
  return String(value || "")
    .trim()
    .slice(0, SUBTASK_MAX_LENGTH);
}

/**
 * Updates a subtask title.
 * @param {Object} state
 * @param {number} index
 * @param {string} value
 */
function updateSubtaskTitle(state, index, value) {
  state.selectedSubtasks[index].title = value;
}

/**
 * Removes a subtask from the list.
 * @param {Object} state
 * @param {number} index
 */
function removeSubtask(state, index) {
  state.selectedSubtasks.splice(index, 1);
}

/**
 * Sets the current editing state.
 * @param {Object} state
 * @param {number} index
 * @param {string} value
 */
function setEditingState(state, index, value) {
  state.editingIndex = index;
  state.editingValue = value;
}

/**
 * Clears the current editing state.
 * @param {Object} state
 */
function clearEditingState(state) {
  state.editingIndex = null;
  state.editingValue = "";
}

/**
 * Focuses the active edit input.
 * @param {Object} state
 * @param {number} index
 */
function focusEditingInput(state, index) {
  const input = state.subtaskList?.querySelector(
    `.subtask-edit-input[data-index="${index}"]`,
  );
  input?.focus();
  input?.select?.();
}
