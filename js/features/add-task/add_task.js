/**
 * Boots the add-task page form.
 * @returns {void}
 */
window.addEventListener("DOMContentLoaded", () => {
  initAddTaskForm({
    onClose: () => {
      window.location.href = "board.html";
    },
  });
});
