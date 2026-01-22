/**
 * Boots the add-task page form.
 * @returns {void}
 */
window.addEventListener("DOMContentLoaded", handleAddTaskReady);

/**
 * @returns {void}
 */
function handleAddTaskReady() {
  withPageReady(runAddTaskInit);
}

/**
 * @returns {Promise<void>}
 */
async function runAddTaskInit() {
  await initAddTaskForm({
    onClose: () => {
      window.location.href = "board.html";
    },
  });
}
