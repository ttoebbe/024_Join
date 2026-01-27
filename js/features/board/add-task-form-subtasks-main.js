/**
 * @param {*} state
 * @returns {*}
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
 * @param {*} state
 * @returns {boolean}
 */
function canInitSubtasks(state) {
  return Boolean(state.subtaskInput && state.subtaskList);
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireSubtaskAdd(state) {
  if (!state.subtaskAddBtn) return;
  state.subtaskAddBtn.addEventListener("click", () => addSubtaskFromInput(state));
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireSubtaskInput(state) {
  state.subtaskInput.addEventListener("keydown", (e) => {
    handleSubtaskKeydown(e, state);
  });
  state.subtaskInput.addEventListener("input", () => {
    enforceSubtaskMax(state);
    updateSubtaskLimitState(state);
    updateSubtaskCounter(state);
  });
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireSubtaskList(state) {
  wireSubtaskListClick(state);
  wireSubtaskListInput(state);
  wireSubtaskListKeydown(state);
  wireSubtaskListBlur(state);
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireSubtaskListClick(state) {
  state.subtaskList.addEventListener("click", (e) => {
    handleSubtaskListClick(e, state);
  });
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireSubtaskListInput(state) {
  state.subtaskList.addEventListener("input", (e) => {
    handleSubtaskEditInput(e, state);
  });
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireSubtaskListKeydown(state) {
  state.subtaskList.addEventListener("keydown", (e) => {
    handleSubtaskEditKeydown(e, state);
  });
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireSubtaskListBlur(state) {
  state.subtaskList.addEventListener("blur", (e) => {
    handleSubtaskEditBlur(e, state);
  }, true);
}

/**
 * @param {*} e
 * @param {*} state
 * @returns {*}
 */
function handleSubtaskListClick(e, state) {
  const action = getSubtaskActionFromEvent(e);
  if (!action) return;
  handleSubtaskAction(state, action);
}

/**
 * @param {*} state
 * @param {{action:string,index:number}} action
 * @returns {*}
 */
function handleSubtaskAction(state, action) {
  if (action.action === "edit") return startSubtaskEdit(state, action.index);
  if (action.action === "delete") return removeSubtaskAndRender(state, action.index);
  if (action.action === "done") return commitSubtaskEdit(state, action.index);
}

/**
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
 * @param {*} state
 * @returns {*}
 */
function addSubtaskFromInput(state) {
  const value = state.subtaskInput?.value.trim();
  if (!value) return;
  state.selectedSubtasks.push({ title: value, done: false });
  state.subtaskInput.value = "";
  updateSubtaskCounter(state);
  renderSubtasks(state);
}

const SUBTASK_MAX_LENGTH = 30;

/**
 * @param {*} state
 * @returns {*}
 */
function wireSubtaskCounter(state) {
  enforceSubtaskMax(state);
  updateSubtaskLimitState(state);
  updateSubtaskCounter(state);
}

/**
 * @param {*} state
 * @returns {*}
 */
function updateSubtaskCounter(state) {
  const counter = document.getElementById("subtask-counter");
  if (!counter) return;
  const length = state.subtaskInput?.value.length || 0;
  counter.textContent = `${length}/${SUBTASK_MAX_LENGTH}`;
}

/**
 * @param {*} state
 * @returns {*}
 */
function enforceSubtaskMax(state) {
  const input = state.subtaskInput;
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= SUBTASK_MAX_LENGTH) return;
  input.value = value.slice(0, SUBTASK_MAX_LENGTH);
}

/**
 * @param {*} state
 * @returns {*}
 */
function updateSubtaskLimitState(state) {
  const input = state.subtaskInput;
  const value = String(input?.value || "").trim();
  if (!value) return setSubtaskError("");
  if (value.length >= SUBTASK_MAX_LENGTH) return setSubtaskError("Subtask is too long (max 30 characters).");
  setSubtaskError("");
}

/**
 * @param {string} message
 * @returns {*}
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
 * @param {*} e
 * @param {*} state
 * @returns {*}
 */
function handleSubtaskEditInput(e, state) {
  if (!isSubtaskEditInput(e.target)) return;
  const value = clampSubtaskValue(e.target.value);
  syncSubtaskInputValue(e.target, value);
  updateEditingValue(state, value);
}

/**
 * @param {*} e
 * @param {*} state
 * @returns {*}
 */
function handleSubtaskEditKeydown(e, state) {
  if (!isSubtaskEditInput(e.target)) return;
  if (e.key === "Enter") return handleSubtaskEnter(state, e);
  if (e.key === "Escape") return cancelSubtaskEdit(state);
}

/**
 * @param {*} e
 * @param {*} state
 * @returns {*}
 */
function handleSubtaskEditBlur(e, state) {
  if (!isSubtaskEditInput(e.target)) return;
  if (isSubtaskActionTarget(e.relatedTarget)) return;
  commitSubtaskEdit(state, getSubtaskIndex(e.target));
}

/**
 * @param {*} state
 * @param {KeyboardEvent} e
 * @returns {*}
 */
function handleSubtaskEnter(state, e) {
  e.preventDefault();
  commitSubtaskEdit(state, getSubtaskIndex(e.target));
}

/**
 * @param {HTMLElement} target
 * @returns {number}
 */
function getSubtaskIndex(target) {
  const index = Number(target?.dataset?.index);
  return Number.isNaN(index) ? -1 : index;
}

/**
 * @param {*} raw
 * @returns {*}
 */
function normalizeSubtasksFromTask(raw) {
  if (!Array.isArray(raw)) return [];
  const normalized = [];
  for (const item of raw) {
    const value = normalizeSubtaskItem(item);
    if (value && value.title) normalized.push(value);
  }
  return normalized;
}

/**
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
 * @param {*} item
 * @returns {*}
 */
function buildSubtaskValue(item) {
  return {
    title: item.title || item.name || item.text || "",
    done: Boolean(item.done || item.completed || item.isDone),
  };
}
