/**
 * Creates the category pill element.
 * @param {Object} task
 * @returns {HTMLElement}
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
 * Creates the card meta row.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createCardMetaRow(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-card-meta";
  wrap.appendChild(createCategoryPill(task));
  wrap.appendChild(createMoveToMenu(task));
  return wrap;
}

/**
 * Creates the move-to menu wrapper.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createMoveToMenu(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-move";
  wrap.appendChild(createMoveToButton(task));
  wrap.appendChild(createMoveToList(task));
  return wrap;
}

/**
 * Creates the move-to button.
 * @param {Object} task
 * @returns {HTMLButtonElement}
 */
function createMoveToButton(task) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "board-move-btn";
  btn.dataset.moveToggle = "true";
  if (task?.id) btn.dataset.taskId = String(task.id);
  const img = document.createElement("img");
  img.src = "/assets/img/icons/move-to.svg";
  img.alt = "Move to";
  btn.appendChild(img);
  return btn;
}

/**
 * Creates the move-to list.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createMoveToList(task) {
  const menu = document.createElement("div");
  menu.className = "board-move-menu";
  if (task?.id) menu.dataset.taskId = String(task.id);
  menu.setAttribute("aria-hidden", "true");
  menu.appendChild(createMoveToItem("todo", "To-do"));
  menu.appendChild(createMoveToItem("inprogress", "In progress"));
  menu.appendChild(createMoveToItem("awaitfeedback", "Await feedback"));
  menu.appendChild(createMoveToItem("done", "Done"));
  return menu;
}

/**
 * Creates a move-to list item.
 * @param {string} status
 * @param {string} label
 * @returns {HTMLButtonElement}
 */
function createMoveToItem(status, label) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "board-move-item";
  btn.dataset.moveItem = status;
  btn.textContent = label;
  return btn;
}

/**
 * Normalizes a category value.
 * @param {string} value
 * @returns {string}
 */
function normalizeCategory(value) {
  const normalizedCategory = String(value || "").toLowerCase();
  if (normalizedCategory.includes("technical")) return "technical";
  return "userstory";
}
