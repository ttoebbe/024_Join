/**
 * @param {*} id
 * @returns {*}
 */
function getById(id) {
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
  const priorityValue = String(task?.prio || "").toLowerCase().trim();
  return priorityValue === "urgent" || priorityValue === "high" || priorityValue === "alta";
}
/**
 * @param {*} task
 * @returns {*}
 */
function parseDueDate(task) {
  const rawDueDate = task?.dueDate;
  if (!rawDueDate) return null;
  const parsedDate = new Date(rawDueDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
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
  const kpiData = initKpi(tasks);
  const urgentOpenDates = [];
  for (const task of tasks) {
    updateKpiForTask(kpiData, task, urgentOpenDates);
  }
  setNextUrgentDeadline(kpiData, urgentOpenDates);
  return kpiData;
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
function updateKpiForTask(kpiData, task, urgentOpenDates) {
  const status = normalizeStatus(task?.status);
  incrementStatusCount(kpiData, status);
  trackUrgentOpen(kpiData, task, status, urgentOpenDates);
}
/**
 * @param {*} kpi
 * @param {*} status
 * @returns {*}
 */
function incrementStatusCount(kpiData, status) {
  if (status === "todo") kpiData.todo++;
  else if (status === "inprogress") kpiData.inProgress++;
  else if (status === "awaitfeedback") kpiData.awaiting++;
  else if (status === "done") kpiData.done++;
}
/**
 * @param {*} kpi
 * @param {*} task
 * @param {*} status
 * @param {*} urgentOpenDates
 * @returns {*}
 */
function trackUrgentOpen(kpiData, task, status, urgentOpenDates) {
  if (!isUrgent(task) || status === "done") return;
  kpiData.urgentOpen++;
  const dueDate = parseDueDate(task);
  if (dueDate) urgentOpenDates.push(dueDate);
}
/**
 * @param {*} kpi
 * @param {*} urgentOpenDates
 * @returns {*}
 */
function setNextUrgentDeadline(kpiData, urgentOpenDates) {
  urgentOpenDates.sort((a, b) => {
    return a - b;
  });
  kpiData.nextUrgentDeadline = urgentOpenDates[0] || null;
}
/**
 * @param {*} user
 * @returns {*}
 */
function renderUser(user) {
  const greeting = getTimeBasedGreeting(new Date());
  setText("greeting-text", user?.guest ? `${greeting}!` : `${greeting},`);
  if (getById("user-name")) setText("user-name", user?.name || "Guest");
  if (getById("user-initials")) setText("user-initials", getInitials(user?.name || "Guest"));
}
/**
 * @param {*} kpi
 * @returns {*}
 */
function renderKPIs(kpiData) {
  setText("count-todo", String(kpiData.todo));
  setText("count-done", String(kpiData.done));
  setText("count-in-progress", String(kpiData.inProgress));
  setText("count-awaiting", String(kpiData.awaiting));
  setText("count-urgent", String(kpiData.urgentOpen));
  if (getById("count-board")) setText("count-board", String(kpiData.board));
  setText(
    "next-deadline-date",
    kpiData.nextUrgentDeadline ? formatDateLong(kpiData.nextUrgentDeadline) : "â€”"
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
