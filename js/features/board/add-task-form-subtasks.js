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

function canInitSubtasks(state) {
  return Boolean(state.subtaskInput && state.subtaskAddBtn && state.subtaskList);
}

function wireSubtaskAdd(state) {
  state.subtaskAddBtn.addEventListener("click", () => addSubtaskFromInput(state));
}

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

function wireSubtaskList(state) {
  state.subtaskList.addEventListener("click", (e) => {
    handleSubtaskListClick(e, state);
  });
  state.subtaskList.addEventListener("keydown", (e) => {
    handleSubtaskEditKeydown(e, state);
  });
  state.subtaskList.addEventListener("focusin", (e) => {
    handleSubtaskFocus(e);
  });
  state.subtaskList.addEventListener(
    "blur",
    (e) => handleSubtaskBlur(e, state),
    true
  );
}

function handleSubtaskListClick(e, state) {
  if (handleSubtaskRemoveClick(e, state)) return;
}
function handleSubtaskRemoveClick(e, state) {
  const removeBtn = e.target.closest(".subtask-remove");
  if (!removeBtn) return false;
  const index = Number(removeBtn.dataset.index);
  if (Number.isNaN(index)) return true;
  removeSubtask(state, index);
  return true;
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

/**
 * @param {*} state
 * @returns {*}
 */
function renderSubtasks(state) {
  if (!state.subtaskList) return;
  state.subtaskList.innerHTML = "";
  state.selectedSubtasks.forEach((subtask, index) => {
    state.subtaskList.appendChild(addTaskBuildSubtaskRow(state, subtask, index));
  });
}

/**
 * @param {*} state
 * @param {*} subtask
 * @param {*} index
 * @returns {*}
 */
function addTaskBuildSubtaskRow(state, subtask, index) {
  const row = document.createElement("div");
  row.className = "subtask-item";
  row.dataset.index = String(index);
  row.appendChild(addTaskBuildSubtaskText(subtask));
  row.appendChild(addTaskBuildRemoveSubtaskButton(state, index));
  return row;
}

/**
 * @param {*} subtask
 * @returns {*}
 */
function addTaskBuildSubtaskText(subtask) {
  const text = document.createElement("span");
  text.className = "subtask-text";
  text.contentEditable = "true";
  text.spellcheck = false;
  text.textContent = subtask.title || "Subtask";
  return text;
}

/**
 * @param {*} state
 * @param {*} index
 * @returns {*}
 */
function addTaskBuildRemoveSubtaskButton(state, index) {
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "subtask-remove";
  removeBtn.textContent = "x";
  removeBtn.dataset.index = String(index);
  return removeBtn;
}

/**
 * @param {*} state
 * @param {*} index
 * @returns {*}
 */
function removeSubtask(state, index) {
  state.selectedSubtasks.splice(index, 1);
  renderSubtasks(state);
}

const SUBTASK_MAX_LENGTH = 30;

function wireSubtaskCounter(state) {
  enforceSubtaskMax(state);
  updateSubtaskLimitState(state);
  updateSubtaskCounter(state);
}

function updateSubtaskCounter(state) {
  const counter = document.getElementById("subtask-counter");
  if (!counter) return;
  const length = state.subtaskInput?.value.length || 0;
  counter.textContent = `${length}/${SUBTASK_MAX_LENGTH}`;
}

function enforceSubtaskMax(state) {
  const input = state.subtaskInput;
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= SUBTASK_MAX_LENGTH) return;
  input.value = value.slice(0, SUBTASK_MAX_LENGTH);
}

function updateSubtaskLimitState(state) {
  const input = state.subtaskInput;
  const value = String(input?.value || "").trim();
  if (!value) return setSubtaskError("");
  if (value.length >= SUBTASK_MAX_LENGTH) return setSubtaskError("Subtask is too long (max 30 characters).");
  setSubtaskError("");
}

function setSubtaskError(message) {
  const errorEl = document.getElementById("subtask-error");
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.classList.toggle("is-visible", Boolean(message));
  const input = document.getElementById("subtaskInput");
  if (input) input.classList.toggle("input-error", Boolean(message));
}

function handleSubtaskEditKeydown(e) {
  if (!e.target?.classList?.contains("subtask-text")) return;
  if (e.key === "Enter") {
    e.preventDefault();
    e.target.blur();
  }
  if (e.key === "Escape") revertSubtaskEdit(e.target);
}

function handleSubtaskFocus(e) {
  if (!e.target?.classList?.contains("subtask-text")) return;
  e.target.dataset.original = e.target.textContent || "";
}

function handleSubtaskBlur(e, state) {
  if (!e.target?.classList?.contains("subtask-text")) return;
  const index = getSubtaskIndexFromTarget(e.target);
  if (index === null) return;
  updateSubtaskTitle(state, index, e.target);
}

function getSubtaskIndexFromTarget(target) {
  const row = target.closest(".subtask-item");
  if (!row) return null;
  const index = Number(row.dataset.index);
  return Number.isNaN(index) ? null : index;
}

function updateSubtaskTitle(state, index, target) {
  const value = (target.textContent || "").trim() || "Subtask";
  state.selectedSubtasks[index].title = value;
  target.textContent = value;
}

function revertSubtaskEdit(target) {
  const original = target.dataset.original || target.textContent || "";
  target.textContent = original;
  target.blur();
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
