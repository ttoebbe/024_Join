/* =========================
   Board (Join) – Firebase based
   - Renders 4 columns
   - Empty state per column
   - Live search (title + description)
   - No results message
   - Drag & Drop desktop (rotation + dashed highlight)
   - Mobile move menu (arrow/popup replacement)
   ========================= */

let boardTasks = [];
let boardContacts = [];
let boardQuery = "";
let draggedTaskId = null;
let selectedTaskId = null;


/**
 * Entry point for board page.
 * Call this after components are loaded.
 */
async function initBoard() {
  wireBoardUi();
  await loadBoardData();
  renderBoard();
}

/** Wires UI events for search and buttons. */
function wireBoardUi() {
  const input = document.getElementById("boardSearchInput");
  const addBtn = document.getElementById("boardAddTaskBtn");

  if (input) input.addEventListener("input", onBoardSearchInput);
  if (addBtn) addBtn.addEventListener("click", () => openAddTaskOverlay());

  wireColumnPlusButtons();
  wireDnD();
  wireCardClicks();
}

/** Handles live search input. */
function onBoardSearchInput(e) {
  boardQuery = (e.target.value || "").trim().toLowerCase();
  renderBoard();
}

/** Opens add task overlay (global hook). */
function openAddTaskOverlay(status) {
  window.dispatchEvent(
    new CustomEvent("join:openAddTaskOverlay", { detail: { status: status || null } })
  );
}

/** Opens task detail overlay (global hook). */
function openAddTaskOverlay(status) {
  window.dispatchEvent(
    new CustomEvent("join:openAddTaskOverlay", {
      detail: { status: status || null },
    })
  );
}

/** Loads tasks & contacts from Firebase via storage.js */
async function loadBoardData() {
  const [tasksRaw, contactsRaw] = await Promise.all([getData("tasks"), getData("contacts")]);
  boardTasks = normalizeToArray(tasksRaw);
  boardContacts = normalizeToArray(contactsRaw);
}

/** Normalizes Firebase object/array into array. */
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}

/** Main render: columns + no-results. */
function renderBoard() {
  const filtered = filterTasks(boardTasks, boardQuery);
  renderNoResults(filtered.length === 0 && boardQuery.length > 0);
  renderColumn("todo", filtered);
  renderColumn("inprogress", filtered);
  renderColumn("awaitfeedback", filtered);
  renderColumn("done", filtered);
}

/** Filters tasks by title/description query. */
function filterTasks(tasks, q) {
  if (!q) return tasks;
  return tasks.filter(t => getSearchHaystack(t).includes(q));
}

/** Builds searchable string (title + description). */
function getSearchHaystack(task) {
  const title = (task.title || task.name || "").toLowerCase();
  const desc = (task.description || task.desc || "").toLowerCase();
  return `${title} ${desc}`.trim();
}

/** Shows/hides no-results message. */
function renderNoResults(show) {
  const el = document.getElementById("boardNoResults");
  if (!el) return;
  el.hidden = !show;
}

/** Renders one column by status. */
function renderColumn(status, tasks) {
  const body = document.querySelector(`.board-column[data-status="${status}"] [data-board-body]`);
  if (!body) return;

  removeOldCards(body);
  const inCol = tasks.filter(t => normalizeStatus(t.status) === status);
  toggleEmptyState(body, inCol.length === 0);

  inCol.forEach(task => body.appendChild(createCard(task)));
}

/** Removes all cards in a column body. */
function removeOldCards(body) {
  body.querySelectorAll(".board-card").forEach(el => el.remove());
}

/** Shows empty state only if no tasks. */
function toggleEmptyState(body, show) {
  const empty = body.querySelector(".board-empty");
  if (!empty) return;
  empty.style.display = show ? "block" : "none";
}

/** Normalizes status values. */
function normalizeStatus(s) {
  const v = (s || "").toLowerCase();
  if (v === "to do" || v === "todo") return "todo";
  if (v === "in progress" || v === "inprogress") return "inprogress";
  if (v === "await feedback" || v === "awaitfeedback") return "awaitfeedback";
  if (v === "done") return "done";
  return "todo";
}

/** Creates a task card element. */
function createCard(task) {
  const el = document.createElement("article");
  el.className = "board-card";
  el.setAttribute("role", "button");
  el.tabIndex = 0;
  el.draggable = true;
  el.dataset.taskId = task.id;

  el.appendChild(createCategoryPill(task));
  el.appendChild(createCardTitle(task));
  el.appendChild(createCardDesc(task));
  el.appendChild(createSubtaskProgress(task));
  el.appendChild(createCardFooter(task));

  return el;
}

/** Category pill (User Story / Technical Task). */
function createCategoryPill(task) {
  const cat = normalizeCategory(task.category);
  const d = document.createElement("div");
  d.className = `board-card-label ${cat === "technical" ? "board-card-label--technical" : "board-card-label--userstory"}`;
  d.textContent = cat === "technical" ? "Technical Task" : "User Story";
  return d;
}

