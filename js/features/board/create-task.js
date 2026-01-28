function wireAddTaskButtons() {
  const mainBtn = document.getElementById("boardAddTaskBtn");
  mainBtn?.addEventListener("click", () => openOverlayWithStatus("todo")); // Open add task
  document.querySelectorAll(".board-column-add").forEach((btn) => {
    btn.addEventListener("click", () => handleColumnAddClick(btn)); // Open add task per column
  });
}

function handleColumnAddClick(btn) {
  const column = btn.closest(".board-column");
  const status = column?.dataset?.status || "todo";
  openOverlayWithStatus(status);
}

function openOverlayWithStatus(status) {
  if (typeof openAddTaskOverlay !== "function") return;
  openAddTaskOverlay(status);
}

function wireCardOpenHandlers(card, task) {
  card.addEventListener("click", (e) => handleCardOpenClick(e, task)); // Open detail on click
  card.addEventListener("keydown", (e) => handleCardOpenKeydown(e, task)); // Open detail on key
}

function handleCardOpenClick(e, task) {
  if (e?.target?.closest(".board-move")) return;
  if (boardState.draggingTaskId) return;
  openTaskDetailOverlay(task?.id);
}

function handleCardOpenKeydown(e, task) {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  openTaskDetailOverlay(task?.id);
}

function openTaskDetailOverlay(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;
  const root = openTaskOverlayRoot();
  renderTaskDetailOverlay(root, task);
  wireTaskDetailClose(root);
}

function findTaskById(taskId) {
  return boardState.tasks.find((t) => {
    return String(t?.id || "") === String(taskId || "");
  });
}

function openTaskOverlayRoot() {
  const root = ensureOverlayRoot();
  root.classList.remove("hidden");
  root.setAttribute("aria-hidden", "false");
  return root;
}

function renderTaskDetailOverlay(root, task) {
  root.innerHTML = getTaskDetailShellTemplate();
  const detail = root.querySelector(".task-detail");
  if (!detail) return;
  fillTaskDetail(detail, task);
}

function fillTaskDetail(detail, task) {
  detail.appendChild(createCategoryPill(task));
  detail.appendChild(createDetailTitle(task));
  detail.appendChild(createDetailDescription(task));
  detail.appendChild(createDetailMeta(task));
  detail.appendChild(createAssignedSection(task));
  detail.appendChild(createSubtasksSection(task));
  detail.appendChild(createDetailActions(task));
}

function createDetailTitle(task) {
  const title = document.createElement("h2");
  title.className = "task-detail-title";
  title.textContent = task?.title || task?.name || "(No title)";
  return title;
}

function createDetailDescription(task) {
  const desc = document.createElement("p");
  desc.className = "task-detail-desc";
  desc.textContent = task?.description || task?.desc || "";
  return desc;
}

function createDetailMeta(task) {
  const meta = document.createElement("div");
  meta.className = "task-detail-meta";
  meta.appendChild(createMetaRow("Due date", task?.dueDate || "-"));
  meta.appendChild(createPriorityRow(task));
  return meta;
}

function createPriorityRow(task) {
  return createMetaRow(
    "Priority",
    normalizePrioLabel(task?.prio),
    mapPrioToIcon(task?.prio),
    normalizePrioKey(task?.prio)
  );
}

function wireTaskDetailClose(root) {
  root.querySelectorAll("[data-overlay-close]").forEach((el) => {
    el.addEventListener("click", closeTaskOverlay); // Close detail overlay
  });
}

function createMetaRow(label, value, iconSrc, prioKey) {
  const row = document.createElement("div");
  row.className = "task-detail-row";
  row.appendChild(createMetaKey(label));
  row.appendChild(createMetaValue(value));
  if (iconSrc) row.appendChild(createMetaIcon(iconSrc, prioKey));
  return row;
}

function createMetaKey(label) {
  const key = document.createElement("span");
  key.className = "task-detail-key";
  key.textContent = label + ":";
  return key;
}

function createMetaValue(value) {
  const val = document.createElement("span");
  val.className = "task-detail-value";
  val.textContent = value || "-";
  return val;
}

function createMetaIcon(iconSrc, prioKey) {
  const img = document.createElement("img");
  img.className = "task-detail-prio-icon";
  img.alt = "Priority";
  if (prioKey) img.dataset.prio = prioKey;
  img.src = iconSrc;
  return img;
}

function createAssignedSection(task) {
  const wrap = document.createElement("div");
  wrap.className = "task-detail-section";
  wrap.appendChild(createSectionLabel("Assigned to:"));
  wrap.appendChild(buildAssignedList(task));
  return wrap;
}

function createSectionLabel(text) {
  const label = document.createElement("div");
  label.className = "task-detail-key";
  label.textContent = text;
  return label;
}

function buildAssignedList(task) {
  const list = document.createElement("div");
  list.className = "task-detail-assigned";
  const assigned = getAssigned(task);
  if (assigned.length === 0) return appendAssignedEmpty(list);
  assigned.forEach((person) => list.appendChild(buildAssigneeRow(person)));
  return list;
}

function appendAssignedEmpty(list) {
  const empty = document.createElement("span");
  empty.className = "task-detail-empty";
  empty.textContent = "No one assigned";
  list.appendChild(empty);
  return list;
}

