/**
 * Renders the task detail overlay.
 */
function renderTaskDetailOverlay(root, task) {
  root.innerHTML = getTaskDetailShellTemplate();
  const detail = root.querySelector(".task-detail");
  if (!detail) return;
  fillTaskDetail(detail, task);
}

/**
 * Fills the task detail content.
 */
function fillTaskDetail(detail, task) {
  detail.appendChild(createCategoryPill(task));
  detail.appendChild(createDetailTitle(task));
  detail.appendChild(createDetailDescription(task));
  detail.appendChild(createDetailMeta(task));
  detail.appendChild(createAssignedSection(task));
  detail.appendChild(createSubtasksSection(task));
  detail.appendChild(createDetailActions(task));
}

/**
 * Creates the detail title.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createDetailTitle(task) {
  const title = document.createElement("h2");
  title.className = "task-detail-title";
  title.textContent = task?.title || task?.name || "(No title)";
  return title;
}

/**
 * Creates the detail description.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createDetailDescription(task) {
  const desc = document.createElement("p");
  desc.className = "task-detail-desc";
  desc.textContent = task?.description || task?.desc || "";
  return desc;
}

/**
 * Creates the detail meta section.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createDetailMeta(task) {
  const meta = document.createElement("div");
  meta.className = "task-detail-meta";
  meta.appendChild(createMetaRow("Due date", task?.dueDate || "-"));
  meta.appendChild(createPriorityRow(task));
  return meta;
}

/**
 * Creates the priority row.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createPriorityRow(task) {
  return createMetaRow(
    "Priority",
    normalizePrioLabel(task?.prio),
    mapPrioToIcon(task?.prio),
    normalizePrioKey(task?.prio),
  );
}

/**
 * Creates a meta row.
 * @returns {HTMLElement}
 */
function createMetaRow(label, value, iconSrc, prioKey) {
  const row = document.createElement("div");
  row.className = "task-detail-row";
  row.appendChild(createMetaKey(label));
  row.appendChild(createMetaValue(value));
  if (iconSrc) row.appendChild(createMetaIcon(iconSrc, prioKey));
  return row;
}

/**
 * Creates a meta key element.
 * @param {string} label
 * @returns {HTMLElement}
 */
function createMetaKey(label) {
  const key = document.createElement("span");
  key.className = "task-detail-key";
  key.textContent = label + ":";
  return key;
}

/**
 * Creates a meta value element.
 * @param {string} value
 * @returns {HTMLElement}
 */
function createMetaValue(value) {
  const val = document.createElement("span");
  val.className = "task-detail-value";
  val.textContent = value || "-";
  return val;
}

/**
 * Creates a meta icon element.
 * @returns {HTMLImageElement}
 */
function createMetaIcon(iconSrc, prioKey) {
  const img = document.createElement("img");
  img.className = "task-detail-prio-icon";
  img.alt = "Priority";
  if (prioKey) img.dataset.prio = prioKey;
  img.src = iconSrc;
  return img;
}

/**
 * Creates the assigned section.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createAssignedSection(task) {
  const wrap = document.createElement("div");
  wrap.className = "task-detail-section";
  wrap.appendChild(createSectionLabel("Assigned to:"));
  wrap.appendChild(buildAssignedList(task));
  return wrap;
}

/**
 * Creates a section label element.
 * @param {string} text
 * @returns {HTMLElement}
 */
function createSectionLabel(text) {
  const label = document.createElement("div");
  label.className = "task-detail-key";
  label.textContent = text;
  return label;
}

/**
 * Builds the assigned list.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function buildAssignedList(task) {
  const list = document.createElement("div");
  list.className = "task-detail-assigned";
  const assigned = getAssigned(task);
  if (assigned.length === 0) return appendAssignedEmpty(list);
  assigned.forEach((person) => list.appendChild(buildAssigneeRow(person)));
  return list;
}

/**
 * Appends an empty assigned state.
 * @param {HTMLElement} list
 * @returns {HTMLElement}
 */
function appendAssignedEmpty(list) {
  const empty = document.createElement("span");
  empty.className = "task-detail-empty";
  empty.textContent = "No one assigned";
  list.appendChild(empty);
  return list;
}

/**
 * Builds an assignee row.
 * @param {Object} person
 * @returns {HTMLElement}
 */
function buildAssigneeRow(person) {
  const item = document.createElement("div");
  item.className = "task-detail-assignee";
  item.appendChild(createAvatarBubble(person));
  item.appendChild(buildAssigneeName(person));
  return item;
}

