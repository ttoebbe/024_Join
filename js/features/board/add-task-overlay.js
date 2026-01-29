let presetStatus = "todo";

/**
 * Opens the add-task overlay.
 * @param {string} status
 * @returns {Promise<void>}
 */
async function openAddTaskOverlay(status = "todo") {
  presetStatus = status;
  return renderTaskOverlay({ mode: "create", status: presetStatus });
}

/**
 * Opens the edit-task overlay.
 * @param {Object} task
 * @returns {Promise<void>}
 */
async function openEditTaskOverlay(task) {
  const status = task?.status || "todo";
  presetStatus = status;
  return renderTaskOverlay({ mode: "edit", status: presetStatus, task });
}

/**
 * Renders the overlay content and wires events.
 * @returns {Promise<void>}
 */
async function renderTaskOverlay({ mode, status, task }) {
  const root = ensureOverlayRoot();
  root.classList.remove("hidden");
  root.setAttribute("aria-hidden", "false");
  const formHtml = await loadFormTemplate(status);
  const title = mode === "edit" ? "Edit Task" : "Add Task";
  root.innerHTML = buildOverlayHTML(title, formHtml);
  setupOverlayEvents(root, status, mode);
  if (typeof initAddTaskForm === "function") {
    initAddTaskForm({ onClose: closeAddTaskOverlay, status, mode, task });
  }
}

/**
 * Loads the add-task form template.
 * @param {string} status
 * @returns {Promise<string>}
 */
async function loadFormTemplate(status) {
  if (typeof getAddTaskFormTemplate === "function")
    return getAddTaskFormTemplate(status);
  try {
    const res = await fetch("./add-task-form.html", { cache: "no-store" });
    if (!res.ok) throw new Error(`Template not found (${res.status})`);
    return await res.text();
  } catch (err) {
    return `<div style="padding:16px; border:1px dashed #d1d1d1; border-radius:12px;"><p><strong>Template is missing or failed to load.</strong></p></div>`;
  }
}

/**
 * Builds the overlay HTML string.
 * @param {string} title
 * @param {string} formHtml
 * @returns {string}
 */
function buildOverlayHTML(title, formHtml) {
  return `<div class="overlay-backdrop" data-overlay-close></div><div class="overlay-panel" role="dialog" aria-modal="true" aria-label="${title}"><button class="overlay-close" type="button" data-overlay-close aria-label="Close">×</button><h2>${title}</h2>${formHtml}</div>`;
}

/**
 * Wires overlay events and preset values.
 * @param {HTMLElement} root
 * @param {string} status
 * @param {string} mode
 */
function setupOverlayEvents(root, status, mode) {
  root
    .querySelectorAll("[data-overlay-close]")
    .forEach((el) => el.addEventListener("click", closeAddTaskOverlay));
  const statusField = root.querySelector("#task-status-preset");
  if (statusField) statusField.value = status;
  const createBtn = root.querySelector("#create-btn");
  if (createBtn && mode === "edit") {
    const label = createBtn.querySelector(".btn-label");
    if (label) {
      label.textContent = "Save";
    } else {
      createBtn.textContent = "Save";
    }
  }
}

function closeAddTaskOverlay() {
  const root = document.getElementById("overlayRoot");
  if (!root) return;
  root.classList.add("hidden");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = "";
}

/**
 * Ensures the overlay root exists.
 * @returns {HTMLElement}
 */
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

window.openAddTaskOverlay = openAddTaskOverlay;
window.openEditTaskOverlay = openEditTaskOverlay;
window.closeAddTaskOverlay = closeAddTaskOverlay;
