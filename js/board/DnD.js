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
    .forEach((col) => col.classList.remove("is-drop-target"));
}

/**
 * Updates task status, renders immediately, then persists.
 */
async function updateTaskStatus(taskId, status) {
  const task = boardState.tasks.find(
    (t) => String(t?.id || "") === String(taskId)
  );
  if (!task) return;

  const previous = task.status;
  if (normalizeStatus(previous) === status) return;

  task.status = status;
  renderBoard();

  try {
    await TaskService.update(task.id, { status });
  } catch (error) {
    task.status = previous;
    renderBoard();
  }
}