/**
 * Builds the assignee name element.
 * @param {Object} person
 * @returns {HTMLElement}
 */
function buildAssigneeName(person) {
  const name = document.createElement("span");
  name.textContent = person.name || "";
  return name;
}

/**
 * Creates the subtasks section.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createSubtasksSection(task) {
  const wrap = document.createElement("div");
  wrap.className = "task-detail-section";
  wrap.appendChild(createSectionLabel("Subtasks:"));
  wrap.appendChild(buildSubtasksList(task));
  return wrap;
}

/**
 * Builds the subtasks list.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function buildSubtasksList(task) {
  const list = document.createElement("div");
  list.className = "task-detail-subtasks";
  const subtasks = getSubtasks(task);
  if (subtasks.length === 0) return appendSubtasksEmpty(list);
  subtasks.forEach((s, index) =>
    list.appendChild(buildSubtaskRow(task, s, index)),
  );
  return list;
}

/**
 * Appends an empty subtasks state.
 * @param {HTMLElement} list
 * @returns {HTMLElement}
 */
function appendSubtasksEmpty(list) {
  const empty = document.createElement("span");
  empty.className = "task-detail-empty";
  empty.textContent = "No subtasks";
  list.appendChild(empty);
  return list;
}

/**
 * Builds a subtask row.
 * @returns {HTMLElement}
 */
function buildSubtaskRow(task, subtask, index) {
  const row = document.createElement("label");
  row.className = "task-detail-subtask";
  row.appendChild(buildSubtaskCheckbox(task, subtask, index));
  row.appendChild(buildSubtaskText(subtask));
  return row;
}

/**
 * Builds a subtask checkbox.
 * @returns {HTMLInputElement}
 */
function buildSubtaskCheckbox(task, subtask, index) {
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = isSubtaskDone(subtask);
  cb.addEventListener("change", () => {
    updateSubtaskDone(task?.id, index, cb.checked);
  });
  return cb;
}

/**
 * Builds a subtask text element.
 * @param {Object} subtask
 * @returns {HTMLElement}
 */
function buildSubtaskText(subtask) {
  const text = document.createElement("span");
  text.textContent = subtask.title || subtask.name || subtask.text || "Subtask";
  return text;
}

/**
 * Creates the detail actions section.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createDetailActions(task) {
  const actions = document.createElement("div");
  actions.className = "task-detail-actions";
  actions.appendChild(createDeleteButton(task));
  actions.appendChild(createEditButton(task));
  return actions;
}

/**
 * Creates a detail action button.
 * @returns {HTMLButtonElement}
 */
function createDetailButton(label, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "task-detail-btn";
  appendDetailButtonContent(btn, label);
  btn.addEventListener("click", onClick);
  return btn;
}

/**
 * Appends icon/text to a detail button.
 */
function appendDetailButtonContent(btn, label) {
  const icon = getDetailActionIcon(label);
  if (icon) btn.appendChild(icon);
  btn.appendChild(document.createTextNode(label));
}

/**
 * Gets the detail action icon for a label.
 * @param {string} label
 * @returns {HTMLImageElement|null}
 */
function getDetailActionIcon(label) {
  const key = String(label || "").toLowerCase();
  if (key === "delete")
    return buildDetailIcon("/assets/img/icons/delete.svg", "Delete");
  if (key === "edit")
    return buildDetailIcon("/assets/img/icons/edit.svg", "Edit");
  return null;
}

/**
 * Builds a detail icon element.
 * @returns {HTMLImageElement}
 */
function buildDetailIcon(src, label) {
  const img = document.createElement("img");
  img.className = "task-detail-icon";
  img.src = src;
  img.alt = label;
  img.setAttribute("aria-hidden", "true");
  return img;
}

/**
 * Creates the delete action button.
 * @param {Object} task
 * @returns {HTMLButtonElement}
 */
function createDeleteButton(task) {
  return createDetailButton("Delete", () => confirmDeleteTask(task?.id));
}

/**
 * Creates the edit action button.
 * @param {Object} task
 * @returns {HTMLButtonElement}
 */
function createEditButton(task) {
  return createDetailButton("Edit", () => {
    if (typeof openEditTaskOverlay === "function") openEditTaskOverlay(task);
  });
}

/**
 * Normalizes a priority label.
 * @param {string} value
 * @returns {string}
 */
function normalizePrioLabel(value) {
  const v = String(value || "medium").toLowerCase();
  if (v === "urgent" || v === "high" || v === "alta") return "Urgent";
  if (v === "low" || v === "baja") return "Low";
  return "Medium";
}
