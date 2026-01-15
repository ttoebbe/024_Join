/**
 * @param {*} options = {}
 * @returns {*}
 */
function initAddTaskForm(options = {}) {
  const state = createAddTaskState(options);
  if (!state.form) return;
  setupAddTaskForm(state, options.onClose);
}

/**
 * @param {*} options = {}
 * @returns {*}
 */
function createAddTaskState(options = {}) {
  const form = document.getElementById("addTaskForm");
  const state = initAddTaskState(form, options);
  attachAddTaskElements(state);
  return state;
}

/**
 * @param {*} form
 * @param {*} options
 * @returns {*}
 */
function initAddTaskState(form, options) {
  return {
    form,
    mode: options.mode || "create",
    task: options.task,
    selectedPrio: "medium",
    selectedCategory: "",
    selectedAssigned: [],
    selectedSubtasks: [],
  };
}

/**
 * @param {*} state
 * @returns {*}
 */
function attachAddTaskElements(state) {
  attachMainInputs(state);
  attachSubtaskInputs(state);
}

/**
 * @param {*} state
 * @returns {*}
 */
function attachMainInputs(state) {
  state.createBtn = document.getElementById("createBtn");
  state.titleInput = document.getElementById("taskTitle");
  state.dueDateInput = document.getElementById("taskDueDate");
  state.categoryInput = document.getElementById("taskCategoryValue");
}

/**
 * @param {*} state
 * @returns {*}
 */
function attachSubtaskInputs(state) {
  state.subtaskInput = document.getElementById("subtaskInput");
  state.subtaskAddBtn = document.getElementById("subtaskAddBtn");
  state.subtaskList = document.getElementById("subtaskList");
}

/**
 * @param {*} state
 * @param {*} onClose
 * @returns {*}
 */
function setupAddTaskForm(state, onClose) {
  setDueDateMin(state.dueDateInput);
  wirePrioButtons(state);
  applyEditDefaults(state);
  const resets = initDropdowns(state);
  initSubtasks(state);
  wireCreateButtonState(state);
  updateCreateButtonState(state);
  wireClearButton(state, resets);
  wireSubmitHandler(state, onClose);
}

/**
 * @param {*} state
 * @returns {*}
 */
function wirePrioButtons(state) {
  state.form.querySelectorAll(".prio-btn").forEach((btn) => {
    btn.addEventListener("click", () => handlePrioButton(state, btn));
  });
}

/**
 * @param {*} state
 * @param {*} btn
 * @returns {*}
 */
function handlePrioButton(state, btn) {
  clearPrioActive(state);
  btn.classList.add("is-active");
  state.selectedPrio = btn.dataset.prio;
}

/**
 * @param {*} state
 * @returns {*}
 */
function clearPrioActive(state) {
  state.form.querySelectorAll(".prio-btn").forEach((b) => b.classList.remove("is-active"));
}

/**
 * @param {*} state
 * @returns {*}
 */
function applyEditDefaults(state) {
  if (state.mode !== "edit" || !state.task) return;
  applyTaskDefaults(state, state.task);
}

/**
 * @param {*} state
 * @returns {*}
 */
function initDropdowns(state) {
  return {
    resetCategoryUi: initCategoryDropdown(state),
    resetAssignedUi: initAssignedDropdown(state),
  };
}

/**
 * @param {*} state
 * @param {*} resets
 * @returns {*}
 */
function wireClearButton(state, resets) {
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    clearAddTaskForm(state, resets);
  });
}

/**
 * @param {*} state
 * @param {*} resets
 * @returns {*}
 */
function clearAddTaskForm(state, resets) {
  resetForm(state);
  resetStatusPreset();
  resetSelectionState(state);
  clearCategoryInput(state);
  resets.resetCategoryUi?.();
  resets.resetAssignedUi?.();
  renderSubtasks(state);
  updateCreateButtonState(state);
}

/**
 * @param {*} state
 * @returns {*}
 */
function resetForm(state) {
  state.form.reset();
}

/**
 * @returns {*}
 */
