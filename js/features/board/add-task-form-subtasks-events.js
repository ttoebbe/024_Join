/**
 * Wires subtask controls and renders the list.
 * @param {Object} state
 */
function wireSubtaskAdd(state) {
  if (!state.subtaskAddBtn) return;
  state.subtaskAddBtn.addEventListener("click", () =>
    addSubtaskFromInput(state),
  );
}

/**
 * Wires subtask input handlers.
 * @param {Object} state
 */
function wireSubtaskInput(state) {
  state.subtaskInput.addEventListener("keydown", (e) => {
    handleSubtaskKeydown(e, state);
  });
  state.subtaskInput.addEventListener("input", () => {
    enforceSubtaskMax(state);
    updateSubtaskLimitState(state);
  });
}

/**
 * Wires subtask list handlers.
 * @param {Object} state
 */
function wireSubtaskList(state) {
  wireSubtaskListClick(state);
  wireSubtaskListInput(state);
  wireSubtaskListKeydown(state);
  wireSubtaskListBlur(state);
}

/**
 * Wires click handling on the list.
 * @param {Object} state
 */
function wireSubtaskListClick(state) {
  state.subtaskList.addEventListener("click", (e) => {
    handleSubtaskListClick(e, state);
  });
}

/**
 * Wires input handling on the list.
 * @param {Object} state
 */
function wireSubtaskListInput(state) {
  state.subtaskList.addEventListener("input", (e) => {
    handleSubtaskEditInput(e, state);
  });
}

/**
 * Wires keydown handling on the list.
 * @param {Object} state
 */
function wireSubtaskListKeydown(state) {
  state.subtaskList.addEventListener("keydown", (e) => {
    handleSubtaskEditKeydown(e, state);
  });
}

/**
 * Wires blur handling on the list.
 * @param {Object} state
 */
function wireSubtaskListBlur(state) {
  state.subtaskList.addEventListener(
    "blur",
    (e) => {
      handleSubtaskEditBlur(e, state);
    },
    true,
  );
}

/**
 * Handles a list click event.
 * @param {Event} e
 * @param {Object} state
 */
function handleSubtaskListClick(e, state) {
  const action = getSubtaskActionFromEvent(e);
  if (!action) return;
  handleSubtaskAction(state, action);
}

/**
 * Handles a subtask action.
 * @param {Object} state
 * @param {{ action: string, index: number }} action
 */
function handleSubtaskAction(state, action) {
  if (action.action === "edit") return startSubtaskEdit(state, action.index);
  if (action.action === "delete")
    return removeSubtaskAndRender(state, action.index);
  if (action.action === "done") return commitSubtaskEdit(state, action.index);
}

/**
 * Handles subtask input keydown.
 * @param {KeyboardEvent} e
 * @param {Object} state
 */
function handleSubtaskKeydown(e, state) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  addSubtaskFromInput(state);
}

/**
 * Adds a subtask from the input field.
 * @param {Object} state
 */
function addSubtaskFromInput(state) {
  const value = state.subtaskInput?.value.trim();
  if (!value) return;
  state.selectedSubtasks.push({ title: value, done: false });
  state.subtaskInput.value = "";
  renderSubtasks(state);
}

/**
 * Updates subtask counter state.
 * @param {Object} state
 */
function wireSubtaskCounter(state) {
  enforceSubtaskMax(state);
  updateSubtaskLimitState(state);
}

/**
 * Enforces max length on the input.
 * @param {Object} state
 */
function enforceSubtaskMax(state) {
  const input = state.subtaskInput;
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= SUBTASK_MAX_LENGTH) return;
  input.value = value.slice(0, SUBTASK_MAX_LENGTH);
}

/**
 * Updates validation state for the input.
 * @param {Object} state
 */
function updateSubtaskLimitState(state) {
  const input = state.subtaskInput;
  const value = String(input?.value || "").trim();
  if (!value) return setSubtaskError("");
  if (value.length >= SUBTASK_MAX_LENGTH)
    return setSubtaskError("Subtask is too long (max 30 characters).");
  setSubtaskError("");
}

/**
 * Shows or hides the subtask error.
 * @param {string} message
 */
function setSubtaskError(message) {
  const errorEl = document.getElementById("subtask-error");
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.classList.toggle("is-visible", Boolean(message));
  const input = document.getElementById("subtask-input");
  if (input) input.classList.toggle("input-error", Boolean(message));
}

/**
 * Handles edit input changes.
 * @param {Event} e
 * @param {Object} state
 */
function handleSubtaskEditInput(e, state) {
  if (!isSubtaskEditInput(e.target)) return;
  const value = clampSubtaskValue(e.target.value);
  syncSubtaskInputValue(e.target, value);
  updateEditingValue(state, value);
}

/**
 * Handles edit input keydown.
 * @param {KeyboardEvent} e
 * @param {Object} state
 */
function handleSubtaskEditKeydown(e, state) {
  if (!isSubtaskEditInput(e.target)) return;
  if (e.key === "Enter") return handleSubtaskEnter(state, e);
  if (e.key === "Escape") return cancelSubtaskEdit(state);
}

/**
 * Handles edit input blur.
 * @param {FocusEvent} e
 * @param {Object} state
 */
function handleSubtaskEditBlur(e, state) {
  if (!isSubtaskEditInput(e.target)) return;
  if (isSubtaskActionTarget(e.relatedTarget)) return;
  commitSubtaskEdit(state, getSubtaskIndex(e.target));
}

/**
 * Handles Enter while editing.
 * @param {Object} state
 * @param {KeyboardEvent} e
 */
function handleSubtaskEnter(state, e) {
  e.preventDefault();
  commitSubtaskEdit(state, getSubtaskIndex(e.target));
}

/**
 * Gets a subtask index from a target element.
 * @param {Element} target
 * @returns {number}
 */
function getSubtaskIndex(target) {
  const index = Number(target?.dataset?.index);
  return Number.isNaN(index) ? -1 : index;
}

/**
 * Gets a subtask action from an event.
 * @param {Event} event
 * @returns {{ action: string, index: number }|null}
 */
function getSubtaskActionFromEvent(event) {
  const button = event.target.closest("[data-subtask-action]");
  if (!button) return null;
  const index = Number(button.dataset.index);
  if (Number.isNaN(index)) return null;
  return { action: button.dataset.subtaskAction || "", index };
}

/**
 * Checks whether a target is a subtask action.
 * @param {Element} target
 * @returns {boolean}
 */
function isSubtaskActionTarget(target) {
  return Boolean(target?.closest?.("[data-subtask-action]"));
}

/**
 * Checks whether a target is an edit input.
 * @param {Element} target
 * @returns {boolean}
 */
function isSubtaskEditInput(target) {
  return target?.classList?.contains("subtask-edit-input");
}

/**
 * Clamps a value to the max length.
 * @param {string} value
 * @returns {string}
 */
function clampSubtaskValue(value) {
  return String(value || "").slice(0, SUBTASK_MAX_LENGTH);
}

/**
 * Syncs an input value.
 * @param {HTMLInputElement} input
 * @param {string} value
 */
function syncSubtaskInputValue(input, value) {
  if (!input) return;
  if (input.value === value) return;
  input.value = value;
}

/**
 * Updates the current editing value.
 * @param {Object} state
 * @param {string} value
 */
function updateEditingValue(state, value) {
  state.editingValue = value;
}
