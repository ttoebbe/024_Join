function wireDragAndDrop() {
  document.querySelectorAll(".board-column").forEach((column) => {
    column.addEventListener("dragover", handleColumnDragOver);
    column.addEventListener("dragenter", handleColumnDragEnter);
    column.addEventListener("dragleave", handleColumnDragLeave);
    column.addEventListener("drop", handleColumnDrop);
  });
}

function wireCardDragHandlers(card) {
  card.addEventListener("dragstart", handleCardDragStart);
  card.addEventListener("dragend", handleCardDragEnd);
}

function handleCardDragStart(e) {
  const card = e.currentTarget;
  const taskId = card?.dataset?.taskId || "";
  if (taskId) {
    e.dataTransfer?.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    boardState.draggingTaskId = taskId;
  }
  card.classList.add("is-dragging");
}

function handleCardDragEnd(e) {
  const card = e.currentTarget;
  card.classList.remove("is-dragging");
  boardState.draggingTaskId = null;
  clearDropTargets();
}

function handleColumnDragOver(e) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
}

function handleColumnDragEnter(e) {
  const column = e.currentTarget;
  column.classList.add("is-drop-target");
}

function handleColumnDragLeave(e) {
  const column = e.currentTarget;
  const related = e.relatedTarget;

  if (related && column.contains(related)) return;
  column.classList.remove("is-drop-target");
}

function handleColumnDrop(e) {
  e.preventDefault();
  const column = e.currentTarget;
  column.classList.remove("is-drop-target");

  const status = column.dataset.status;
  const taskId =
    e.dataTransfer?.getData("text/plain") || boardState.draggingTaskId;

  if (!status || !taskId) return;
  updateTaskStatus(taskId, status);
}

function clearDropTargets() {
  document
    .querySelectorAll(".board-column.is-drop-target")
    .forEach((col) => {
      col.classList.remove("is-drop-target");
    });
}

async function updateTaskStatus(taskId, status) {
  const task = findTaskById(taskId);
  if (!task) return;

  const previous = task.status;
  if (isSameStatus(previous, status)) return;
  applyStatusChange(task, status);
  await persistStatusChange(task, previous, status);
}

function findTaskById(taskId) {
  return boardState.tasks.find((t) => {
    return String(t?.id || "") === String(taskId);
  });
}

function isSameStatus(previous, status) {
  return normalizeStatus(previous) === status;
}

function applyStatusChange(task, status) {
  task.status = status;
  renderBoard();
}

async function persistStatusChange(task, previous, status) {
  try {
    await TaskService.update(task.id, task);
  } catch (error) {
    rollbackStatus(task, previous);
  }
}

function rollbackStatus(task, previous) {
  task.status = previous;
  renderBoard();
}

