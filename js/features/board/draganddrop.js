/**
 * Wires drag-and-drop handlers for board columns.
 */
function wireDragAndDrop() {
  document.querySelectorAll(".board-column").forEach((column) => {
    column.addEventListener("dragover", handleColumnDragOver);
    column.addEventListener("dragenter", handleColumnDragEnter);
    column.addEventListener("dragleave", handleColumnDragLeave);
    column.addEventListener("drop", handleColumnDrop);
  });
}

/**
 * Wires drag handlers for a task card.
 */
function wireCardDragHandlers(card) {
  card.addEventListener("dragstart", handleCardDragStart);
  card.addEventListener("dragend", handleCardDragEnd);
}

/**
 * Handles drag start on a card.
 */
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

/**
 * Handles drag end on a card.
 */
function handleCardDragEnd(e) {
  const card = e.currentTarget;
  card.classList.remove("is-dragging");
  boardState.draggingTaskId = null;
  clearDropTargets();
}

/**
 * Handles drag over a column.
 */
function handleColumnDragOver(e) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
}

/**
 * Handles drag enter on a column.
 */
function handleColumnDragEnter(e) {
  const column = e.currentTarget;
  column.classList.add("is-drop-target");
}

/**
 * Handles drag leave on a column.
 */
function handleColumnDragLeave(e) {
  const column = e.currentTarget;
  const related = e.relatedTarget;

  if (related && column.contains(related)) return;
  column.classList.remove("is-drop-target");
}

/**
 * Handles dropping a card into a column.
 */
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

/**
 * Clears drop target styling.
 */
function clearDropTargets() {
  document.querySelectorAll(".board-column.is-drop-target").forEach((col) => {
    col.classList.remove("is-drop-target");
  });
}

/**
 * Updates task status and persists the change.
 */
async function updateTaskStatus(taskId, status) {
  const task = findTaskById(taskId);
  if (!task) return;

  const previous = task.status;
  if (isSameStatus(previous, status)) return;
  applyStatusChange(task, status);
  await persistStatusChange(task, previous, status);
}

/**
 * Finds a task by ID in board state.
 * @param {string} taskId
 * @returns {Object|undefined}
 */
function findTaskById(taskId) {
  return boardState.tasks.find((t) => {
    return String(t?.id || "") === String(taskId);
  });
}

/**
 * Checks whether the status is unchanged.
 * @param {string} previous
 * @param {string} status
 * @returns {boolean}
 */
function isSameStatus(previous, status) {
  return normalizeStatus(previous) === status;
}

/**
 * Applies a status change and re-renders the board.
 */
function applyStatusChange(task, status) {
  task.status = status;
  renderBoard();
}

/**
 * Persists the status change.
 */
async function persistStatusChange(task, previous, status) {
  try {
    await TaskService.update(task.id, task);
  } catch (error) {
    rollbackStatus(task, previous);
  }
}

/**
 * Rolls back a failed status change.
 */
function rollbackStatus(task, previous) {
  task.status = previous;
  renderBoard();
}