function resetStatusPreset() {
  const statusField = document.getElementById("taskStatusPreset");
  if (statusField) statusField.value = statusField.value || "todo";
}

/**
 * @param {*} state
 * @returns {*}
 */
function resetSelectionState(state) {
  state.selectedCategory = "";
  state.selectedAssigned = [];
  state.selectedSubtasks = [];
}

/**
 * @param {*} state
 * @returns {*}
 */
function clearCategoryInput(state) {
  if (state.categoryInput) state.categoryInput.value = "";
}

/**
 * @param {*} state
 * @param {*} onClose
 * @returns {*}
 */
function wireSubmitHandler(state, onClose) {
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSubmit(state, onClose);
  });
}

/**
 * @param {*} state
 * @param {*} onClose
 * @returns {*}
 */
async function handleSubmit(state, onClose) {
  const values = getTaskFormValues(state);
  if (!values) return;
  if (state.mode === "edit" && state.task?.id) {
    await updateExistingTask(state, values);
  } else {
    await createNewTask(state, values);
  }
  await refreshBoardIfNeeded();
  onClose?.();
}

/**
 * @param {*} state
 * @returns {*}
 */
function getTaskFormValues(state) {
  const title = document.getElementById("taskTitle")?.value.trim();
  const dueDate = document.getElementById("taskDueDate")?.value.trim();
  const category = getSelectedCategoryValue(state);
  const status = document.getElementById("taskStatusPreset")?.value || "todo";
  const description = document.getElementById("taskDescription")?.value.trim() || "";
  if (!title || !dueDate || !category) return showRequiredAlert();
  return { title, description, status, category, dueDate };
}

/**
 * @returns {*}
 */
function showRequiredAlert() {
  alert("Bitte Title, Due date und Category ausfüllen.");
  return null;
}

/**
 * @param {*} state
 * @param {*} values
 * @returns {*}
 */
async function updateExistingTask(state, values) {
  const updatedTask = buildTaskPayload(state, values, state.task);
  await TaskService.update(state.task.id, updatedTask);
}

/**
 * @param {*} state
 * @param {*} values
 * @returns {*}
 */
async function createNewTask(state, values) {
  const newTask = buildTaskPayload(state, values, { id: generateTaskId() });
  await TaskService.create(newTask);
}

/**
 * @param {*} state
 * @param {*} values
 * @param {*} base
 * @returns {*}
 */
function buildTaskPayload(state, values, base) {
  return {
    ...base,
    title: values.title,
    description: values.description,
    status: values.status,
    category: values.category,
    prio: state.selectedPrio,
    assigned: state.selectedAssigned,
    dueDate: values.dueDate,
    subtasks: state.selectedSubtasks,
  };
}

/**
 * @returns {*}
 */
async function refreshBoardIfNeeded() {
  if (typeof loadTasks !== "function") return;
  await loadTasks();
  if (typeof renderBoard === "function") renderBoard();
}

/**
 * @param {*} state
 * @returns {*}
 */
function initCategoryDropdown(state) {
  const dropdown = document.getElementById("categoryDropdown");
  if (!dropdown) return null;
  const parts = getCategoryDropdownParts(dropdown);
  wireCategoryToggle(parts);
  wireCategoryItems(state, parts);
  applyCategoryDefault(state, parts);
  return () => resetCategoryDropdown(parts);
}

/**
 * @param {*} dropdown
 * @returns {*}
 */
