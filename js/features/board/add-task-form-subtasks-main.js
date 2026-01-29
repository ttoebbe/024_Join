const SUBTASK_MAX_LENGTH = 30;

/**
 * Renders the current subtasks list.
 * @param {Object} state
 */
function renderSubtasks(state) {
  if (!state.subtaskList) return;
  resetSubtaskList(state);
  appendSubtaskRows(state);
}

/**
 * Initializes subtask UI wiring.
 * @param {Object} state
 */
function initSubtasks(state) {
  if (!canInitSubtasks(state)) return;
  wireSubtaskAdd(state);
  wireSubtaskInput(state);
  wireSubtaskList(state);
  wireSubtaskCounter(state);
  renderSubtasks(state);
}

/**
 * Checks whether subtask UI can be initialized.
 * @param {Object} state
 * @returns {boolean}
 */
function canInitSubtasks(state) {
  return Boolean(state.subtaskInput && state.subtaskList);
}
