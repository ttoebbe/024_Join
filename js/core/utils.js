function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text || "";
}

function getElementById(id) {
  return document.getElementById(id);
}

function getInitials(name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isValidEmail(email) {
  const trimmed = (email || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

function validatePassword(password) {
  const trimmed = (password || "").trim();
  if (trimmed.length < 4) return false;
  if (/\s/.test(trimmed)) return false;
  return true;
}

function getTimeBasedGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  if (hour >= 18 && hour < 22) return "Good evening";
  return "Good night";
}

function normalizeTasks(data) {
  if (!data) return [];
  if (Array.isArray(data)) return filterTaskArray(data);
  if (typeof data === "object") return normalizeTaskMap(data);
  return [];
}

function normalizeStatus(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "-");
  if (normalized === "todo" || normalized === "to-do") return "todo";
  if (normalized === "in-progress" || normalized === "inprogress") return "inprogress";
  if (normalized === "await-feedback" || normalized === "awaitfeedback") return "awaitfeedback";
  if (normalized === "done") return "done";
  return "todo";
}

function filterTaskArray(data) {
  return data.filter(Boolean);
}

function normalizeTaskMap(data) {
  return Object.entries(data)
    .map(([id, value]) => normalizeTaskEntry(id, value))
    .filter(Boolean);
}

function normalizeTaskEntry(id, value) {
  if (!value || typeof value !== "object") return null;
  if (value.id) return value;
  return { ...value, id };
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function generateUserId() {
  return "u" + Math.random().toString(36).substr(2, 9);
}

function generateNextUserId(existingUsers = []) {
  if (!existingUsers || existingUsers.length === 0) return "u0";
  const numbers = getUserNumbers(existingUsers);
  const maxNumber = numbers.length ? Math.max(...numbers) : -1;
  return `u${maxNumber + 1}`;
}

function getUserNumbers(existingUsers) {
  const numbers = [];
  for (const user of existingUsers || []) {
    const id = user?.id;
    if (!isUserId(id)) continue;
    const number = parseUserIdNumber(id);
    if (number >= 0) numbers.push(number);
  }
  return numbers;
}

function isUserId(id) {
  return Boolean(id && id.startsWith("u"));
}

function parseUserIdNumber(id) {
  const number = parseInt(id.substring(1));
  return Number.isNaN(number) ? -1 : number;
}

async function generateTaskId() {
  try {
    const data = await TaskService.getAll();
    return buildNextTaskId(data);
  } catch (error) {
    logTaskIdError(error);
    return fallbackTaskId();
  }
}

function buildNextTaskId(data) {
  const tasks = normalizeTaskList(data);
  if (tasks.length === 0) return "t0";
  const highestNumber = getHighestTaskNumber(tasks);
  return `t${highestNumber + 1}`;
}

function normalizeTaskList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  return Object.values(data).filter(Boolean);
}

function getHighestTaskNumber(tasks) {
  return tasks.reduce((max, task) => {
    if (!task || !task.id) return max;
    const numericPart = getTaskIdNumber(task.id);
    return Math.max(max, numericPart);
  }, -1);
}

function logTaskIdError(error) {
  console.error("Error generating task ID:", error);
}

function fallbackTaskId() {
  return `t${Date.now()}`;
}

function getTaskIdNumber(id) {
  if (!id || typeof id !== "string" || !id.startsWith("t")) return -1;
  const number = parseInt(id.substring(1));
  return Number.isNaN(number) ? -1 : number;
}

function generateRandomColor() {
  const colors = [
    "#FF7A00",
    "#29ABE2",
    "#02CF2F",
    "#AF1616",
    "#9327FF",
    "#FF7527",
    "#6E52FF",
    "#FC71FF",
    "#FFBB2B",
    "#1FD7C1",
    "#FFA35E",
    "#C5FF7A"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const TOAST_MAX_COUNT = 3;
const TOAST_GAP_PX = 12;
const toastState = { container: null, toasts: [] };

function showToast(message) {
  showToastInternal(message, "info");
}

function showErrorToast(message) {
  showToastInternal(message, "error");
}

function showToastInternal(message, type) {
  if (!message) return;
  const toast = createToast(message, type);
  const container = getToastContainer();
  container.prepend(toast);
  toastState.toasts.unshift(toast);
  trimToasts();
  updateToastPositions();
  scheduleToastShow(toast);
  scheduleToastHide(toast);
}

function getToastContainer() {
  if (toastState.container) return toastState.container;
  const container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
  toastState.container = container;
  return container;
}

function createToast(message, type) {
  const toast = document.createElement("div");
  toast.className = "toast";
  if (type === "error") toast.classList.add("toast-error");
  toast.textContent = message;
  return toast;
}

function scheduleToastShow(toast) {
  setTimeout(() => toast.classList.add("show"), 100);
}

function scheduleToastHide(toast) {
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => removeToast(toast), 300);
  }, 3000);
}

