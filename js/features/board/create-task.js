function wireAddTaskButtons() {
  const mainBtn = document.getElementById("boardAddTaskBtn");
  mainBtn?.addEventListener("click", () => openOverlayWithStatus("todo"));
  document.querySelectorAll(".board-column-add").forEach((btn) => {
    btn.addEventListener("click", () => handleColumnAddClick(btn));
  });
}

/**
 * Opens the overlay based on a column button.
 * @param {HTMLElement} btn
 */
function handleColumnAddClick(btn) {
  const column = btn.closest(".board-column");
  const status = column?.dataset?.status || "todo";
  openOverlayWithStatus(status);
}

/**
 * Opens the add-task overlay with a status.
 * @param {string} status
 */
function openOverlayWithStatus(status) {
  if (typeof openAddTaskOverlay !== "function") return;
  openAddTaskOverlay(status);
}

/**
 * Wires card open handlers.
 */
function wireCardOpenHandlers(card, task) {
  card.addEventListener("click", (e) => handleCardOpenClick(e, task));
  card.addEventListener("keydown", (e) => handleCardOpenKeydown(e, task));
}

/**
 * Handles opening a card on click.
 */
function handleCardOpenClick(e, task) {
  if (e?.target?.closest(".board-move")) return;
  if (boardState.draggingTaskId) return;
  openTaskDetailOverlay(task?.id);
}

/**
 * Handles opening a card on keydown.
 */
function handleCardOpenKeydown(e, task) {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  openTaskDetailOverlay(task?.id);
}

/**
 * Opens the task detail overlay.
 * @param {string} taskId
 */
function openTaskDetailOverlay(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;
  const root = openTaskOverlayRoot();
  renderTaskDetailOverlay(root, task);
  wireTaskDetailClose(root);
}

/**
 * Finds a task by ID in board state.
 * @param {string} taskId
 * @returns {Object|undefined}
 */
function findTaskById(taskId) {
  return boardState.tasks.find((t) => {
    return String(t?.id || "") === String(taskId || "");
  });
}
