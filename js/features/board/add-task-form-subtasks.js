/**
 * @param {*} state
 * @returns {*}
 */
function initSubtasks(state) {
  if (!state.subtaskInput || !state.subtaskAddBtn || !state.subtaskList) return;
  state.subtaskAddBtn.addEventListener("click", () => {
    addSubtaskFromInput(state);
  });
  state.subtaskInput.addEventListener("keydown", (e) => {
    handleSubtaskKeydown(e, state);
  });
  state.subtaskList.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".subtask-remove");
    if (!removeBtn) return;
    const index = Number(removeBtn.dataset.index);
    if (Number.isNaN(index)) return;
    removeSubtask(state, index);
  });
  renderSubtasks(state);
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
