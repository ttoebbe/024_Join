"use strict";

const LS_CURRENT_USER = "join_current_user";
const LOGIN_URL = "/pages/login.html";
const $id = (id) => document.getElementById(id);

function setText(id, value) {
  const el = $id(id);
  if (el) el.textContent = value ?? "";
}

function loadCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(LS_CURRENT_USER));
  } catch {
    return null;
  }
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "G";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function greetingByTime(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 18) return "Good afternoon";
  if (h >= 18 && h < 22) return "Good evening";
  return "Good night";
}

function normalizeTasks(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);

  if (typeof data === "object") {
    return Object.values(data).filter((v) => v && typeof v === "object");
  }
  return [];
}

async function loadTasks() {
  if (typeof window.getData === "function") {
    const firebaseData = await window.getData("tasks");
    const tasks = normalizeTasks(firebaseData);
    if (tasks.length) return tasks;
  }

  if (Array.isArray(window.tasks)) return window.tasks;

  return [];
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
  const kpi = {
    board: tasks.length,
    todo: 0,
    inProgress: 0,
    awaiting: 0,
    done: 0,
    urgentOpen: 0,
    nextUrgentDeadline: null,
  };

  const urgentOpenDates = [];

  for (const t of tasks) {
    const status = String(t?.status || "").toLowerCase().trim();

    if (status === "todo") kpi.todo++;
    else if (status === "in-progress") kpi.inProgress++;
    else if (status === "await-feedback") kpi.awaiting++;
    else if (status === "done") kpi.done++;

    if (isUrgent(t) && status !== "done") {
      kpi.urgentOpen++;
      const d = parseDueDate(t);
      if (d) urgentOpenDates.push(d);
    }
  }

  urgentOpenDates.sort((a, b) => a - b);
  kpi.nextUrgentDeadline = urgentOpenDates[0] || null;

  return kpi;
}

function renderUser(user) {
  const greeting = greetingByTime(new Date());

  setText("greetingText", user?.guest ? `${greeting}!` : `${greeting},`);

  if ($id("userName")) {
    setText("userName", user?.name || "Guest");
  }

  if ($id("userInitials")) {
    const initials = getInitials(user?.name || "Guest");
    setText("userInitials", initials);
  }
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
  if (!user) {
    window.location.href = LOGIN_URL;
    return;
  }

  renderUser(user);

  const tasks = await loadTasks();
  const kpi = calcKPIs(tasks);
  renderKPIs(kpi);
}

document.addEventListener("DOMContentLoaded", () => {
  initSummary().catch((err) => console.error("Summary init error:", err));
});
