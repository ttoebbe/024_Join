const boardState = {
  tasks: [],
  query: "",
  draggingTaskId: null,
};
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

function handleMoveMenuClick(e) {
  if (handleMoveToggleClick(e)) return;
  handleMoveItemClick(e);
}

function handleMoveToggleClick(e) {
  const toggle = e.target.closest("[data-move-toggle]");
  if (!toggle) return false;
  e.stopPropagation();
  toggleMoveMenu(getMoveMenuFromToggle(toggle));
  return true;
}

function getMoveMenuFromToggle(toggle) {
  const card = toggle.closest(".board-card");
  return card?.querySelector(".board-move-menu");
}

function handleMoveItemClick(e) {
  const item = e.target.closest(".board-move-item");
  if (!item) return;
  e.stopPropagation();
  const action = getMoveActionFromItem(item);
  closeAllMoveMenus();
  if (!action) return;
  applyMoveAction(action);
}

function getMoveActionFromItem(item) {
  const menu = item.closest(".board-move-menu");
  const card = item.closest(".board-card");
  const taskId = menu?.dataset.taskId || card?.dataset.taskId;
  const status = item.dataset.moveItem;
  if (!taskId || !status) return null;
  return { taskId, status };
}

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

function findBoardTask(taskId) {
  return boardState.tasks.find((t) => String(t?.id) === String(taskId));
}

function handleMoveMenuOutsideClick(e) {
  if (e.target.closest(".board-move")) return;
  closeAllMoveMenus();
}

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

function filterTasks(tasks, query) {
  if (!query) return tasks;
  return tasks.filter((t) => getSearchHaystack(t).includes(query));
}

function getSearchHaystack(task) {
  const title = String(task?.title || task?.name || "").toLowerCase();
  const desc = String(task?.description || task?.desc || "").toLowerCase();
  return `${title} ${desc}`.trim();
}

function renderNoResults(show) {
  const el = document.getElementById("boardNoResults");
  if (!el) return;
  el.hidden = !show;
}

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

function removeOldCards(body) {
  body.querySelectorAll(".board-card").forEach((el) => el.remove());
}

function toggleEmptyState(body, show) {
  const empty = body.querySelector(".board-empty");
  if (!empty) return;
  empty.style.display = show ? "block" : "none";
}

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
