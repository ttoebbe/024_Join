function initAddTaskForm({ onClose }) {
  const form = document.getElementById("addTaskForm");
  if (!form) return;

  // Priority default: Medium (ist-active ist im Template gesetzt)
  let selectedPrio = "medium";
  form.querySelectorAll(".prio-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      form.querySelectorAll(".prio-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      selectedPrio = btn.dataset.prio;
    });
  });

  // Clear
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    form.reset();
    // status preset nach reset wieder setzen
    const statusField = document.getElementById("taskStatusPreset");
    if (statusField) statusField.value = statusField.value || "todo";
  });

  // Submit (eigene Validation, kein HTML5)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("taskTitle")?.value.trim();
    const dueDate = document.getElementById("taskDueDate")?.value.trim();
    const category = getSelectedCategoryValue(); // baust du im Dropdown
    const status = document.getElementById("taskStatusPreset")?.value || "todo";
    const description = document.getElementById("taskDescription")?.value.trim() || "";

    if (!title || !dueDate || !category) {
      alert("Bitte Title, Due date und Category ausfüllen.");
      return;
    }

    const newTask = {
      id: "t" + Date.now(),
      title,
      description,
      status,
      category,
      prio: selectedPrio,
      assigned: [],
      subtasks: [],
      dueDate
    };

    // Speichern (Array-Variante wie bei dir)
    const existing = await getData("tasks");
    const arr = existing ? Object.values(existing) : [];
    arr.push(newTask);
    await uploadData("tasks", arr);

    onClose?.();
  });
}

function getSelectedCategoryValue() {
  // TODO: sobald du dein Category-Dropdown gebaut hast, hier zurückgeben
  return "";
}