function trimToasts() {
  while (toastState.toasts.length > TOAST_MAX_COUNT) {
    const stale = toastState.toasts.pop();
    if (stale) stale.remove();
  }
}

function removeToast(toast) {
  const index = toastState.toasts.indexOf(toast);
  if (index === -1) return;
  toastState.toasts.splice(index, 1);
  toast.remove();
  updateToastPositions();
}

function updateToastPositions() {
  let offset = 0;
  toastState.toasts.forEach((toast) => {
    toast.style.setProperty("--toast-offset", `${offset}px`);
    offset += toast.getBoundingClientRect().height + TOAST_GAP_PX;
  });
}

function isGuest() {
  const user = getCurrentUser();
  return user?.guest === true;
}

function disableForGuests(button, originalHandler) {
  if (!button) return;
  if (isGuest()) {
    button.classList.add("disabled");
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        showToast("not allowed for Guest users.");
      },
      { capture: true }
    );
  } else if (originalHandler) {
    button.addEventListener("click", originalHandler);
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

function onPageVisible(reloadFn) {
  if (typeof reloadFn !== "function") return;
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      reloadFn().catch((error) => console.error("Page visibility reload error:", error));
    }
  });
}

let pageBusyGuardReady = false;
let pageBusyElements = [];
let pageBusyCount = 0;

async function withPageReady(task) {
  startPageBusy();
  try {
    await task?.();
  } finally {
    stopPageBusy();
  }
}

function startPageBusy() {
  ensurePageBusyGuards();
  pageBusyCount += 1;
  if (pageBusyCount === 1) applyPageBusy();
}

function stopPageBusy() {
  if (pageBusyCount === 0) return;
  pageBusyCount -= 1;
  if (pageBusyCount === 0) clearPageBusy();
}

function ensurePageBusyGuards() {
  if (pageBusyGuardReady) return;
  document.addEventListener("click", handleBusyClick, true);
  document.addEventListener("submit", handleBusySubmit, true);
  document.addEventListener("keydown", handleBusyKeydown, true);
  pageBusyGuardReady = true;
}

function applyPageBusy() {
  pageBusyElements = collectBusyElements();
  pageBusyElements.forEach((el) => markBusyElement(el));
}

function clearPageBusy() {
  pageBusyElements.forEach((el) => unmarkBusyElement(el));
  pageBusyElements = [];
}

function collectBusyElements() {
  return Array.from(document.querySelectorAll("button, [role='button']"));
}

function markBusyElement(el) {
  if (!el || el.dataset.pageBusy === "1") return;
  storeBusyAttr(el, "tabindex", "pageBusyTabindex");
  storeBusyAttr(el, "aria-disabled", "pageBusyAria");
  el.setAttribute("aria-disabled", "true");
  el.setAttribute("tabindex", "-1");
  el.classList.add("page-busy");
  el.dataset.pageBusy = "1";
}

function unmarkBusyElement(el) {
  if (!el || el.dataset.pageBusy !== "1") return;
  restoreBusyAttr(el, "tabindex", "pageBusyTabindex");
  restoreBusyAttr(el, "aria-disabled", "pageBusyAria");
  el.classList.remove("page-busy");
  delete el.dataset.pageBusy;
}

function storeBusyAttr(el, attr, key) {
  if (el.dataset[key] !== undefined) return;
  const value = el.getAttribute(attr);
  el.dataset[key] = value === null ? "null" : value;
}

function restoreBusyAttr(el, attr, key) {
  if (el.dataset[key] === undefined) return;
  const value = el.dataset[key];
  if (value === "null") el.removeAttribute(attr);
  else el.setAttribute(attr, value);
  delete el.dataset[key];
}

function getBusyTarget(target) {
  if (pageBusyCount === 0 || !target?.closest) return null;
  return target.closest("button, [role='button']");
}

function handleBusyClick(event) {
  if (!getBusyTarget(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
}

function handleBusySubmit(event) {
  if (pageBusyCount === 0) return;
  event.preventDefault();
  event.stopPropagation();
}

function handleBusyKeydown(event) {
  if (pageBusyCount === 0) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  if (!getBusyTarget(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
}