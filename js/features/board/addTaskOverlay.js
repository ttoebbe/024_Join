let presetStatus = "todo";

async function openAddTaskOverlay(status = "todo") {
  presetStatus = status;
  return renderTaskOverlay({ mode: "create", status: presetStatus });
}

async function openEditTaskOverlay(task) {
  const status = task?.status || "todo";
  presetStatus = status;
  return renderTaskOverlay({ mode: "edit", status: presetStatus, task });
}

async function renderTaskOverlay({ mode, status, task }) {
  const root = ensureOverlayRoot();
  root.classList.remove("hidden");
  root.setAttribute("aria-hidden", "false");

  // Template laden (wenn fehlt: Fallback anzeigen)
  let formHtml = "";
  try {
    const res = await fetch("./add_task_form.html");
    if (!res.ok) throw new Error(`Template not found (${res.status})`);
    formHtml = await res.text();
  } catch (err) {
    formHtml = `
      <div style="padding:16px; border:1px dashed #d1d1d1; border-radius:12px;">
        <p style="margin:0 0 8px 0;"><strong>Template fehlt oder lädt nicht.</strong></p>
        <p style="margin:0;">Erwartet: <code>./add_task_form.html</code></p>
        <p style="margin:8px 0 0 0;">Preset Status: <strong>${status}</strong></p>
      </div>
    `;
  }

  const title = mode === "edit" ? "Edit Task" : "Add Task";

  root.innerHTML = `
    <div class="overlay-backdrop" data-overlay-close></div>
    <div class="overlay-panel" role="dialog" aria-modal="true" aria-label="${title}">
      <button class="overlay-close" type="button" data-overlay-close aria-label="Close">×</button>
      <h2>${title}</h2>
      ${formHtml}
    </div>
  `;

  root.querySelectorAll("[data-overlay-close]").forEach((el) =>
    el.addEventListener("click", closeAddTaskOverlay)
  );

  const statusField = root.querySelector("#taskStatusPreset");
  if (statusField) statusField.value = status;

  const createBtn = root.querySelector("#createBtn");
  if (createBtn && mode === "edit") {
    createBtn.textContent = "Save";
  }

  if (typeof initAddTaskForm === "function") {
    initAddTaskForm({
      onClose: closeAddTaskOverlay,
      status,
      mode,
      task,
    });
  }
}

function closeAddTaskOverlay() {
  const root = document.getElementById("overlayRoot");
  if (!root) return;
  root.classList.add("hidden");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = "";
}

function ensureOverlayRoot() {
  let root = document.getElementById("overlayRoot");
  if (root) return root;

  root = document.createElement("div");
  root.id = "overlayRoot";
  root.className = "overlay-root hidden";
  root.setAttribute("aria-hidden", "true");
  document.body.appendChild(root);
  return root;
}

// Optional: im Notfall global sichtbar machen
window.openAddTaskOverlay = openAddTaskOverlay;
window.openEditTaskOverlay = openEditTaskOverlay;
window.closeAddTaskOverlay = closeAddTaskOverlay;