function getCategoryDropdownParts(dropdown) {
  const toggle = dropdown.querySelector("[data-category-toggle]");
  const menu = dropdown.querySelector("[data-category-menu]");
  const valueEl = dropdown.querySelector("[data-category-value]");
  const items = dropdown.querySelectorAll("[data-category-item]");
  return { dropdown, toggle, menu, valueEl, items };
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireCategoryToggle(parts) {
  parts.toggle?.addEventListener("click", () => {
    setCategoryOpen(parts, parts.menu?.hidden);
  });
}

/**
 * @param {*} parts
 * @param {*} open
 * @returns {*}
 */
function setCategoryOpen(parts, open) {
  if (!parts.menu || !parts.toggle) return;
  parts.menu.hidden = !open;
  parts.toggle.setAttribute("aria-expanded", String(open));
  parts.dropdown.classList.toggle("is-open", open);
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function wireCategoryItems(state, parts) {
  parts.items.forEach((item) => wireCategoryItem(state, parts, item));
}

/**
 * @param {*} state
 * @param {*} parts
 * @param {*} item
 * @returns {*}
 */
function wireCategoryItem(state, parts, item) {
  item.addEventListener("click", () => {
    setSelectedCategory(state, parts, item);
  });
}

/**
 * @param {*} state
 * @param {*} parts
 * @param {*} item
 * @returns {*}
 */
function setSelectedCategory(state, parts, item) {
  state.selectedCategory = item.dataset.value || "";
  setCategoryValue(state, parts, item);
  setCategoryOpen(parts, false);
  updateCreateButtonState(state);
}

/**
 * @param {*} state
 * @param {*} parts
 * @param {*} item
 * @returns {*}
 */
function setCategoryValue(state, parts, item) {
  if (state.categoryInput) state.categoryInput.value = state.selectedCategory;
  if (parts.valueEl) parts.valueEl.textContent = item.dataset.label || item.textContent || "";
  parts.dropdown.classList.toggle("has-value", Boolean(state.selectedCategory));
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function applyCategoryDefault(state, parts) {
  if (!state.selectedCategory) return;
  if (state.categoryInput) state.categoryInput.value = state.selectedCategory;
  if (parts.valueEl) parts.valueEl.textContent = getCategoryLabel(state.selectedCategory);
  parts.dropdown.classList.add("has-value");
}

/**
 * @param {*} value
 * @returns {*}
 */
function getCategoryLabel(value) {
  return value === "technical" ? "Technical Task" : "User Story";
}

/**
 * @param {*} parts
 * @returns {*}
 */
function resetCategoryDropdown(parts) {
  if (parts.valueEl) parts.valueEl.textContent = "Select task category";
  parts.dropdown.classList.remove("has-value", "is-open");
  if (parts.menu) parts.menu.hidden = true;
  if (parts.toggle) parts.toggle.setAttribute("aria-expanded", "false");
}

/**
 * @param {*} state
 * @returns {*}
 */
function getSelectedCategoryValue(state) {
  if (state.categoryInput?.value) return state.categoryInput.value;
  return state.selectedCategory;
}

/**
 * @param {*} state
 * @returns {*}
 */
function initAssignedDropdown(state) {
  const dropdown = document.getElementById("assignedDropdown");
  if (!dropdown) return null;
  const parts = getAssignedDropdownParts(dropdown);
  wireAssignedToggle(parts);
  wireAssignedOutsideClose(parts);
  loadAssignedContacts(state, parts);
  return () => resetAssignedDropdown(parts);
}

/**
 * @param {*} dropdown
 * @returns {*}
 */
function getAssignedDropdownParts(dropdown) {
  const toggle = dropdown.querySelector("[data-assigned-toggle]");
  const menu = dropdown.querySelector("[data-assigned-menu]");
  const valueEl = dropdown.querySelector("[data-assigned-value]");
  return { dropdown, toggle, menu, valueEl };
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedToggle(parts) {
  parts.toggle?.addEventListener("click", () => {
    setAssignedOpen(parts, parts.menu?.hidden);
  });
}

/**
 * @param {*} parts
 * @param {*} open
 * @returns {*}
 */
function setAssignedOpen(parts, open) {
  if (!parts.menu || !parts.toggle) return;
  parts.menu.hidden = !open;
  parts.toggle.setAttribute("aria-expanded", String(open));
  parts.dropdown.classList.toggle("is-open", open);
}

/**
 * @param {*} parts
 * @returns {*}
 */
function wireAssignedOutsideClose(parts) {
  document.addEventListener("click", (e) => {
    if (!parts.dropdown.contains(e.target)) setAssignedOpen(parts, false);
  });
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
async function loadAssignedContacts(state, parts) {
  if (!parts.menu) return;
  parts.menu.innerHTML = "";
  const contacts = await loadContacts();
  contacts.forEach((contact) => appendAssignedItem(state, parts, contact));
  updateAssignedLabel(state, parts);
}

/**
 * @param {*} state
 * @param {*} parts
 * @param {*} contact
 * @returns {*}
 */
function appendAssignedItem(state, parts, contact) {
  const item = buildAssignedItem(contact);
  const check = item.querySelector(".assigned-check");
  setAssignedSelectionState(state, item, check, contact);
  item.addEventListener("click", () => {
    toggleAssignedContact(state, contact, item, check, parts);
  });
  parts.menu.appendChild(item);
}

/**
 * @param {*} contact
 * @returns {*}
 */
function buildAssignedItem(contact) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "dropdown-item dropdown-item--assigned";
  item.dataset.contactId = contact.id || "";
  item.appendChild(buildAssignedLabel(contact));
  item.appendChild(buildAssignedCheck());
  return item;
}

/**
 * @param {*} contact
 * @returns {*}
 */
function buildAssignedLabel(contact) {
  const label = document.createElement("span");
  label.textContent = contact.name || "";
  return label;
}

/**
 * @returns {*}
 */
function buildAssignedCheck() {
  const check = document.createElement("span");
  check.className = "assigned-check";
  return check;
}

/**
 * @param {*} state
 * @param {*} item
 * @param {*} check
 * @param {*} contact
 * @returns {*}
 */
function setAssignedSelectionState(state, item, check, contact) {
  const isSelected = state.selectedAssigned.some((a) => a.id ? a.id === contact.id : a.name === contact.name);
  if (!isSelected) return;
  item.classList.add("is-selected");
  check.textContent = "x";
}

/**
 * @param {*} state
 * @param {*} contact
 * @param {*} item
 * @param {*} check
 * @param {*} parts
 * @returns {*}
 */
function toggleAssignedContact(state, contact, item, check, parts) {
  const exists = state.selectedAssigned.find((a) => a.id === contact.id);
  if (exists) {
    removeAssignedContact(state, contact, item, check);
  } else {
    addAssignedContact(state, contact, item, check);
  }
  updateAssignedLabel(state, parts);
}

/**
 * @param {*} state
 * @param {*} contact
 * @param {*} item
 * @param {*} check
 * @returns {*}
 */
function removeAssignedContact(state, contact, item, check) {
  state.selectedAssigned = state.selectedAssigned.filter((a) => a.id !== contact.id);
  item.classList.remove("is-selected");
  check.textContent = "";
}

/**
 * @param {*} state
 * @param {*} contact
 * @param {*} item
 * @param {*} check
 * @returns {*}
 */
function addAssignedContact(state, contact, item, check) {
  state.selectedAssigned.push({
    id: contact.id,
    name: contact.name || "",
    color: contact.color || null,
  });
  item.classList.add("is-selected");
  check.textContent = "x";
}

/**
 * @param {*} state
 * @param {*} parts
 * @returns {*}
 */
function updateAssignedLabel(state, parts) {
  if (!parts.valueEl) return;
  if (state.selectedAssigned.length === 0) return resetAssignedLabel(parts);
  const names = state.selectedAssigned.map((a) => a.name).filter(Boolean);
  const shown = names.slice(0, 2).join(", ");
  const more = names.length > 2 ? ` +${names.length - 2}` : "";
  parts.valueEl.textContent = `${shown}${more}`;
  parts.dropdown.classList.add("has-value");
}

/**
 * @param {*} parts
 * @returns {*}
 */
function resetAssignedLabel(parts) {
  parts.valueEl.textContent = "Select contacts to assign";
  parts.dropdown.classList.remove("has-value");
}

/**
 * @param {*} parts
 * @returns {*}
 */
function resetAssignedDropdown(parts) {
  resetAssignedLabel(parts);
  parts.dropdown.classList.remove("is-open");
  if (parts.menu) parts.menu.hidden = true;
  if (parts.toggle) parts.toggle.setAttribute("aria-expanded", "false");
}

/**
 * @returns {*}
 */
async function loadContacts() {
  try {
    const data = await ContactService.getAll();
    const arr = normalizeToArray(data);
    return arr.length > 0 ? arr : [];
  } catch (err) {
    return [];
  }
}

/**
 * @param {*} data
 * @returns {*}
 */
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}

/**
 * @param {*} state
 * @returns {*}
 */
function wireCreateButtonState(state) {
  state.titleInput?.addEventListener("input", () => updateCreateButtonState(state));
  state.dueDateInput?.addEventListener("input", () => updateCreateButtonState(state));
  state.dueDateInput?.addEventListener("change", () => updateCreateButtonState(state));
  state.form.addEventListener("input", () => updateCreateButtonState(state));
  state.form.addEventListener("change", () => updateCreateButtonState(state));
}

/**
 * @param {*} state
 * @returns {*}
 */
function updateCreateButtonState(state) {
  if (!state.createBtn) return;
  const isReady = Boolean(
    state.titleInput?.value.trim() &&
      state.dueDateInput?.value.trim() &&
      getSelectedCategoryValue(state)
  );
  state.createBtn.disabled = !isReady;
  state.createBtn.classList.toggle("is-active", isReady);
}

/**
 * @param {*} input
 * @returns {*}
 */
function setDueDateMin(input) {
  if (!input) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  input.min = `${yyyy}-${mm}-${dd}`;
}

/**
 * @param {*} state
 * @param {*} taskData
 * @returns {*}
 */
function applyTaskDefaults(state, taskData) {
  if (state.titleInput) state.titleInput.value = taskData.title || "";
  setTaskDescription(taskData);
  setNormalizedDueDate(state, taskData.dueDate);
  state.selectedCategory = String(taskData.category || "").toLowerCase();
  if (state.categoryInput) state.categoryInput.value = state.selectedCategory;
  state.selectedPrio = String(taskData.prio || "medium").toLowerCase();
  applyPrioButtonStyles(state);
  state.selectedAssigned = normalizeAssignedFromTask(taskData.assigned);
  state.selectedSubtasks = normalizeSubtasksFromTask(taskData.subtasks);
  renderSubtasks(state);
}

/**
 * @param {*} taskData
 * @returns {*}
 */
function setTaskDescription(taskData) {
  const descInput = document.getElementById("taskDescription");
  if (descInput) descInput.value = taskData.description || "";
}

/**
 * @param {*} state
 * @param {*} value
 * @returns {*}
 */
function setNormalizedDueDate(state, value) {
  const normalizedDate = normalizeDueDateForInput(value);
  if (state.dueDateInput && normalizedDate) state.dueDateInput.value = normalizedDate;
}

/**
 * @param {*} value
 * @returns {*}
 */
function normalizeDueDateForInput(value) {
  if (!value) return "";
  const v = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const match = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return "";
}

/**
 * @param {*} raw
 * @returns {*}
 */
function normalizeAssignedFromTask(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeAssignedItem(item))
    .filter((x) => x && x.name);
}

/**
 * @param {*} item
 * @returns {*}
 */
function normalizeAssignedItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { id: "", name: item, color: null };
  if (typeof item === "object") return buildAssignedValue(item);
  return null;
}

/**
 * @param {*} item
 * @returns {*}
 */
function buildAssignedValue(item) {
  return {
    id: item.id || "",
    name: item.name || item.fullName || item.username || "",
    color: item.color || null,
  };
}

/**
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
    state.subtaskList.appendChild(buildSubtaskRow(state, subtask, index));
  });
}

/**
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
 * @param {*} subtask
 * @returns {*}
 */
function buildSubtaskText(subtask) {
  const text = document.createElement("span");
  text.textContent = subtask.title || "Subtask";
  return text;
}

/**
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
  return raw
    .map((item) => normalizeSubtaskItem(item))
    .filter((x) => x && x.title);
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

/**
 * @param {*} state
 * @returns {*}
 */
function applyPrioButtonStyles(state) {
  state.form.querySelectorAll(".prio-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.prio === state.selectedPrio);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initAddTaskForm({
/**
 * @returns {*}
 */
    onClose: () => {
      window.location.href = "board.html";
    },
  });
});
