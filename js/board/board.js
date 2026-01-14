/* =========================================================
   Board (Join) – Clean rebuild (Render-focused)
   - Load tasks via TaskService
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
// moved to js/board/createTask.js

/**
 * Loads tasks from Firebase.
 */
async function loadTasks() {
  try {
    const raw = await TaskService.getAll();
    const normalized = normalizeTasks(raw);
    const { validTasks, invalidTasks } = splitValidTasks(normalized);
    await deleteInvalidTasks(invalidTasks);
    boardState.tasks = validTasks;

  } catch (err) {
    boardState.tasks = [];
  }
}

/**
 * Normalizes Firebase-like data into an array.
 * - arrays stay arrays (filtered)
 * - objects become Object.values(...)
 */

/**
 * Splits tasks into valid and invalid buckets (missing title/name).
 */
function splitValidTasks(tasks) {
  const validTasks = [];
  const invalidTasks = [];

  tasks.forEach((task) => {
    if (hasTaskTitle(task)) {
      validTasks.push(task);
    } else {
      invalidTasks.push(task);
    }
  });

  return { validTasks, invalidTasks };
}

function hasTaskTitle(task) {
  return String(task?.title || task?.name || "").trim().length > 0;
}

async function deleteInvalidTasks(tasks) {
  if (!tasks.length || !TaskService?.delete) return;
  await Promise.allSettled(
    tasks
      .map((task) => task?.id)
      .filter((id) => id !== undefined && id !== null && id !== "")
      .map((id) => TaskService.delete(id))
  );
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

  // Helpful for later steps (drag and drop, detail overlay)
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

// Drag & Drop moved to js/board/draganddrop.js

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
  img.dataset.prio = normalizePrioKey(task?.prio);
  img.src = mapPrioToIcon(task?.prio);
  img.onerror = () => {
    img.onerror = null;
    img.dataset.prio = "medium";
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
  const key = normalizePrioKey(prio);
  if (key === "urgent") return "/img/icons/Prio-Urgent.png";
  if (key === "low") return "/img/icons/Prio-Low.png";
  return "/img/icons/Prio-medium.png";
}

/**
 * Normalizes priority to a small set of keys.
 */
function normalizePrioKey(prio) {
  const v = String(prio || "medium").trim().toLowerCase();
  const simple = v.replace(/[^a-z]/g, "");

  if (
    simple.includes("urgent") ||
    simple.includes("high") ||
    simple.includes("alta")
  ) {
    return "urgent";
  }
  if (simple.includes("low") || simple.includes("baja")) {
    return "low";
  }
  if (simple.includes("medium") || simple.includes("media")) {
    return "medium";
  }
  return "medium";
}
