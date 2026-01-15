"use strict";

const $id = (id) => document.getElementById(id);

function loadCurrentUser() {
  return getCurrentUser();
}

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

function isUrgent(task) {
  return String(task?.priority || "").toLowerCase().trim() === "high";
}

function parseDueDate(task) {
  const raw = task?.dueDate;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

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

function calcKPIs(tasks) {
  const kpi = initKpi(tasks);
  const urgentOpenDates = [];
  tasks.forEach((t) => updateKpiForTask(kpi, t, urgentOpenDates));
  setNextUrgentDeadline(kpi, urgentOpenDates);
  return kpi;
}

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

function updateKpiForTask(kpi, task, urgentOpenDates) {
  const status = String(task?.status || "").toLowerCase().trim();
  incrementStatusCount(kpi, status);
  trackUrgentOpen(kpi, task, status, urgentOpenDates);
}

function incrementStatusCount(kpi, status) {
  if (status === "todo") kpi.todo++;
  else if (status === "in-progress") kpi.inProgress++;
  else if (status === "await-feedback") kpi.awaiting++;
  else if (status === "done") kpi.done++;
}

function trackUrgentOpen(kpi, task, status, urgentOpenDates) {
  if (!isUrgent(task) || status === "done") return;
  kpi.urgentOpen++;
  const d = parseDueDate(task);
  if (d) urgentOpenDates.push(d);
}

function setNextUrgentDeadline(kpi, urgentOpenDates) {
  urgentOpenDates.sort((a, b) => a - b);
  kpi.nextUrgentDeadline = urgentOpenDates[0] || null;
}

function renderUser(user) {
  const greeting = getTimeBasedGreeting(new Date());
  setText("greetingText", user?.guest ? `${greeting}!` : `${greeting},`);
  if ($id("userName")) setText("userName", user?.name || "Guest");
  if ($id("userInitials")) setText("userInitials", getInitials(user?.name || "Guest"));
}

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

async function initSummary() {
  const user = loadCurrentUser();
  if (!user) return redirectToLogin();
  renderUser(user);
  const tasks = await loadTasks();
  renderKPIs(calcKPIs(tasks));
}

function redirectToLogin() {
  window.location.href = ROUTES.LOGIN;
}

document.addEventListener("DOMContentLoaded", () => {
  initSummary().catch((err) => console.error("Summary init error:", err));
});
