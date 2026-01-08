/* =========================================================
   Board (Join) – Clean rebuild (Render-focused)
   - Load tasks via storage.js (getData)
   - Normalize Firebase data (object/array -> array)
   - Render 4 columns
   - Empty-state per column
   - Live search (title + description)
   - Card rendering:
     - Category pill
     - Title + description preview
     - Subtasks progress (x/y + bar)
     - Footer: assigned initials (+N) + prio icon
   ========================================================= */

/** Toggle to see helpful logs. */
const DEBUG = false;

/**
 * Single source of truth for the board page.
 */
const boardState = {
  tasks: [],
  query: "",
  draggingTaskId: null,
};

/** Entry point */
document.addEventListener("DOMContentLoaded", initBoard);

/**
 * Initializes the board once.
 * - Wire UI events
 * - Load tasks
 * - Render board
 */
async function initBoard() {
  wireBoardUi();
  wireDragAndDrop();
  await loadTasks();
  renderBoard();
}

/**
 * Wires UI events (currently only search).
 * Keep wiring separate from rendering.
 */
function wireBoardUi() {
  const input = document.getElementById("boardSearchInput");
  if (input) {
    input.addEventListener("input", (e) => {
      boardState.query = String(e.target.value || "").trim().toLowerCase();
      renderBoard();
    });
  }

  wireAddTaskButtons();
}

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
    console.warn("[board] openAddTaskOverlay() not found");
    return;
  }
  openAddTaskOverlay(status);
}

/**
 * Loads tasks from storage.
 * Requires: getData("tasks") from storage.js
 */
async function loadTasks() {
  try {
    const raw = await getData("tasks");
    boardState.tasks = normalizeToArray(raw);

    if (DEBUG) {
      console.log(`[board] loaded tasks: ${boardState.tasks.length}`);
      console.log("[board] status sample:", boardState.tasks.map((t) => t?.status));
    }
  } catch (err) {
    console.error("[board] loadTasks failed:", err);
    boardState.tasks = [];
  }
}

/**
 * Normalizes Firebase-like data into an array.
 * - arrays stay arrays (filtered)
 * - objects become Object.values(...)
 */
function normalizeToArray(data) {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.filter(Boolean);
  }

  if (typeof data === "object") {
    return Object.values(data).filter(Boolean);
  }

  return [];
}

/**
 * Main render function.
 * - Apply search filter
 * - Toggle "no results" message
 * - Render each column
 */
function renderBoard() {
  const filtered = filterTasks(boardState.tasks, boardState.query);

  renderNoResults(boardState.query.length > 0 && filtered.length === 0);

  renderColumn("todo", filtered);
  renderColumn("inprogress", filtered);
  renderColumn("awaitfeedback", filtered);
  renderColumn("done", filtered);
}

/**
 * Filters tasks by query (title + description).
 */
function filterTasks(tasks, query) {
  if (!query) return tasks;

  return tasks.filter((t) => getSearchHaystack(t).includes(query));
}

/**
 * Searchable string from task (title + description).
 * Supports field aliases to be robust across datasets.
 */
function getSearchHaystack(task) {
  const title = String(task?.title || task?.name || "").toLowerCase();
  const desc = String(task?.description || task?.desc || "").toLowerCase();
  return `${title} ${desc}`.trim();
}

/**
 * Shows/hides no-results message.
 */
function renderNoResults(show) {
  const el = document.getElementById("boardNoResults");
  if (!el) return;
  el.hidden = !show;
}

/**
 * Renders one column by status.
 * - Removes old cards
 * - Filters tasks for this column
 * - Toggles empty-state
 * - Appends new cards
 */
function renderColumn(status, tasks) {
  const body = document.querySelector(
    `.board-column[data-status="${status}"] [data-board-body]`
  );
  if (!body) return;

  removeOldCards(body);

  const tasksInCol = tasks.filter((t) => normalizeStatus(t?.status) === status);

  toggleEmptyState(body, tasksInCol.length === 0);

  tasksInCol.forEach((task) => body.appendChild(createCard(task)));
}

/**
 * Removes previously rendered cards only (keeps empty-state element).
 */
function removeOldCards(body) {
  body.querySelectorAll(".board-card").forEach((el) => el.remove());
}

/**
 * Shows empty state only when there are no tasks in the column.
 */
function toggleEmptyState(body, show) {
  const empty = body.querySelector(".board-empty");
  if (!empty) return;
  empty.style.display = show ? "block" : "none";
}

/**
 * Normalizes many possible status strings to our column keys.
 * Handles hyphens/underscores/spaces robustly.
 */
function normalizeStatus(value) {
  const v = String(value || "").trim().toLowerCase();
  const unified = v.replace(/[\s_-]+/g, "-"); // e.g. "in progress" -> "in-progress"

  if (unified === "todo" || unified === "to-do") return "todo";
  if (unified === "in-progress" || unified === "inprogress") return "inprogress";
  if (unified === "await-feedback" || unified === "awaitfeedback") return "awaitfeedback";
  if (unified === "done") return "done";

  // Safe fallback: tasks without/unknown status go to "todo"
  return "todo";
}

