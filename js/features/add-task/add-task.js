window.addEventListener("DOMContentLoaded", handleAddTaskReady); // Init add-task page

function handleAddTaskReady() {
  withPageReady(runAddTaskInit);
}

async function runAddTaskInit() {
  await initAddTaskForm({
    onClose: () => {
      window.location.href = "board.html";
    },
  });
}

