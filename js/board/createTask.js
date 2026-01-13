/* =========================================================
   Task overlays + create actions (Board)
   ========================================================= */

/**
 * Wires the main and column add-task buttons to open the overlay.
 */
function wireAddTaskButtons() {
  const mainBtn = document.getElementById("boardAddTaskBtn");
  if (mainBtn) {
    mainBtn.addEventListener("click", () => openOverlayWithStatus("todo"));
  }

  document.querySelectorAll(".board-column-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const column = btn.closest(".board-column");
      const status = column?.dataset?.status || "todo";
      openOverlayWithStatus(status);
    });
  });
}

function openOverlayWithStatus(status) {
  if (typeof openAddTaskOverlay !== "function") {
    return;
  }
  openAddTaskOverlay(status);
}

function wireCardOpenHandlers(card, task) {
  card.addEventListener("click", () => {
    if (boardState.draggingTaskId) return;
    openTaskDetailOverlay(task?.id);
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openTaskDetailOverlay(task?.id);
    }
  });
}

function openTaskDetailOverlay(taskId) {
  const task = boardState.tasks.find(
    (t) => String(t?.id || "") === String(taskId || "")
  );
  if (!task) return;

  const root = ensureOverlayRoot();
  root.classList.remove("hidden");
  root.setAttribute("aria-hidden", "false");

  root.innerHTML = `
    <div class="overlay-backdrop" data-overlay-close></div>
    <div class="overlay-panel overlay-panel--detail" role="dialog" aria-modal="true" aria-label="Task Details">
      <button class="overlay-close" type="button" data-overlay-close aria-label="Close">×</button>
      <div class="task-detail"></div>
    </div>
  `;

  const detail = root.querySelector(".task-detail");
  if (!detail) return;

  detail.appendChild(createCategoryPill(task));

  const title = document.createElement("h2");
  title.className = "task-detail-title";
  title.textContent = task?.title || task?.name || "(No title)";
  detail.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "task-detail-desc";
  desc.textContent = task?.description || task?.desc || "";
  detail.appendChild(desc);

  const meta = document.createElement("div");
  meta.className = "task-detail-meta";
  meta.appendChild(createMetaRow("Due date", task?.dueDate || "-"));
  meta.appendChild(
    createMetaRow("Priority", normalizePrioLabel(task?.prio), mapPrioToIcon(task?.prio))
  );
  detail.appendChild(meta);

  detail.appendChild(createAssignedSection(task));
  detail.appendChild(createSubtasksSection(task));
  detail.appendChild(createDetailActions(task));

  root.querySelectorAll("[data-overlay-close]").forEach((el) =>
    el.addEventListener("click", closeTaskOverlay)
  );
}

function createMetaRow(label, value, iconSrc) {
  const row = document.createElement("div");
  row.className = "task-detail-row";

  const key = document.createElement("span");
  key.className = "task-detail-key";
  key.textContent = label + ":";

  const val = document.createElement("span");
  val.className = "task-detail-value";
  val.textContent = value || "-";

  row.appendChild(key);
  row.appendChild(val);

  if (iconSrc) {
    const img = document.createElement("img");
    img.className = "task-detail-prio-icon";
    img.alt = "Priority";
    img.src = iconSrc;
    row.appendChild(img);
  }

  return row;
}

function createAssignedSection(task) {
  const wrap = document.createElement("div");
  wrap.className = "task-detail-section";

  const label = document.createElement("div");
  label.className = "task-detail-key";
  label.textContent = "Assigned to:";
  wrap.appendChild(label);

  const list = document.createElement("div");
  list.className = "task-detail-assigned";

  const assigned = getAssigned(task);
  if (assigned.length === 0) {
    const empty = document.createElement("span");
    empty.className = "task-detail-empty";
    empty.textContent = "No one assigned";
    list.appendChild(empty);
  } else {
    assigned.forEach((person) => {
      const item = document.createElement("div");
      item.className = "task-detail-assignee";
      item.appendChild(createAvatarBubble(person));

      const name = document.createElement("span");
      name.textContent = person.name || "";
      item.appendChild(name);
      list.appendChild(item);
    });
  }

  wrap.appendChild(list);
  return wrap;
}

function createSubtasksSection(task) {
  const wrap = document.createElement("div");
  wrap.className = "task-detail-section";

  const label = document.createElement("div");
  label.className = "task-detail-key";
  label.textContent = "Subtasks:";
  wrap.appendChild(label);

  const list = document.createElement("div");
  list.className = "task-detail-subtasks";

  const subtasks = getSubtasks(task);
  if (subtasks.length === 0) {
    const empty = document.createElement("span");
    empty.className = "task-detail-empty";
    empty.textContent = "No subtasks";
    list.appendChild(empty);
  } else {
    subtasks.forEach((s, index) => {
      const row = document.createElement("label");
      row.className = "task-detail-subtask";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = isSubtaskDone(s);
      cb.addEventListener("change", () => {
        updateSubtaskDone(task?.id, index, cb.checked);
      });

      const text = document.createElement("span");
      text.textContent = s.title || s.name || s.text || "Subtask";

      row.appendChild(cb);
      row.appendChild(text);
      list.appendChild(row);
    });
  }

  wrap.appendChild(list);
  return wrap;
}

function createDetailActions(task) {
  const actions = document.createElement("div");
  actions.className = "task-detail-actions";

  const del = document.createElement("button");
  del.type = "button";
  del.className = "task-detail-btn";
  del.textContent = "Delete";
  del.addEventListener("click", async () => {
    const ok = confirm("Delete this task?");
    if (!ok) return;
    await deleteTaskAndRefresh(task?.id);
  });

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "task-detail-btn";
  edit.textContent = "Edit";
  edit.addEventListener("click", () => {
    if (typeof openEditTaskOverlay === "function") {
      openEditTaskOverlay(task);
    }
  });

  actions.appendChild(del);
  actions.appendChild(edit);
  return actions;
}

async function deleteTaskAndRefresh(taskId) {
  if (!taskId) return;
  if (typeof deleteTaskById === "function") {
    await deleteTaskById(taskId);
  } else {
    boardState.tasks = boardState.tasks.filter(
      (t) => String(t?.id || "") !== String(taskId)
    );
  }

  await loadTasks();
  renderBoard();
  closeTaskOverlay();
}

function closeTaskOverlay() {
  const root = document.getElementById("overlayRoot");
  if (!root) return;
  root.classList.add("hidden");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = "";
}

async function updateSubtaskDone(taskId, index, done) {
  if (!taskId && taskId !== 0) return;
  const task = boardState.tasks.find(
    (t) => String(t?.id || "") === String(taskId)
  );
  if (!task) return;

  const subtasks = getSubtasks(task);
  if (!Array.isArray(subtasks) || !subtasks[index]) return;

  setSubtaskDone(subtasks[index], done);
  task.subtasks = subtasks;

  renderBoard();

  try {
    await TaskService.update(task.id, { subtasks: task.subtasks });
  } catch (error) {
    // intentionally silent
  }
}

function setSubtaskDone(subtask, done) {
  if (!subtask || typeof subtask !== "object") return;
  subtask.done = Boolean(done);
  subtask.completed = Boolean(done);
  subtask.isDone = Boolean(done);
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

function normalizePrioLabel(value) {
  const v = String(value || "medium").toLowerCase();
  if (v === "urgent" || v === "high" || v === "alta") return "Urgent";
  if (v === "low" || v === "baja") return "Low";
  return "Medium";
}
