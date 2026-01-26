/* =========================================================
   Card Rendering (2A + 2B + 2C)
   ========================================================= */
/**
 * Creates a task card element.
 * Uses your existing CSS classes from board.css.
 */
function createCard(task) {
  const el = createCardRoot();
  attachCardMeta(el, task);
  appendCardContent(el, task);
  return el;
}
/**
 * @returns {*}
 */
function createCardRoot() {
  const el = document.createElement("article");
  el.className = "board-card";
  el.setAttribute("role", "button");
  el.tabIndex = 0;
  el.draggable = true;
  return el;
}
/**
 * @param {*} el
 * @param {*} task
 * @returns {*}
 */
function attachCardMeta(el, task) {
  if (task?.id) el.dataset.taskId = String(task.id);
  wireCardDragHandlers(el);
  wireCardOpenHandlers(el, task);
}
/**
 * @param {*} el
 * @param {*} task
 * @returns {*}
 */
function appendCardContent(el, task) {
  el.appendChild(createCardMetaRow(task));
  el.appendChild(createCardTitle(task));
  el.appendChild(createCardDescription(task));
  appendCardProgress(el, task);
  el.appendChild(createCardFooter(task));
}
/**
 * @param {*} task
 * @returns {*}
 */
function createCardTitle(task) {
  const title = document.createElement("h3");
  title.className = "board-card-title";
  title.textContent = task?.title || task?.name || "(No title)";
  return title;
}
/**
 * @param {*} task
 * @returns {*}
 */
function createCardDescription(task) {
  const desc = document.createElement("p");
  desc.className = "board-card-desc";
  desc.textContent = task?.description || task?.desc || "";
  return desc;
}
/**
 * @param {*} el
 * @param {*} task
 * @returns {*}
 */
function appendCardProgress(el, task) {
  const progress = createSubtaskProgress(task);
  if (progress) el.appendChild(progress);
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

function createCardMetaRow(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-card-meta";
  wrap.appendChild(createCategoryPill(task));
  wrap.appendChild(createMoveToMenu(task));
  return wrap;
}

function createMoveToMenu(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-move";
  wrap.appendChild(createMoveToButton(task));
  wrap.appendChild(createMoveToList(task));
  return wrap;
}

function createMoveToButton(task) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "board-move-btn";
  btn.dataset.moveToggle = "true";
  if (task?.id) btn.dataset.taskId = String(task.id);
  const img = document.createElement("img");
  img.src = "/assets/img/icons/move-to.png";
  img.alt = "Move to";
  btn.appendChild(img);
  return btn;
}

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

function createMoveToItem(status, label) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "board-move-item";
  btn.dataset.moveItem = status;
  btn.textContent = label;
  return btn;
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
  const stats = getSubtaskStats(task);
  if (!stats || stats.done === 0) return null;
  return buildProgressWrap(stats);
}
/**
 * @param {*} task
 * @returns {*}
 */
function getSubtaskStats(task) {
  const subtasks = getSubtasks(task);
  if (subtasks.length === 0) return null;
  const done = subtasks.filter((s) => isSubtaskDone(s)).length;
  const total = subtasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}
/**
 * @param {*} stats
 * @returns {*}
 */
function buildProgressWrap(stats) {
  const wrap = document.createElement("div");
  wrap.className = "board-progress";
  wrap.title = `${stats.done} von ${stats.total} Subtasks erledigt`;
  wrap.appendChild(buildProgressText(stats));
  wrap.appendChild(buildProgressBar(stats));
  return wrap;
}
/**
 * @param {*} stats
 * @returns {*}
 */
function buildProgressText(stats) {
  const text = document.createElement("div");
  text.className = "board-progress-text";
  text.textContent = `${stats.done}/${stats.total} Subtasks`;
  return text;
}
/**
 * @param {*} stats
 * @returns {*}
 */