/** Normalizes category values. */
function normalizeCategory(c) {
  const v = (c || "").toLowerCase();
  if (v.includes("technical")) return "technical";
  return "userstory";
}

/** Card title element. */
function createCardTitle(task) {
  const h = document.createElement("h3");
  h.className = "board-card-title";
  h.textContent = task.title || task.name || "(No title)";
  return h;
}

/** Card description preview element. */
function createCardDesc(task) {
  const p = document.createElement("p");
  p.className = "board-card-desc";
  p.textContent = task.description || task.desc || "";
  return p;
}

/** Subtask progress bar + tooltip. */
function createSubtaskProgress(task) {
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  if (subtasks.length === 0) return document.createElement("div");

  const done = subtasks.filter(s => !!s.done).length;
  const total = subtasks.length;
  const percent = Math.round((done / total) * 100);

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

/** Footer with assigned + prio + mobile move menu button. */
function createCardFooter(task) {
  const f = document.createElement("div");
  f.className = "board-card-footer";

  f.appendChild(createAssignedAvatars(task));
  f.appendChild(createPrioAndMove(task));

  return f;
}

/** Assigned bubbles (+N). */
function createAssignedAvatars(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-avatars";

  const assigned = Array.isArray(task.assigned) ? task.assigned : [];
  const shown = assigned.slice(0, 4);

  shown.forEach(a => wrap.appendChild(createAvatarBubble(a)));
  if (assigned.length > 4) wrap.appendChild(createMoreBubble(assigned.length - 4));

  return wrap;
}

/** Single avatar bubble. */
function createAvatarBubble(a) {
  const s = document.createElement("span");
  s.className = "board-avatar";
  const name = a.name || a.fullName || "";
  s.textContent = getInitials(name);
  if (a.color) s.style.background = a.color;
  return s;
}

/** +N bubble. */
function createMoreBubble(n) {
  const s = document.createElement("span");
  s.className = "board-avatar";
  s.textContent = `+${n}`;
  return s;
}

/** Initials helper. */
function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const a = parts[0][0] || "";
  const b = (parts[parts.length - 1][0] || "");
  return (a + b).toUpperCase();
}

/** Prio icon + move menu button (mobile alternative). */
function createPrioAndMove(task) {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "10px";

  const prio = document.createElement("div");
  prio.className = "board-prio";
  prio.appendChild(createPrioIcon(task.prio));

  const move = document.createElement("button");
  move.type = "button";
  move.className = "board-move-btn";
  move.setAttribute("aria-label", "Move task");
  move.textContent = "▾";
  move.addEventListener("click", (e) => {
    e.stopPropagation();
    openMoveMenu(move, task.id);
  });

  wrap.appendChild(prio);
  wrap.appendChild(move);
  return wrap;
}

/** Creates prio icon element (placeholder if you map icons later). */
function createPrioIcon(prio) {
  const img = document.createElement("img");
  img.alt = "Priority";
  img.src = mapPrioToIcon(prio);
  return img;
}

/** Maps prio to icon path (adjust to your real assets). */
function mapPrioToIcon(prio) {
  const v = (prio || "medium").toLowerCase();
  if (v === "urgent") return "/imgs/icons/Prio alta.png";
  if (v === "low") return "/imgs/icons/Prio baja.png";
  return "/imgs/icons/Prio media.png";
}

/** Column plus buttons: open add overlay with preselected status (except done). */
function wireColumnPlusButtons() {
  document.querySelectorAll(".board-column-add").forEach((btn) => {
    const col = btn.closest(".board-column");
    const status = col?.dataset?.status;
    if (!status) return;

    // Done hat keinen Plus-Button (sicherheitscheck)
    if (status === "done") {
      btn.remove();
      return;
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openAddTaskOverlay(status); // Status der Spalte vorgeben
    });
  });
}


/** Card click opens detail overlay. */
function wireCardClicks() {
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".board-card");
    if (!card) return;

    // Klick auf Move-Button oder Menü soll NICHT selektieren
    if (e.target.closest(".board-move-btn") || e.target.closest("#boardMoveMenu")) return;

    selectCard(card.dataset.taskId);
  });
}

function selectCard(taskId) {
  selectedTaskId = taskId || null;

  document.querySelectorAll(".board-card").forEach(c => c.classList.remove("is-selected"));
  const selectedEl = document.querySelector(`.board-card[data-task-id="${CSS.escape(taskId)}"]`);
  if (selectedEl) selectedEl.classList.add("is-selected");
}