/* =========================================================
   Card Rendering (2A + 2B + 2C)
   ========================================================= */

/**
 * Creates a task card element.
 * Uses your existing CSS classes from board.css.
 */
function createCard(task) {
  const el = document.createElement("article");
  el.className = "board-card";
  el.setAttribute("role", "button");
  el.tabIndex = 0;
  el.draggable = true;

  // Helpful for later steps (DnD, detail overlay)
  if (task?.id) el.dataset.taskId = String(task.id);
  wireCardDragHandlers(el);
  wireCardOpenHandlers(el, task);

  // 2A: Category pill
  el.appendChild(createCategoryPill(task));

  // 2A: Title
  const title = document.createElement("h3");
  title.className = "board-card-title";
  title.textContent = task?.title || task?.name || "(No title)";
  el.appendChild(title);

  // 2A: Description preview
  const desc = document.createElement("p");
  desc.className = "board-card-desc";
  desc.textContent = task?.description || task?.desc || "";
  el.appendChild(desc);

  // 2B: Subtasks progress (only visible if subtasks exist)
  const progress = createSubtaskProgress(task);
  if (progress) el.appendChild(progress);

  // 2C: Footer (assigned + prio)
  el.appendChild(createCardFooter(task));

  return el;
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
  meta.appendChild(createMetaRow("Priority", normalizePrioLabel(task?.prio), mapPrioToIcon(task?.prio)));
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
    subtasks.forEach((s) => {
      const row = document.createElement("label");
      row.className = "task-detail-subtask";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = isSubtaskDone(s);
      cb.disabled = true;

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
    await uploadData("tasks", boardState.tasks);
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

/* =========================================================
   Drag & Drop
   ========================================================= */

/**
 * Wires drag/drop handlers for columns once.
 */
function wireDragAndDrop() {
  document.querySelectorAll(".board-column").forEach((column) => {
    column.addEventListener("dragover", handleColumnDragOver);
    column.addEventListener("dragenter", handleColumnDragEnter);
    column.addEventListener("dragleave", handleColumnDragLeave);
    column.addEventListener("drop", handleColumnDrop);
  });
}

/**
 * Adds drag handlers to a card.
 */
function wireCardDragHandlers(card) {
  card.addEventListener("dragstart", handleCardDragStart);
  card.addEventListener("dragend", handleCardDragEnd);
}

function handleCardDragStart(e) {
  const card = e.currentTarget;
  const taskId = card?.dataset?.taskId || "";
  if (taskId) {
    e.dataTransfer?.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    boardState.draggingTaskId = taskId;
  }
  card.classList.add("is-dragging");
}

function handleCardDragEnd(e) {
  const card = e.currentTarget;
  card.classList.remove("is-dragging");
  boardState.draggingTaskId = null;
  clearDropTargets();
}

function handleColumnDragOver(e) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
}

function handleColumnDragEnter(e) {
  const column = e.currentTarget;
  column.classList.add("is-drop-target");
}

function handleColumnDragLeave(e) {
  const column = e.currentTarget;
  const related = e.relatedTarget;

  if (related && column.contains(related)) return;
  column.classList.remove("is-drop-target");
}

function handleColumnDrop(e) {
  e.preventDefault();
  const column = e.currentTarget;
  column.classList.remove("is-drop-target");

  const status = column.dataset.status;
  const taskId =
    e.dataTransfer?.getData("text/plain") || boardState.draggingTaskId;

  if (!status || !taskId) return;
  updateTaskStatus(taskId, status);
}

function clearDropTargets() {
  document
    .querySelectorAll(".board-column.is-drop-target")
    .forEach((col) => col.classList.remove("is-drop-target"));
}

/**
 * Updates task status, renders immediately, then persists.
 */
async function updateTaskStatus(taskId, status) {
  const task = boardState.tasks.find(
    (t) => String(t?.id || "") === String(taskId)
  );
  if (!task) return;

  const previous = task.status;
  if (normalizeStatus(previous) === status) return;

  task.status = status;
  renderBoard();

  const result = await uploadData("tasks", boardState.tasks);
  if (result === null) {
    console.error("[board] failed to persist drag/drop status change");
    task.status = previous;
    renderBoard();
  }
}

/**
 * Category pill: "User Story" or "Technical Task"
 */
function createCategoryPill(task) {
  const category = normalizeCategory(task?.category);

  const pill = document.createElement("div");
  pill.className =
    "board-card-label " +
    (category === "technical"
      ? "board-card-label--technical"
      : "board-card-label--userstory");

  pill.textContent = category === "technical" ? "Technical Task" : "User Story";
  return pill;
}

/**
 * Normalizes category into "technical" or "userstory".
 */
function normalizeCategory(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("technical")) return "technical";
  return "userstory";
}

/**
 * Subtasks progress block (x/y + bar).
 * Returns null if there are no subtasks.
 */
function createSubtaskProgress(task) {
  const subtasks = getSubtasks(task);
  if (subtasks.length === 0) return null;

  const done = subtasks.filter((s) => isSubtaskDone(s)).length;
  const total = subtasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const wrap = document.createElement("div");
  wrap.className = "board-progress";
  wrap.title = `${done} von ${total} Subtasks erledigt`;

  const text = document.createElement("div");
  text.className = "board-progress-text";
  text.textContent = `${done}/${total} Subtasks`;

  const bar = document.createElement("div");
  bar.className = "board-progress-bar";

  const fill = document.createElement("div");
  fill.className = "board-progress-fill";
  fill.style.width = `${percent}%`;

  bar.appendChild(fill);
  wrap.appendChild(text);
  wrap.appendChild(bar);

  return wrap;
}

/**
 * Reads subtasks in a robust way.
 * Supports:
 * - task.subtasks (array)
 * - task.subTasks (array)
 */
function getSubtasks(task) {
  const a = task?.subtasks;
  const b = task?.subTasks;

  if (Array.isArray(a)) return a;
  if (Array.isArray(b)) return b;
  return [];
}

/**
 * Determines if a subtask is done (robust).
 */
function isSubtaskDone(subtask) {
  if (!subtask || typeof subtask !== "object") return false;
  return Boolean(subtask.done || subtask.completed || subtask.isDone);
}

/**
 * Card footer container:
 * left: assigned avatars
 * right: priority icon
 */
function createCardFooter(task) {
  const footer = document.createElement("div");
  footer.className = "board-card-footer";

  footer.appendChild(createAssignedAvatars(task));
  footer.appendChild(createPrioBlock(task));

  return footer;
}

/**
 * Assigned avatars (max 4 +N).
 * Supports assigned values as:
 * - [{ name, color }]
 * - ["Max Mustermann", ...]
 */
function createAssignedAvatars(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-avatars";

  const assigned = getAssigned(task);
  const shown = assigned.slice(0, 4);

  shown.forEach((a) => wrap.appendChild(createAvatarBubble(a)));

  if (assigned.length > 4) {
    wrap.appendChild(createMoreBubble(assigned.length - 4));
  }

  return wrap;
}

/**
 * Extract assigned list in a robust way.
 */
function getAssigned(task) {
  const raw = task?.assigned ?? task?.assignees ?? [];
  if (!Array.isArray(raw)) return [];

  // Normalize each entry into { name, color }
  return raw
    .map((item) => {
      if (!item) return null;

      if (typeof item === "string") {
        return { name: item, color: null };
      }

      if (typeof item === "object") {
        const name = item.name || item.fullName || item.username || "";
        const color = item.color || null;
        return { name, color };
      }

      return null;
    })
    .filter((x) => x && String(x.name || "").trim().length > 0);
}

/**
 * Single avatar bubble with initials.
 */
function createAvatarBubble(person) {
  const s = document.createElement("span");
  s.className = "board-avatar";

  const name = String(person?.name || "").trim();
  s.textContent = getInitials(name);

  // Fallback color if no color exists in dataset
  s.style.background = person?.color || "#2a3647";

  return s;
}

/**
 * +N bubble when more than 4 assigned users exist.
 */
function createMoreBubble(n) {
  const s = document.createElement("span");
  s.className = "board-avatar";
  s.textContent = `+${n}`;
  s.style.background = "#2a3647";
  return s;
}

/**
 * Initials helper: "Max Mustermann" -> "MM"
 */
function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "";

  const a = parts[0][0] || "";
  const b = (parts[parts.length - 1][0] || "");
  return (a + b).toUpperCase();
}

/**
 * Priority block (icon).
 * Uses your existing assets naming:
 * - /img/icons/Prio alta.png
 * - /img/icons/Prio media.png
 * - /img/icons/Prio baja.png
 */
function createPrioBlock(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-prio";

  const img = document.createElement("img");
  img.alt = "Priority";
  img.src = mapPrioToIcon(task?.prio);
  img.onerror = () => {
    img.onerror = null;
    img.src = "/img/icons/Prio-medium.png";
  };

  wrap.appendChild(img);
  return wrap;
}

/**
 * Maps priority value to an icon path.
 * Supports: urgent/high/alta, medium/media, low/baja
 */
function mapPrioToIcon(prio) {
  const v = String(prio || "medium").trim().toLowerCase();
  const simple = v.replace(/[^a-z]/g, "");

  if (
    simple.includes("urgent") ||
    simple.includes("high") ||
    simple.includes("alta")
  ) {
    return "/img/icons/Prio-Urgent.png";
  }
  if (simple.includes("low") || simple.includes("baja")) {
    return "/img/icons/Prio-Low.png";
  }
  if (simple.includes("medium") || simple.includes("media")) {
    return "/img/icons/Prio-medium.png";
  }
  return "/img/icons/Prio-medium.png";
}
