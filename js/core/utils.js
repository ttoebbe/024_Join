/**
 * Central utility functions for the Join application
 */

/**
 * Helper function to set text content of an element by ID.
 * @param {string} id - The element ID
 * @param {string} txt - The text content to set
 */
function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt || "";
}

/**
 * Helper function to get element by ID.
 * @param {string} id - The element ID
 * @returns {HTMLElement|null}
 */
function getElementById(id) {
  return document.getElementById(id);
}

/**
 * Calculates initials for a given name.
 * @param {string} name - The full name
 * @returns {string} - The initials (max 2 characters)
 */
function getInitials(name) {
  if (!name) return "";
  
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Validates email format.
 * @param {string} email - The email to validate
 * @returns {boolean} - True if email format is valid
 */
function isValidEmail(email) {
  const trimmed = (email || "").trim();
  if (!trimmed.includes("@")) return false;
  
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  if (!parts[0] || !parts[1] || !parts[1].includes(".")) return false;
  
  return true;
}

/**
 * Returns a greeting message based on current time.
 * @param {Date} date - The date to base greeting on (default: now)
 * @returns {string} - Greeting message
 */
function getTimeBasedGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  if (hour >= 18 && hour < 22) return "Good evening";
  return "Good night";
}

/**
 * Normalizes task data to array format.
 * @param {any} data - Raw task data
 * @returns {Array} - Normalized tasks array
 */
function normalizeTasks(data) {
  if (!data) return [];
  if (Array.isArray(data)) return filterTaskArray(data);
  if (typeof data === "object") return normalizeTaskMap(data);
  return [];
}

/**
 * Normalizes status strings to board keys.
 * @param {*} value
 * @returns {*}
 */
function normalizeStatus(value) {
  const v = String(value || "").trim().toLowerCase();
  const unified = v.replace(/[\s_-]+/g, "-");
  if (unified === "todo" || unified === "to-do") return "todo";
  if (unified === "in-progress" || unified === "inprogress") return "inprogress";
  if (unified === "await-feedback" || unified === "awaitfeedback") return "awaitfeedback";
  if (unified === "done") return "done";
  return "todo";
}

/**
 * @param {*} data
 * @returns {*}
 */
function filterTaskArray(data) {
  return data.filter(Boolean);
}

/**
 * @param {*} data
 * @returns {*}
 */
function normalizeTaskMap(data) {
  return Object.entries(data)
    .map(([id, value]) => normalizeTaskEntry(id, value))
    .filter(Boolean);
}

/**
 * @param {*} id
 * @param {*} value
 * @returns {*}
 */
function normalizeTaskEntry(id, value) {
  if (!value || typeof value !== "object") return null;
  if (value.id) return value;
  return { ...value, id };
}

/**
 * Debounces a function call.
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Generates a random ID.
 * @returns {string} - Random ID
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Generates a random user ID with 'u' prefix.
 * @returns {string} - User ID like 'u123456789'
 */
function generateUserId() {
  return 'u' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generates next sequential user ID (u0, u1, u2, etc.)
 * @param {Object[]} existingUsers - Array of existing users
 * @returns {string} - Next user ID like 'u0', 'u1', 'u2'
 */
function generateNextUserId(existingUsers = []) {
  if (!existingUsers || existingUsers.length === 0) return "u0";
  const userNumbers = getUserNumbers(existingUsers);
  const maxNum = userNumbers.length ? Math.max(...userNumbers) : -1;
  return `u${maxNum + 1}`;
}

/**
 * @param {*} existingUsers
 * @returns {*}
 */
function getUserNumbers(existingUsers) {
  const numbers = [];
  for (const user of existingUsers || []) {
    const id = user?.id;
    if (!isUserId(id)) continue;
    const num = parseUserIdNumber(id);
    if (num >= 0) numbers.push(num);
  }
  return numbers;
}

/**
 * @param {*} id
 * @returns {*}
 */
function isUserId(id) {
  return Boolean(id && id.startsWith("u"));
}

/**
 * @param {*} id
 * @returns {*}
 */
function parseUserIdNumber(id) {
  const num = parseInt(id.substring(1));
  return Number.isNaN(num) ? -1 : num;
}

/**
 * Generates task ID with 't' prefix based on existing tasks.
 * @returns {Promise<string>} - Task ID like 't0', 't1', etc.
 */
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
  const highest = getHighestTaskNumber(tasks);
  return `t${highest + 1}`;
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

/**
 * Extracts the numeric part from a task ID (e.g., 't5' -> 5).
 * @param {string} id - Task ID
 * @returns {number} - Numeric part or -1 if invalid
 */
function getTaskIdNumber(id) {
  if (!id || typeof id !== "string" || !id.startsWith("t")) return -1;
  const num = parseInt(id.substring(1));
  return Number.isNaN(num) ? -1 : num;
}

/**
 * Generates a random color for user avatars.
 * @returns {string} - Hex color string
 */
function generateRandomColor() {
  const colors = [
    "#FF7A00", "#29ABE2", "#02CF2F", "#AF1616", 
    "#9327FF", "#FF7527", "#6E52FF", "#FC71FF",
    "#FFBB2B", "#1FD7C1", "#FFA35E", "#C5FF7A"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Shows a toast notification.
 * @param {string} message - The message to display
 */
function showToast(message) {
  const toast = createToast(message);
  document.body.appendChild(toast);
  scheduleToastShow(toast);
  scheduleToastHide(toast);
}

function createToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  return toast;
}

function scheduleToastShow(toast) {
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);
}

function scheduleToastHide(toast) {
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

/**
 * Checks if current user is a guest.
 * @returns {boolean} - True if user is guest
 */
function isGuest() {
  const user = getCurrentUser();
  return user?.guest === true;
}

/**
 * Disables button for guest users.
 * @param {HTMLElement} button - The button to disable
 * @param {Function} originalHandler - Original click handler (optional)
 */
function disableForGuests(button, originalHandler) {
  if (!button) return;
  
  if (isGuest()) {
    button.classList.add("disabled");
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showToast("Guest users are not allowed to perform this action.");
    }, { capture: true });
  } else if (originalHandler) {
    button.addEventListener("click", originalHandler);
  }
}

/**
 * Gets current user from session storage.
 * @returns {Object|null} - Current user or null
 */
function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

/**
 * Sets up auto-reload when page becomes visible.
 * @param {Function} reloadFn - Function to call when page becomes visible
 */
function onPageVisible(reloadFn) {
  if (typeof reloadFn !== "function") return;
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      reloadFn().catch((err) => {
        console.error("Page visibility reload error:", err);
      });
    }
  });
}
