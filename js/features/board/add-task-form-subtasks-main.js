const SUBTASK_MAX_LENGTH = 30;

function renderSubtasks(state) {
  if (!state.subtaskList) return;
  resetSubtaskList(state);
  appendSubtaskRows(state);
}

function resetSubtaskList(state) {
  state.subtaskList.innerHTML = "";
}

function appendSubtaskRows(state) {
  state.selectedSubtasks.forEach((subtask, index) => {
    state.subtaskList.appendChild(buildAddTaskSubtaskRow(state, subtask, index));
  });
}

function buildAddTaskSubtaskRow(state, subtask, index) {
  const row = createSubtaskRow(index);
  row.appendChild(buildSubtaskBullet());
  appendSubtaskContent(row, state, subtask, index);
  row.appendChild(buildSubtaskActions(state, index));
  return row;
}

function createSubtaskRow(index) {
  const row = document.createElement("div");
  row.className = "subtask-item";
  row.dataset.index = String(index);
  return row;
}

function appendSubtaskContent(row, state, subtask, index) {
  if (!isSubtaskEditing(state, index)) return row.appendChild(buildAddTaskSubtaskText(subtask));
  row.classList.add("is-editing");
  row.appendChild(buildSubtaskEditInput(state, subtask, index));
}

function buildSubtaskBullet() {
  const bullet = document.createElement("span");
  bullet.className = "subtask-bullet";
  bullet.textContent = "•";
  return bullet;
}

function buildAddTaskSubtaskText(subtask) {
  const text = document.createElement("span");
  text.className = "subtask-text";
  text.textContent = subtask.title || "Subtask";
  return text;
}

function buildSubtaskEditInput(state, subtask, index) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "subtask-edit-input";
  input.value = getEditingValue(state, subtask, index);
  input.dataset.index = String(index);
  input.setAttribute("aria-label", "Edit subtask");
  return input;
}

function buildSubtaskActions(state, index) {
  const actions = document.createElement("div");
  actions.className = "subtask-actions";
  appendSubtaskActionButtons(actions, isSubtaskEditing(state, index), index);
  return actions;
}

function appendSubtaskActionButtons(actions, isEditing, index) {
  getSubtaskActions(isEditing).forEach((config) => {
    actions.appendChild(buildSubtaskActionButton(config, index));
  });
}

function getSubtaskActions(isEditing) {
  if (isEditing) return getSubtaskEditActions();
  return getSubtaskViewActions();
}

function getSubtaskViewActions() {
  return [
    { action: "edit", icon: "/assets/img/icons/edit.png", label: "Edit subtask" },
    { action: "delete", icon: "/assets/img/icons/delete.png", label: "Delete subtask" },
  ];
}

function getSubtaskEditActions() {
  return [
    { action: "delete", icon: "/assets/img/icons/delete.png", label: "Delete subtask" },
    { action: "done", icon: "/assets/img/icons/done.png", label: "Save subtask" },
  ];
}

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