/** Drag & Drop wiring for desktop. */
function wireDnD() {
  document.addEventListener("dragstart", onDragStart);
  document.addEventListener("dragend", onDragEnd);

  document.querySelectorAll(".board-column").forEach(col => {
    col.addEventListener("dragover", (e) => onDragOver(e, col));
    col.addEventListener("dragleave", () => col.classList.remove("is-drop-target"));
    col.addEventListener("drop", (e) => onDrop(e, col));
  });
}

/** Drag start handler. */
function onDragStart(e) {
  const card = e.target.closest(".board-card");
  if (!card) return;
  draggedTaskId = card.dataset.taskId;
  card.classList.add("is-dragging");
  e.dataTransfer?.setData("text/plain", draggedTaskId || "");
}

/** Drag end handler. */
function onDragEnd(e) {
  const card = e.target.closest(".board-card");
  if (card) card.classList.remove("is-dragging");
  draggedTaskId = null;
  document.querySelectorAll(".board-column").forEach(c => c.classList.remove("is-drop-target"));
}

/** Drag over: show dashed highlight. */
function onDragOver(e, col) {
  e.preventDefault();
  col.classList.add("is-drop-target");
}

/** Drop: update status in Firebase and re-render. */
async function onDrop(e, col) {
  e.preventDefault();
  col.classList.remove("is-drop-target");

  const status = col.dataset.status;
  const id = draggedTaskId || e.dataTransfer?.getData("text/plain");
  if (!status || !id) return;

  await updateTaskStatus(id, status);
  await loadBoardData();
  renderBoard();
}

/** Updates one task status and PUTs tasks back (array). */
async function updateTaskStatus(taskId, status) {
  const idx = boardTasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  boardTasks[idx] = { ...boardTasks[idx], status };
  await uploadData("tasks", boardTasks);
}

/** Mobile move menu (popup). */
function openMoveMenu(anchor, taskId) {
  closeMoveMenu();
  const menu = buildMoveMenu(taskId);
  positionMenu(menu, anchor);
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener("click", closeMoveMenu, { once: true }), 0);
}

/** Builds move menu element. */
function buildMoveMenu(taskId) {
  const menu = document.createElement("div");
  menu.id = "boardMoveMenu";
  menu.style.position = "absolute";
  menu.style.zIndex = "9999";
  menu.style.background = "#fff";
  menu.style.border = "1px solid #d1d1d1";
  menu.style.borderRadius = "10px";
  menu.style.padding = "6px";
  menu.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";

  addMoveOption(menu, taskId, "todo", "To do");
  addMoveOption(menu, taskId, "inprogress", "In progress");
  addMoveOption(menu, taskId, "awaitfeedback", "Await feedback");
  addMoveOption(menu, taskId, "done", "Done");

  return menu;
}

/** Adds a single move option. */
function addMoveOption(menu, taskId, status, label) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.style.display = "block";
  b.style.width = "100%";
  b.style.textAlign = "left";
  b.style.border = "none";
  b.style.background = "transparent";
  b.style.padding = "8px 10px";
  b.style.cursor = "pointer";
  b.addEventListener("click", async (e) => {
    e.stopPropagation();
    await updateTaskStatus(taskId, status);
    await loadBoardData();
    renderBoard();
    closeMoveMenu();
  });
  menu.appendChild(b);
}

/** Positions menu under anchor. */
function positionMenu(menu, anchor) {
  const r = anchor.getBoundingClientRect();
  menu.style.left = `${Math.round(r.left + window.scrollX)}px`;
  menu.style.top = `${Math.round(r.bottom + window.scrollY + 6)}px`;
}

/** Closes move menu. */
function closeMoveMenu() {
  document.getElementById("boardMoveMenu")?.remove();
}

/* Start board after DOM ready */
document.addEventListener("DOMContentLoaded", initBoard);

function wireBoardAddButtons() {
  // Top right add button
  document.getElementById("boardAddTaskBtn")
    ?.addEventListener("click", () => openAddTaskOverlay("todo"));

  // Column plus buttons
  document.querySelectorAll(".board-column-add").forEach(btn => {
    const col = btn.closest(".board-column");
    const status = col?.dataset?.status;
    if (!status || status === "done") return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openAddTaskOverlay(status);
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  console.log("[board] wiring overlay buttons");

  document.addEventListener("click", (e) => {
    // Top right Add task
    if (e.target.closest("#boardAddTaskBtn")) {
      if (typeof openAddTaskOverlay !== "function") {
        console.error("openAddTaskOverlay is not available");
        return;
      }
      openAddTaskOverlay("todo");
      return;
    }

    // Column plus buttons
    const btn = e.target.closest(".board-column-add");
    if (!btn) return;

    const col = btn.closest(".board-column");
    const status = col?.dataset?.status;
    if (!status || status === "done") return;

    if (typeof openAddTaskOverlay !== "function") {
      console.error("openAddTaskOverlay is not available");
      return;
    }
    openAddTaskOverlay(status);
  });
});


