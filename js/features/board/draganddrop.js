/* =========================================================
   Drag & Drop (Board)
   ========================================================= */

/**
 * Wires drag/drop handlers for columns once.
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
 * Adds drag handlers to a card.
 */
function wireCardDragHandlers(card) {
  card.addEventListener("dragstart", handleCardDragStart);
  card.addEventListener("dragend", handleCardDragEnd);
}

/**
 * @param {*} e
 * @returns {*}
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
 * @param {*} e
 * @returns {*}
 */
function handleCardDragEnd(e) {
  const card = e.currentTarget;
  card.classList.remove("is-dragging");
  boardState.draggingTaskId = null;
  clearDropTargets();
}

/**
 * @param {*} e
 * @returns {*}
 */
function handleColumnDragOver(e) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
}

/**
 * @param {*} e
 * @returns {*}
 */
function handleColumnDragEnter(e) {
  const column = e.currentTarget;
  column.classList.add("is-drop-target");
}

/**
 * @param {*} e
 * @returns {*}
 */
function handleColumnDragLeave(e) {
  const column = e.currentTarget;
  const related = e.relatedTarget;

  if (related && column.contains(related)) return;
  column.classList.remove("is-drop-target");
}

/**
 * @param {*} e
 * @returns {*}
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
 * @returns {*}
 */
function clearDropTargets() {
  document
    .querySelectorAll(".board-column.is-drop-target")
    .forEach((col) => {
      col.classList.remove("is-drop-target");
    });
}

/**
 * Updates task status, renders immediately, then persists.
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
 * @param {*} taskId
 * @returns {*}
 */
function findTaskById(taskId) {
  return boardState.tasks.find((t) => {
    return String(t?.id || "") === String(taskId);
  });
}

/**
 * @param {*} previous
 * @param {*} status
 * @returns {*}
 */
function isSameStatus(previous, status) {
  return normalizeStatus(previous) === status;
}

/**
 * @param {*} task
 * @param {*} status
 * @returns {*}
 */
function applyStatusChange(task, status) {
  task.status = status;
  renderBoard();
}

/**
 * @param {*} task
 * @param {*} previous
 * @param {*} status
 * @returns {*}
 */
async function persistStatusChange(task, previous, status) {
  try {
    await TaskService.update(task.id, task);
  } catch (error) {
    rollbackStatus(task, previous);
  }
}

/**
 * @param {*} task
 * @param {*} previous
 * @returns {*}
 */
function rollbackStatus(task, previous) {
  task.status = previous;
  renderBoard();
}
