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
  const prio = String(task?.prio || "").toLowerCase().trim();
  return prio === "urgent" || prio === "high" || prio === "alta";
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
  const status = normalizeStatus(task?.status);
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
  else if (status === "inprogress") kpi.inProgress++;
  else if (status === "awaitfeedback") kpi.awaiting++;
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
  setText("greeting-text", user?.guest ? `${greeting}!` : `${greeting},`);
  if ($id("user-name")) setText("user-name", user?.name || "Guest");
  if ($id("user-initials")) setText("user-initials", getInitials(user?.name || "Guest"));
}
/**
 * @param {*} kpi
 * @returns {*}
 */
function renderKPIs(kpi) {
  setText("count-todo", String(kpi.todo));
  setText("count-done", String(kpi.done));
  setText("count-in-progress", String(kpi.inProgress));
  setText("count-awaiting", String(kpi.awaiting));
  setText("count-urgent", String(kpi.urgentOpen));
  if ($id("count-board")) setText("count-board", String(kpi.board));
  setText(
    "next-deadline-date",
    kpi.nextUrgentDeadline ? formatDateLong(kpi.nextUrgentDeadline) : "â€”"
  );
}
/**
 * @returns {*}
 */
async function initSummary() {
  const user = loadCurrentUser();
  if (!user) return redirectToLogin();
  renderUser(user);
  runMobileGreeting(user);
  await reloadSummaryData();
  onPageVisible(reloadSummaryData);
}
/**
 * @returns {*}
 */
async function reloadSummaryData() {
  const tasks = await loadTasks();
  renderKPIs(calcKPIs(tasks));
}
/**
 * @returns {*}
 */
function redirectToLogin() {
  window.location.href = ROUTES.LOGIN;
}


function runMobileGreeting(user) {
  if (!shouldShowMobileGreeting()) return;
  const data = getGreetingData(user);
  const overlay = buildGreetingOverlay(data);
  markMobileGreetingShown();
  showGreetingOverlay(overlay);
}

function shouldShowMobileGreeting() {
  return window.innerWidth <= 480 && sessionStorage.getItem("mobileGreetingShown") !== "true";
}

function markMobileGreetingShown() {
  sessionStorage.setItem("mobileGreetingShown", "true");
}

function getGreetingData(user) {
  const greeting = getTimeBasedGreeting(new Date());
  return {
    text: user?.guest ? `${greeting}!` : `${greeting},`,
    name: user?.guest ? "" : user?.name || "Guest",
  };
}

function buildGreetingOverlay(data) {
  const overlay = document.createElement("div");
  overlay.className = "greeting-overlay is-visible";
  overlay.innerHTML = buildGreetingOverlayHtml(data);
  return overlay;
}

function buildGreetingOverlayHtml({ text, name }) {
  const nameHtml = name ? `<h2 class="greeting-overlay-name">${name}</h2>` : "";
  return `<div class="greeting-overlay-content"><p class="greeting-overlay-text">${text}</p>${nameHtml}</div>`;
}

function showGreetingOverlay(overlay) {
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 2000);
}
document.addEventListener("DOMContentLoaded", handleSummaryReady);

/**
 * @returns {void}
 */
function handleSummaryReady() {
  withPageReady(runSummaryInit);
}

/**
 * @returns {Promise<void>}
 */
async function runSummaryInit() {
  await initSummary().catch((err) => {
    console.error("Summary init error:", err);
  });
}