function buildProgressBar(stats) {
  const bar = document.createElement("div");
  bar.className = "board-progress-bar";
  bar.appendChild(buildProgressFill(stats));
  return bar;
}
/**
 * @param {*} stats
 * @returns {*}
 */
function buildProgressFill(stats) {
  const fill = document.createElement("div");
  fill.className = "board-progress-fill";
  fill.style.width = `${stats.percent}%`;
  return fill;
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
  appendAssignedBubbles(wrap, assigned);
  return wrap;
}
/**
 * @param {*} wrap
 * @param {*} assigned
 * @returns {*}
 */
function appendAssignedBubbles(wrap, assigned) {
  assigned.slice(0, 4).forEach((a) => wrap.appendChild(createAvatarBubble(a)));
  if (assigned.length > 4) addMoreBubble(wrap, assigned.length - 4);
}
/**
 * @param {*} wrap
 * @param {*} remaining
 * @returns {*}
 */
function addMoreBubble(wrap, remaining) {
  wrap.appendChild(createMoreBubble(remaining));
}
/**
 * Extract assigned list in a robust way.
 */
function getAssigned(task) {
  const raw = task?.assigned ?? task?.assignees ?? [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeAssignedItem(item))
    .filter((x) => x && String(x.name || "").trim().length > 0);
}
/**
 * @param {*} item
 * @returns {*}
 */
function normalizeAssignedItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { name: item, color: null };
  if (typeof item === "object") return buildAssignedObject(item);
  return null;
}
/**
 * @param {*} item
 * @returns {*}
 */
function buildAssignedObject(item) {
  const name = item.name || item.fullName || item.username || "";
  const color = item.color || null;
  return { name, color };
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
 * Priority block (icon).
 * Uses your existing assets naming:
 * - /assets/img/icons/Prio alta.png
 * - /assets/img/icons/Prio media.png
 * - /assets/img/icons/Prio baja.png
 */
function createPrioBlock(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-prio";
  wrap.appendChild(buildPrioImage(task));
  return wrap;
}
/**
 * @param {*} task
 * @returns {*}
 */
function buildPrioImage(task) {
  const img = document.createElement("img");
  img.alt = "Priority";
  img.dataset.prio = normalizePrioKey(task?.prio);
  img.src = mapPrioToIcon(task?.prio);
  img.onerror = () => handlePrioImageError(img);
  return img;
}
/**
 * @param {*} img
 * @returns {*}
 */
function handlePrioImageError(img) {
  img.onerror = null;
  img.dataset.prio = "medium";
  img.src = "/assets/img/icons/Prio-medium.png";
}
/**
 * Maps priority value to an icon path.
 * Supports: urgent/high/alta, medium/media, low/baja
 */
function mapPrioToIcon(prio) {
  const key = normalizePrioKey(prio);
  if (key === "urgent") return "/assets/img/icons/Prio-Urgent.png";
  if (key === "low") return "/assets/img/icons/Prio-Low.png";
  return "/assets/img/icons/Prio-medium.png";
}
/**
 * Normalizes priority to a small set of keys.
 */
function normalizePrioKey(prio) {
  const simple = normalizePrioString(prio);
  if (isUrgentPrio(simple)) return "urgent";
  if (isLowPrio(simple)) return "low";
  if (isMediumPrio(simple)) return "medium";
  return "medium";
}
/**
 * @param {*} prio
 * @returns {*}
 */
function normalizePrioString(prio) {
  return String(prio || "medium").trim().toLowerCase().replace(/[^a-z]/g, "");
}
/**
 * @param {*} simple
 * @returns {*}
 */
function isUrgentPrio(simple) {
  return simple.includes("urgent") || simple.includes("high") || simple.includes("alta");
}
/**
 * @param {*} simple
 * @returns {*}
 */
function isLowPrio(simple) {
  return simple.includes("low") || simple.includes("baja");
}
/**
 * @param {*} simple
 * @returns {*}
 */
function isMediumPrio(simple) {
  return simple.includes("medium") || simple.includes("media");
}

