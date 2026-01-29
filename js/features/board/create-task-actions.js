/**
 * Confirms task deletion.
 * @param {string} taskId
 */
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

/**
 * Deletes a task and refreshes the board.
 * @param {string} taskId
 */
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

/**
 * Updates a subtask and persists changes.
 * @param {string} taskId
 * @param {number} index
 * @param {boolean} done
 */
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

/**
 * Gets a subtask at the given index.
 * @returns {Object|null}
 */
function getSubtaskAt(task, index) {
  const subtasks = getSubtasks(task);
  if (!Array.isArray(subtasks) || !subtasks[index]) return null;
  return subtasks[index];
}

/**
 * Persists subtask changes.
 */
async function persistSubtaskUpdate(task) {
  try {
    await TaskService.update(task.id, task);
  } catch (error) {}
}

/**
 * Updates subtask done flags.
 */
function setSubtaskDone(subtask, done) {
  if (!subtask || typeof subtask !== "object") return;
  subtask.done = Boolean(done);
  subtask.completed = Boolean(done);
  subtask.isDone = Boolean(done);
}
