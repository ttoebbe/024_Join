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

// Drag & Drop moved to js/board/draganddrop.js