function buildSubtaskActionIcon(config) {
  const icon = document.createElement("img");
  icon.src = config.icon;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function isSubtaskEditing(state, index) {
  return state.editingIndex === index;
}

function getEditingValue(state, subtask, index) {
  if (!isSubtaskEditing(state, index)) return subtask.title || "";
  return state.editingValue || subtask.title || "";
}

function getSubtaskActionFromEvent(event) {
  const button = event.target.closest("[data-subtask-action]");
  if (!button) return null;
  const index = Number(button.dataset.index);
  if (Number.isNaN(index)) return null;
  return { action: button.dataset.subtaskAction || "", index };
}

function isSubtaskActionTarget(target) {
  return Boolean(target?.closest?.("[data-subtask-action]"));
}

function isSubtaskEditInput(target) {
  return target?.classList?.contains("subtask-edit-input");
}

function clampSubtaskValue(value) {
  return String(value || "").slice(0, SUBTASK_MAX_LENGTH);
}

function syncSubtaskInputValue(input, value) {
  if (!input) return;
  if (input.value === value) return;
  input.value = value;
}

function updateEditingValue(state, value) {
  state.editingValue = value;
}

function startSubtaskEdit(state, index) {
  const title = getSubtaskTitle(state, index);
  setEditingState(state, index, title);
  renderSubtasks(state);
  focusEditingInput(state, index);
}

function commitSubtaskEdit(state, index) {
  if (index < 0) return;
  const value = normalizeSubtaskValue(state.editingValue);
  if (!value) return removeSubtaskAndRender(state, index);
  updateSubtaskTitle(state, index, value);
  clearEditingState(state);
  renderSubtasks(state);
}

function cancelSubtaskEdit(state) {
  clearEditingState(state);
  renderSubtasks(state);
}

function removeSubtaskAndRender(state, index) {
  removeSubtask(state, index);
  clearEditingState(state);
  renderSubtasks(state);
}

function getSubtaskTitle(state, index) {
  return state.selectedSubtasks[index]?.title || "";
}

function normalizeSubtaskValue(value) {
  return String(value || "").trim().slice(0, SUBTASK_MAX_LENGTH);
}

function updateSubtaskTitle(state, index, value) {
  state.selectedSubtasks[index].title = value;
}

function removeSubtask(state, index) {
  state.selectedSubtasks.splice(index, 1);
}

function setEditingState(state, index, value) {
  state.editingIndex = index;
  state.editingValue = value;
}

function clearEditingState(state) {
  state.editingIndex = null;
  state.editingValue = "";
}

function focusEditingInput(state, index) {
  const input = state.subtaskList?.querySelector(`.subtask-edit-input[data-index="${index}"]`);
  input?.focus();
  input?.select?.();
}

function initSubtasks(state) {
  if (!canInitSubtasks(state)) return;
  wireSubtaskAdd(state);
  wireSubtaskInput(state);
  wireSubtaskList(state);
  wireSubtaskCounter(state);
  renderSubtasks(state);
}

function canInitSubtasks(state) {
  return Boolean(state.subtaskInput && state.subtaskList);
}

function wireSubtaskAdd(state) {
  if (!state.subtaskAddBtn) return;
  state.subtaskAddBtn.addEventListener("click", () => addSubtaskFromInput(state));
}

function wireSubtaskInput(state) {
  state.subtaskInput.addEventListener("keydown", (e) => {
    handleSubtaskKeydown(e, state);
  });
  state.subtaskInput.addEventListener("input", () => {
    enforceSubtaskMax(state);
    updateSubtaskLimitState(state);
  });
}

function wireSubtaskList(state) {
  wireSubtaskListClick(state);
  wireSubtaskListInput(state);
  wireSubtaskListKeydown(state);
  wireSubtaskListBlur(state);
}

function wireSubtaskListClick(state) {
  state.subtaskList.addEventListener("click", (e) => {
    handleSubtaskListClick(e, state);
  });
}

function wireSubtaskListInput(state) {
  state.subtaskList.addEventListener("input", (e) => {
    handleSubtaskEditInput(e, state);
  });
}

function wireSubtaskListKeydown(state) {
  state.subtaskList.addEventListener("keydown", (e) => {
    handleSubtaskEditKeydown(e, state);
  });
}

function wireSubtaskListBlur(state) {
  state.subtaskList.addEventListener("blur", (e) => {
    handleSubtaskEditBlur(e, state);
  }, true);
}

function handleSubtaskListClick(e, state) {
  const action = getSubtaskActionFromEvent(e);
  if (!action) return;
  handleSubtaskAction(state, action);
}

function handleSubtaskAction(state, action) {
  if (action.action === "edit") return startSubtaskEdit(state, action.index);
  if (action.action === "delete") return removeSubtaskAndRender(state, action.index);
  if (action.action === "done") return commitSubtaskEdit(state, action.index);
}

function handleSubtaskKeydown(e, state) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  addSubtaskFromInput(state);
}

function addSubtaskFromInput(state) {
  const value = state.subtaskInput?.value.trim();
  if (!value) return;
  state.selectedSubtasks.push({ title: value, done: false });
  state.subtaskInput.value = "";
  renderSubtasks(state);
}

function wireSubtaskCounter(state) {
  enforceSubtaskMax(state);
  updateSubtaskLimitState(state);
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
  const input = document.getElementById("subtask-input");
  if (input) input.classList.toggle("input-error", Boolean(message));
}

function handleSubtaskEditInput(e, state) {
  if (!isSubtaskEditInput(e.target)) return;
  const value = clampSubtaskValue(e.target.value);
  syncSubtaskInputValue(e.target, value);
  updateEditingValue(state, value);
}

function handleSubtaskEditKeydown(e, state) {
  if (!isSubtaskEditInput(e.target)) return;
  if (e.key === "Enter") return handleSubtaskEnter(state, e);
  if (e.key === "Escape") return cancelSubtaskEdit(state);
}

function handleSubtaskEditBlur(e, state) {
  if (!isSubtaskEditInput(e.target)) return;
  if (isSubtaskActionTarget(e.relatedTarget)) return;
  commitSubtaskEdit(state, getSubtaskIndex(e.target));
}

function handleSubtaskEnter(state, e) {
  e.preventDefault();
  commitSubtaskEdit(state, getSubtaskIndex(e.target));
}

function getSubtaskIndex(target) {
  const index = Number(target?.dataset?.index);
  return Number.isNaN(index) ? -1 : index;
}

function normalizeSubtasksFromTask(raw) {
  if (!Array.isArray(raw)) return [];
  const normalized = [];
  for (const item of raw) {
    const value = normalizeSubtaskItem(item);
    if (value && value.title) normalized.push(value);
  }
  return normalized;
}

function normalizeSubtaskItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { title: item, done: false };
  if (typeof item === "object") return buildSubtaskValue(item);
  return null;
}

function buildSubtaskValue(item) {
  return {
    title: item.title || item.name || item.text || "",
    done: Boolean(item.done || item.completed || item.isDone),
  };
}
