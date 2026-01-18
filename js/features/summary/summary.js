"use strict";

/**
 * @param {*} id
 * @returns {*}
 */
function $id(id) {
  return document.getElementById(id);
}

/**
 * @returns {*}
 */
function loadCurrentUser() {
  return getCurrentUser();
}

/**
 * @returns {*}
 */
async function loadTasks() {
  try {
    const firebaseData = await TaskService.getAll();
    const tasks = normalizeTasks(firebaseData);
    return tasks;
  } catch (error) {
    console.error("Error loading tasks:", error);
    return [];
  }
}

/**
 * @param {*} task
 * @returns {*}
 */
function isUrgent(task) {
  return String(task?.priority || "").toLowerCase().trim() === "high";
}

/**
 * @param {*} task
 * @returns {*}
 */
function parseDueDate(task) {
  const raw = task?.dueDate;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {*} dateObj
 * @returns {*}
 */
function formatDateLong(dateObj) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  } catch {
    return dateObj.toISOString().slice(0, 10);
  }
}

/**
 * @param {*} tasks
 * @returns {*}
 */
function calcKPIs(tasks) {
  const kpi = initKpi(tasks);
  const urgentOpenDates = [];
  for (const task of tasks) {
    updateKpiForTask(kpi, task, urgentOpenDates);
  }
  setNextUrgentDeadline(kpi, urgentOpenDates);
  return kpi;
}

/**
 * @param {*} tasks
 * @returns {*}
 */
function initKpi(tasks) {
  return {
    board: tasks.length,
    todo: 0,
    inProgress: 0,
    awaiting: 0,
    done: 0,
    urgentOpen: 0,
    nextUrgentDeadline: null,
  };
}

/**
 * @param {*} kpi
 * @param {*} task
 * @param {*} urgentOpenDates
 * @returns {*}
 */
function updateKpiForTask(kpi, task, urgentOpenDates) {
  const status = String(task?.status || "").toLowerCase().trim();
  incrementStatusCount(kpi, status);
  trackUrgentOpen(kpi, task, status, urgentOpenDates);
}

/**
 * @param {*} kpi
 * @param {*} status
 * @returns {*}
 */
function incrementStatusCount(kpi, status) {
  if (status === "todo") kpi.todo++;
  else if (status === "in-progress") kpi.inProgress++;
  else if (status === "await-feedback") kpi.awaiting++;
  else if (status === "done") kpi.done++;
}

/**
 * @param {*} kpi
 * @param {*} task
 * @param {*} status
 * @param {*} urgentOpenDates
 * @returns {*}
 */
function trackUrgentOpen(kpi, task, status, urgentOpenDates) {
  if (!isUrgent(task) || status === "done") return;
  kpi.urgentOpen++;
  const d = parseDueDate(task);
  if (d) urgentOpenDates.push(d);
}

/**
 * @param {*} kpi
 * @param {*} urgentOpenDates
 * @returns {*}
 */
function setNextUrgentDeadline(kpi, urgentOpenDates) {
  urgentOpenDates.sort((a, b) => {
    return a - b;
  });
  kpi.nextUrgentDeadline = urgentOpenDates[0] || null;
}

/**
 * @param {*} user
 * @returns {*}
 */
function renderUser(user) {
  const greeting = getTimeBasedGreeting(new Date());
  setText("greetingText", user?.guest ? `${greeting}!` : `${greeting},`);
  if ($id("userName")) setText("userName", user?.name || "Guest");
  if ($id("userInitials")) setText("userInitials", getInitials(user?.name || "Guest"));
}

/**
 * @param {*} kpi
 * @returns {*}
 */
function renderKPIs(kpi) {
  setText("countTodo", String(kpi.todo));
  setText("countDone", String(kpi.done));
  setText("countInProgress", String(kpi.inProgress));
  setText("countAwaiting", String(kpi.awaiting));
  setText("countUrgent", String(kpi.urgentOpen));
  if ($id("countBoard")) setText("countBoard", String(kpi.board));
  setText(
    "nextDeadlineDate",
    kpi.nextUrgentDeadline ? formatDateLong(kpi.nextUrgentDeadline) : "—"
  );
}

/**
 * @returns {*}
 */
async function initSummary() {
  const user = loadCurrentUser();
  if (!user) return redirectToLogin();
  renderUser(user);
  const tasks = await loadTasks();
  renderKPIs(calcKPIs(tasks));
}

/**
 * @returns {*}
 */
function redirectToLogin() {
  window.location.href = ROUTES.LOGIN;
}

document.addEventListener("DOMContentLoaded", () => {
  initSummary().catch((err) => {
    console.error("Summary init error:", err);
  });
});
