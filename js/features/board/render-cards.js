function createCard(task) {
  const cardElement = createCardRoot();
  attachCardMeta(cardElement, task);
  appendCardContent(cardElement, task);
  return cardElement;
}

function createCardRoot() {
  const cardElement = document.createElement("article");
  cardElement.className = "board-card";
  cardElement.setAttribute("role", "button");
  cardElement.tabIndex = 0;
  cardElement.draggable = true;
  return cardElement;
}

function attachCardMeta(cardElement, task) {
  if (task?.id) cardElement.dataset.taskId = String(task.id);
  wireCardDragHandlers(cardElement);
  wireCardOpenHandlers(cardElement, task);
}

function appendCardContent(cardElement, task) {
  cardElement.appendChild(createCardMetaRow(task));
  cardElement.appendChild(createCardTitle(task));
  cardElement.appendChild(createCardDescription(task));
  appendCardProgress(cardElement, task);
  cardElement.appendChild(createCardFooter(task));
}

function createCardTitle(task) {
  const title = document.createElement("h3");
  title.className = "board-card-title";
  title.textContent = task?.title || task?.name || "(No title)";
  return title;
}

function createCardDescription(task) {
  const descriptionElement = document.createElement("p");
  descriptionElement.className = "board-card-desc";
  descriptionElement.textContent = task?.description || task?.desc || "";
  return descriptionElement;
}

function appendCardProgress(cardElement, task) {
  const progress = createSubtaskProgress(task);
  if (progress) cardElement.appendChild(progress);
}

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
  img.src = "/assets/img/icons/move-to.svg";
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

function normalizeCategory(value) {
  const normalizedCategory = String(value || "").toLowerCase();
  if (normalizedCategory.includes("technical")) return "technical";
  return "userstory";
}

function createSubtaskProgress(task) {
  const stats = getSubtaskStats(task);
  if (!stats || stats.done === 0) return null;
  return buildProgressWrap(stats);
}

function getSubtaskStats(task) {
  const subtasks = getSubtasks(task);
  if (subtasks.length === 0) return null;
  const done = subtasks.filter((s) => isSubtaskDone(s)).length;
  const total = subtasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

function buildProgressWrap(stats) {
  const wrap = document.createElement("div");
  wrap.className = "board-progress";
  wrap.title = `${stats.done} von ${stats.total} Subtasks erledigt`;
  wrap.appendChild(buildProgressText(stats));
  wrap.appendChild(buildProgressBar(stats));
  return wrap;
}

function buildProgressText(stats) {
  const text = document.createElement("div");
  text.className = "board-progress-text";
  text.textContent = `${stats.done}/${stats.total} Subtasks`;
  return text;
}

function buildProgressBar(stats) {
  const bar = document.createElement("div");
  bar.className = "board-progress-bar";
  bar.appendChild(buildProgressFill(stats));
  return bar;
}

function buildProgressFill(stats) {
  const fill = document.createElement("div");
  fill.className = "board-progress-fill";
  fill.style.width = `${stats.percent}%`;
  return fill;
}

function getSubtasks(task) {
  const primarySubtasks = task?.subtasks;
  const fallbackSubtasks = task?.subTasks;
  if (Array.isArray(primarySubtasks)) return primarySubtasks;
  if (Array.isArray(fallbackSubtasks)) return fallbackSubtasks;
  return [];
}

function isSubtaskDone(subtask) {
  if (!subtask || typeof subtask !== "object") return false;
  return Boolean(subtask.done || subtask.completed || subtask.isDone);
}

function createCardFooter(task) {
  const footer = document.createElement("div");
  footer.className = "board-card-footer";
  footer.appendChild(createAssignedAvatars(task));
  footer.appendChild(createPrioBlock(task));
  return footer;
}

function createAssignedAvatars(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-avatars";
  const assigned = getAssigned(task);
  appendAssignedBubbles(wrap, assigned);
  return wrap;
}

function appendAssignedBubbles(wrap, assigned) {
  assigned.slice(0, 4).forEach((a) => wrap.appendChild(createAvatarBubble(a)));
  if (assigned.length > 4) addMoreBubble(wrap, assigned.length - 4);
}

function addMoreBubble(wrap, remaining) {
  wrap.appendChild(createMoreBubble(remaining));
}

function getAssigned(task) {
  const raw = task?.assigned ?? task?.assignees ?? [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeAssignedItem(item))
    .filter((x) => x && String(x.name || "").trim().length > 0);
}

function normalizeAssignedItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { name: item, color: null };
  if (typeof item === "object") return buildAssignedObject(item);
  return null;
}

function buildAssignedObject(item) {
  const name = item.name || item.fullName || item.username || "";
  const color = item.color || null;
  return { name, color };
}

function createAvatarBubble(person) {
  const avatarElement = document.createElement("span");
  avatarElement.className = "board-avatar";
  const name = String(person?.name || "").trim();
  avatarElement.textContent = getInitials(name);
  avatarElement.style.background = person?.color || "#2a3647";
  return avatarElement;
}

function createMoreBubble(remainingCount) {
  const avatarElement = document.createElement("span");
  avatarElement.className = "board-avatar";
  avatarElement.textContent = `+${remainingCount}`;
  avatarElement.style.background = "#2a3647";
  return avatarElement;
}

function createPrioBlock(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-prio";
  wrap.appendChild(buildPrioImage(task));
  return wrap;
}

function buildPrioImage(task) {
  const img = document.createElement("img");
  img.alt = "Priority";
  img.dataset.prio = normalizePrioKey(task?.prio);
  img.src = mapPrioToIcon(task?.prio);
  img.onerror = () => handlePrioImageError(img);
  return img;
}

function handlePrioImageError(img) {
  img.onerror = null;
  img.dataset.prio = "medium";
  img.src = "/assets/img/icons/Prio-medium.svg";
}

function mapPrioToIcon(prio) {
  const key = normalizePrioKey(prio);
  if (key === "urgent") return "/assets/img/icons/Prio-Urgent.svg";
  if (key === "low") return "/assets/img/icons/Prio-low.svg";
  return "/assets/img/icons/Prio-medium.svg";
}

function normalizePrioKey(prio) {
  const simple = normalizePrioString(prio);
  if (isUrgentPrio(simple)) return "urgent";
  if (isLowPrio(simple)) return "low";
  if (isMediumPrio(simple)) return "medium";
  return "medium";
}

function normalizePrioString(prio) {
  return String(prio || "medium")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function isUrgentPrio(simple) {
  return (
    simple.includes("urgent") ||
    simple.includes("high") ||
    simple.includes("alta")
  );
}

function isLowPrio(simple) {
  return simple.includes("low") || simple.includes("baja");
}

function isMediumPrio(simple) {
  return simple.includes("medium") || simple.includes("media");
}
