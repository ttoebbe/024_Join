window.addEventListener("DOMContentLoaded", handleAddTaskReady);

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
