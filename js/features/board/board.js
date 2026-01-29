const boardState = {
  tasks: [],
  query: "",
  draggingTaskId: null,
};

// Initialize board when the DOM is ready.
document.addEventListener("DOMContentLoaded", handleBoardReady);

function handleBoardReady() {
  withPageReady(initBoard);
}

async function initBoard() {
  wireBoardUi();
  wireDragAndDrop();
  await loadTasks();
  renderBoard();
}

function wireBoardUi() {
  const input = document.getElementById("boardSearchInput");
  if (input) {
    input.addEventListener("input", (e) => {
      boardState.query = String(e.target.value || "")
        .trim()
        .toLowerCase();
      renderBoard();
    });
  }
  wireAddTaskButtons();
  wireMoveMenus();
}

function wireMoveMenus() {
  const board = document.querySelector(".board-columns");
  if (!board) return;
  board.addEventListener("click", (e) => handleMoveMenuClick(e));
  document.addEventListener("click", (e) => handleMoveMenuOutsideClick(e));
}

/**
 * Handles move menu click events.
 * @param {Event} e
 */
function handleMoveMenuClick(e) {
  if (handleMoveToggleClick(e)) return;
  handleMoveItemClick(e);
}

/**
 * Handles move toggle clicks.
 * @param {Event} e
 * @returns {boolean}
 */
function handleMoveToggleClick(e) {
  const toggle = e.target.closest("[data-move-toggle]");
  if (!toggle) return false;
  e.stopPropagation();
  toggleMoveMenu(getMoveMenuFromToggle(toggle));
  return true;
}

/**
 * Gets the move menu element from a toggle.
 * @param {Element} toggle
 * @returns {HTMLElement|null}
 */
function getMoveMenuFromToggle(toggle) {
  const card = toggle.closest(".board-card");
  return card?.querySelector(".board-move-menu");
}

/**
 * Handles move item clicks.
 * @param {Event} e
 */
function handleMoveItemClick(e) {
  const item = e.target.closest(".board-move-item");
  if (!item) return;
  e.stopPropagation();
  const action = getMoveActionFromItem(item);
  closeAllMoveMenus();
  if (!action) return;
  applyMoveAction(action);
}

/**
 * Builds a move action from a menu item.
 * @param {Element} item
 * @returns {{ taskId: string, status: string }|null}
 */
function getMoveActionFromItem(item) {
  const menu = item.closest(".board-move-menu");
  const card = item.closest(".board-card");
  const taskId = menu?.dataset.taskId || card?.dataset.taskId;
  const status = item.dataset.moveItem;
  if (!taskId || !status) return null;
  return { taskId, status };
}

/**
 * Applies a move action to a task.
 * @param {{ taskId: string, status: string }} action
 */
function applyMoveAction({ taskId, status }) {
  if (typeof updateTaskStatus === "function") {
    updateTaskStatus(taskId, status);
    return;
  }
  if (!TaskService?.update) return;
  const task = findBoardTask(taskId);
  if (!task) return;
  task.status = status;
  renderBoard();
  TaskService.update(task.id, task);
}

/**
 * Finds a task in the board state.
 * @param {string} taskId
 * @returns {Object|undefined}
 */
function findBoardTask(taskId) {
  return boardState.tasks.find((t) => String(t?.id) === String(taskId));
}

/**
 * Handles outside clicks to close menus.
 * @param {Event} e
 */
function handleMoveMenuOutsideClick(e) {
  if (e.target.closest(".board-move")) return;
  closeAllMoveMenus();
}

/**
 * Toggles a move menu open state.
 * @param {HTMLElement} menu
 */
function toggleMoveMenu(menu) {
  if (!menu) return;
  const isOpen = menu.classList.contains("is-open");
  closeAllMoveMenus();
  if (isOpen) return;
  menu.classList.add("is-open");
  menu.setAttribute("aria-hidden", "false");
}

function closeAllMoveMenus() {
  document.querySelectorAll(".board-move-menu.is-open").forEach((menu) => {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
  });
}

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
 * Splits tasks into valid/invalid lists.
 * @param {Array} tasks
 * @returns {{ validTasks: Array, invalidTasks: Array }}
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

/**
 * Checks if a task has a title.
 * @param {Object} task
 * @returns {boolean}
 */
function hasTaskTitle(task) {
  return String(task?.title || task?.name || "").trim().length > 0;
}

/**
 * Deletes invalid tasks from persistence.
 * @param {Array} tasks
 */
async function deleteInvalidTasks(tasks) {
  if (!tasks.length || !TaskService?.delete) return;
  await Promise.allSettled(
    tasks
      .map((task) => task?.id)
      .filter((id) => id !== undefined && id !== null && id !== "")
      .map((id) => TaskService.delete(id)),
  );
}

function renderBoard() {
  const filtered = filterTasks(boardState.tasks, boardState.query);
  renderNoResults(boardState.query.length > 0 && filtered.length === 0);
  renderColumn("todo", filtered);
  renderColumn("inprogress", filtered);
  renderColumn("awaitfeedback", filtered);
  renderColumn("done", filtered);
}

/**
 * Filters tasks by a search query.
 * @param {Array} tasks
 * @param {string} query
 * @returns {Array}
 */
function filterTasks(tasks, query) {
  if (!query) return tasks;
  return tasks.filter((t) => getSearchHaystack(t).includes(query));
}

/**
 * Builds a search haystack for a task.
 * @param {Object} task
 * @returns {string}
 */
function getSearchHaystack(task) {
  const title = String(task?.title || task?.name || "").toLowerCase();
  const desc = String(task?.description || task?.desc || "").toLowerCase();
  return `${title} ${desc}`.trim();
}

/**
 * Shows or hides the no-results message.
 * @param {boolean} show
 */
function renderNoResults(show) {
  const el = document.getElementById("boardNoResults");
  if (!el) return;
  el.hidden = !show;
}

/**
 * Renders a board column by status.
 * @param {string} status
 * @param {Array} tasks
 */
function renderColumn(status, tasks) {
  const body = document.querySelector(
    `.board-column[data-status="${status}"] [data-board-body]`,
  );
  if (!body) return;
  removeOldCards(body);
  const tasksInCol = tasks.filter((t) => normalizeStatus(t?.status) === status);
  toggleEmptyState(body, tasksInCol.length === 0);
  tasksInCol.forEach((task) => body.appendChild(createCard(task)));
}

/**
 * Removes old cards from a column body.
 * @param {HTMLElement} body
 */
function removeOldCards(body) {
  body.querySelectorAll(".board-card").forEach((el) => el.remove());
}

/**
 * Toggles the empty state in a column.
 * @param {HTMLElement} body
 * @param {boolean} show
 */
function toggleEmptyState(body, show) {
  const empty = body.querySelector(".board-empty");
  if (!empty) return;
  empty.style.display = show ? "block" : "none";
}

/**
 * Normalizes a status value.
 * @param {string} value
 * @returns {string}
 */
function normalizeStatus(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  const unified = v.replace(/[\s_-]+/g, "-");
  if (unified === "todo" || unified === "to-do") return "todo";
  if (unified === "in-progress" || unified === "inprogress")
    return "inprogress";
  if (unified === "await-feedback" || unified === "awaitfeedback")
    return "awaitfeedback";
  if (unified === "done") return "done";
  return "todo";
}