function buildAssigneeRow(person) {
  const item = document.createElement("div");
  item.className = "task-detail-assignee";
  item.appendChild(createAvatarBubble(person));
  item.appendChild(buildAssigneeName(person));
  return item;
}

function buildAssigneeName(person) {
  const name = document.createElement("span");
  name.textContent = person.name || "";
  return name;
}

function createSubtasksSection(task) {
  const wrap = document.createElement("div");
  wrap.className = "task-detail-section";
  wrap.appendChild(createSectionLabel("Subtasks:"));
  wrap.appendChild(buildSubtasksList(task));
  return wrap;
}

function buildSubtasksList(task) {
  const list = document.createElement("div");
  list.className = "task-detail-subtasks";
  const subtasks = getSubtasks(task);
  if (subtasks.length === 0) return appendSubtasksEmpty(list);
  subtasks.forEach((s, index) => list.appendChild(buildSubtaskRow(task, s, index)));
  return list;
}

function appendSubtasksEmpty(list) {
  const empty = document.createElement("span");
  empty.className = "task-detail-empty";
  empty.textContent = "No subtasks";
  list.appendChild(empty);
  return list;
}

function buildSubtaskRow(task, subtask, index) {
  const row = document.createElement("label");
  row.className = "task-detail-subtask";
  row.appendChild(buildSubtaskCheckbox(task, subtask, index));
  row.appendChild(buildSubtaskText(subtask));
  return row;
}

function buildSubtaskCheckbox(task, subtask, index) {
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = isSubtaskDone(subtask);
  cb.addEventListener("change", () => { // Toggle subtask done
    updateSubtaskDone(task?.id, index, cb.checked);
  });
  return cb;
}

function buildSubtaskText(subtask) {
  const text = document.createElement("span");
  text.textContent = subtask.title || subtask.name || subtask.text || "Subtask";
  return text;
}

function createDetailActions(task) {
  const actions = document.createElement("div");
  actions.className = "task-detail-actions";
  actions.appendChild(createDeleteButton(task));
  actions.appendChild(createEditButton(task));
  return actions;
}

function createDetailButton(label, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "task-detail-btn";
  appendDetailButtonContent(btn, label);
  btn.addEventListener("click", onClick); // Trigger detail action
  return btn;
}

function appendDetailButtonContent(btn, label) {
  const icon = getDetailActionIcon(label);
  if (icon) btn.appendChild(icon);
  btn.appendChild(document.createTextNode(label));
}

function getDetailActionIcon(label) {
  const key = String(label || "").toLowerCase();
  if (key === "delete") return buildDetailIcon("/assets/img/icons/delete.png", "Delete");
  if (key === "edit") return buildDetailIcon("/assets/img/icons/edit.png", "Edit");
  return null;
}

function buildDetailIcon(src, label) {
  const img = document.createElement("img");
  img.className = "task-detail-icon";
  img.src = src;
  img.alt = label;
  img.setAttribute("aria-hidden", "true");
  return img;
}

function createDeleteButton(task) {
  return createDetailButton("Delete", () => confirmDeleteTask(task?.id));
}

function createEditButton(task) {
  return createDetailButton("Edit", () => {
    if (typeof openEditTaskOverlay === "function") openEditTaskOverlay(task);
  });
}

async function confirmDeleteTask(taskId) {
  const ok = await showConfirmOverlay({
    title: "Delete task?",
    message: "Do you really want to delete this task?",
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  if (!ok) return;
  await deleteTaskAndRefresh(taskId);
}

async function deleteTaskAndRefresh(taskId) {
  if (!taskId) return;
  if (TaskService?.delete) await TaskService.delete(taskId);
  boardState.tasks = boardState.tasks.filter((t) => {
    return String(t?.id || "") !== String(taskId);
  });
  await loadTasks();
  renderBoard();
  closeTaskOverlay();
}

function closeTaskOverlay() {
  const root = document.getElementById("overlayRoot");
  if (!root) return;
  root.classList.add("hidden");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = "";
}

async function updateSubtaskDone(taskId, index, done) {
  if (!taskId && taskId !== 0) return;
  const task = findTaskById(taskId);
  if (!task) return;
  const subtask = getSubtaskAt(task, index);
  if (!subtask) return;
  setSubtaskDone(subtask, done);
  task.subtasks = getSubtasks(task);
  renderBoard();
  await persistSubtaskUpdate(task);
}

function getSubtaskAt(task, index) {
  const subtasks = getSubtasks(task);
  if (!Array.isArray(subtasks) || !subtasks[index]) return null;
  return subtasks[index];
}

async function persistSubtaskUpdate(task) {
  try {
    await TaskService.update(task.id, task);
  } catch (error) {}
}

function setSubtaskDone(subtask, done) {
  if (!subtask || typeof subtask !== "object") return;
  subtask.done = Boolean(done);
  subtask.completed = Boolean(done);
  subtask.isDone = Boolean(done);
}

function ensureOverlayRoot() {
  let root = document.getElementById("overlayRoot");
  if (root) return root;
  root = document.createElement("div");
  root.id = "overlayRoot";
  root.className = "overlay-root hidden";
  root.setAttribute("aria-hidden", "true");
  document.body.appendChild(root);
  return root;
}

function normalizePrioLabel(value) {
  const v = String(value || "medium").toLowerCase();
  if (v === "urgent" || v === "high" || v === "alta") return "Urgent";
  if (v === "low" || v === "baja") return "Low";
  return "Medium";
}
