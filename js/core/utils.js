const RANDOM_COLOR_POOL = [
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
let pageBusyGuardReady = false;
let pageBusyElements = [];
let pageBusyCount = 0;

/**
 * Sets the text content of an element by ID.
 * @param {string} id - The element ID
 * @param {string} text - The text to set
 */
function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text || "";
}

// DEAD CODE - not used
// /**
//  * Gets an element by its ID.
//  * @param {string} id - The element ID
//  * @returns {HTMLElement|null} The element or null
//  */
// function getElementById(id) {
//   return document.getElementById(id);
// }

/**
 * Generates initials from a name string.
 * @param {string} name - The full name
 * @returns {string} The initials (up to 2 characters)
 */
function getInitials(name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Validates an email address format.
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const trimmed = (email || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

// DEAD CODE - not used
// /**
//  * Validates a password (min 4 chars, no whitespace).
//  * @param {string} password - Password to validate
//  * @returns {boolean} True if valid
//  */
// function validatePassword(password) {
//   const trimmed = (password || "").trim();
//   if (trimmed.length < 4) return false;
//   if (/\s/.test(trimmed)) return false;
//   return true;
// }

/**
 * Returns a time-based greeting message.
 * @param {Date} date - Optional date object
 * @returns {string} Greeting message
 */
function getTimeBasedGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  if (hour >= 18 && hour < 22) return "Good evening";
  return "Good night";
}

/**
 * Normalizes task data from Firebase into an array.
 * @param {any} data - Raw task data
 * @returns {Array} Normalized task array
 */
function normalizeTasks(data) {
  if (!data) return [];
  if (Array.isArray(data)) return filterTaskArray(data);
  if (typeof data === "object") return normalizeTaskMap(data);
  return [];
}

/**
 * Normalizes a task status string to a standard format.
 * @param {string} value - The status value to normalize
 * @returns {string} Normalized status
 */
function normalizeStatus(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "-");
  if (normalized === "todo" || normalized === "to-do") return "todo";
  if (normalized === "in-progress" || normalized === "inprogress") return "inprogress";
  if (normalized === "await-feedback" || normalized === "awaitfeedback") return "awaitfeedback";
  if (normalized === "done") return "done";
  return "todo";
}

/**
 * Filters out null and undefined values from a task array.
 * @param {Array} data - The task array to filter
 * @returns {Array} Filtered array
 */
function filterTaskArray(data) {
  return data.filter(Boolean);
}

/**
 * Converts a task object map to an array.
 * @param {Object} data - The task object map
 * @returns {Array} Array of tasks
 */
function normalizeTaskMap(data) {
  return Object.entries(data)
    .map(([id, value]) => normalizeTaskEntry(id, value))
    .filter(Boolean);
}

/**
 * Normalizes a single task entry and ensures it has an ID.
 * @param {string} id - The task ID
 * @param {Object} value - The task data
 * @returns {Object|null} Normalized task or null
 */
function normalizeTaskEntry(id, value) {
  if (!value || typeof value !== "object") return null;
  if (value.id) return value;
  return { ...value, id };
}

// DEAD CODE - not used
// /**
//  * Creates a debounced version of a function.
//  * @param {Function} func - Function to debounce
//  * @param {number} delay - Delay in milliseconds
//  * @returns {Function} Debounced function
//  */
// function debounce(func, delay) {
//   let timeoutId;
//   return function (...args) {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func.apply(this, args), delay);
//   };
// }

// DEAD CODE - not used
// /**
//  * Generates a random ID string.
//  * @returns {string} Random ID
//  */
// function generateId() {
//   return Math.random().toString(36).substr(2, 9);
// }

// DEAD CODE - not used
// /**
//  * Generates a random user ID with 'u' prefix.
//  * @returns {string} Random user ID
//  */
// function generateUserId() {
//   return "u" + Math.random().toString(36).substr(2, 9);
// }

/**
 * Generates the next sequential user ID.
 * @param {Array} existingUsers - Array of existing users
 * @returns {string} Next user ID (e.g., "u0", "u1")
 */
function generateNextUserId(existingUsers = []) {
  if (!existingUsers || existingUsers.length === 0) return "u0";
  const numbers = getUserNumbers(existingUsers);
  const maxNumber = numbers.length ? Math.max(...numbers) : -1;
  return `u${maxNumber + 1}`;
}

/**
 * Extracts numeric parts from user IDs.
 * @param {Array} existingUsers - Array of users
 * @returns {Array<number>} Array of user numbers
 */
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

/**
 * Checks if a string is a valid user ID format.
 * @param {string} id - The ID to check
 * @returns {boolean} True if valid user ID
 */
function isUserId(id) {
  return Boolean(id && id.startsWith("u"));
}

/**
 * Parses the numeric part from a user ID.
 * @param {string} id - The user ID
 * @returns {number} The numeric part or -1 if invalid
 */
function parseUserIdNumber(id) {
  const number = parseInt(id.substring(1));
  return Number.isNaN(number) ? -1 : number;
}

/**
 * Generates the next sequential task ID from Firebase.
 * @returns {Promise<string>} Next task ID (e.g., "t0", "t1")
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

/**
 * Builds the next task ID from existing task data.
 * @param {any} data - Raw task data
 * @returns {string} Next task ID
 */
function buildNextTaskId(data) {
  const tasks = normalizeTaskList(data);
  if (tasks.length === 0) return "t0";
  const highestNumber = getHighestTaskNumber(tasks);
  return `t${highestNumber + 1}`;
}

/**
 * Normalizes task data into an array.
 * @param {any} data - Raw task data
 * @returns {Array} Array of tasks
 */
function normalizeTaskList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  return Object.values(data).filter(Boolean);
}

/**
 * Finds the highest numeric task ID in a task list.
 * @param {Array} tasks - Array of tasks
 * @returns {number} Highest task number or -1
 */
function getHighestTaskNumber(tasks) {
  return tasks.reduce((max, task) => {
    if (!task || !task.id) return max;
    const numericPart = getTaskIdNumber(task.id);
    return Math.max(max, numericPart);
  }, -1);
}

/**
 * Logs a task ID generation error.
 * @param {Error} error - The error to log
 */
function logTaskIdError(error) {
  console.error("Error generating task ID:", error);
}

/**
 * Generates a fallback task ID using timestamp.
 * @returns {string} Fallback task ID
 */
function fallbackTaskId() {
  return `t${Date.now()}`;
}

/**
 * Extracts the numeric part from a task ID.
 * @param {string} id - The task ID
 * @returns {number} The numeric part or -1 if invalid
 */
function getTaskIdNumber(id) {
  if (!id || typeof id !== "string" || !id.startsWith("t")) return -1;
  const number = parseInt(id.substring(1));
  return Number.isNaN(number) ? -1 : number;
}

/**
 * Generates a random color from the predefined color pool.
 * @returns {string} Random color hex code
 */
function generateRandomColor() {
  return RANDOM_COLOR_POOL[Math.floor(Math.random() * RANDOM_COLOR_POOL.length)];
}

/**
 * Checks if the current user is a guest.
 * @returns {boolean} True if guest user
 */
function isGuest() {
  const user = getCurrentUser();
  return user?.guest === true;
}

// DEAD CODE - not used
// /**
//  * Disables a button for guest users with a blocking toast.
//  * @param {HTMLElement} button - Button element to disable
//  * @param {Function} originalHandler - Original click handler for non-guests
//  */
// function disableForGuests(button, originalHandler) {
//   if (!button) return;
//   if (isGuest()) return applyGuestDisabled(button);
//   if (originalHandler) button.addEventListener("click", originalHandler);
// }

/**
 * Applies guest disabled styling and behavior to a button.
 * @param {HTMLElement} button - The button to disable
 */
function applyGuestDisabled(button) {
  button.classList.add("disabled");
  button.addEventListener("click", handleGuestBlockedClick, { capture: true });
}

/**
 * Handles click events on guest-blocked buttons.
 * @param {Event} event - The click event
 */
function handleGuestBlockedClick(event) {
  event.preventDefault();
  event.stopPropagation();
  showToast("not allowed for Guest users.");
}

/**
 * Gets the current user from session storage.
 * @returns {Object|null} Current user or null
 */
function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

/**
 * Executes a callback when the page becomes visible.
 * @param {Function} reloadFn - Async function to execute on page visible
 */
function onPageVisible(reloadFn) {
  if (typeof reloadFn !== "function") return;
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      reloadFn().catch((error) => console.error("Page visibility reload error:", error));
    }
  });
}

/**
 * Executes a task while showing the page as busy (disabling interactions).
 * @param {Function} task - Async task to execute
 */
async function withPageReady(task) {
  startPageBusy();
  try {
    await task?.();
  } finally {
    stopPageBusy();
  }
}

/**
 * Starts the page busy state.
 */
function startPageBusy() {
  ensurePageBusyGuards();
  pageBusyCount += 1;
  if (pageBusyCount === 1) applyPageBusy();
}

/**
 * Stops the page busy state.
 */
function stopPageBusy() {
  if (pageBusyCount === 0) return;
  pageBusyCount -= 1;
  if (pageBusyCount === 0) clearPageBusy();
}

/**
 * Ensures page busy event listeners are registered.
 */
function ensurePageBusyGuards() {
  if (pageBusyGuardReady) return;
  document.addEventListener("click", handleBusyClick, true);
  document.addEventListener("submit", handleBusySubmit, true);
  document.addEventListener("keydown", handleBusyKeydown, true);
  pageBusyGuardReady = true;
}

/**
 * Applies busy state to all interactive elements.
 */
function applyPageBusy() {
  pageBusyElements = collectBusyElements();
  pageBusyElements.forEach((el) => markBusyElement(el));
}

/**
 * Clears busy state from all interactive elements.
 */
function clearPageBusy() {
  pageBusyElements.forEach((el) => unmarkBusyElement(el));
  pageBusyElements = [];
}

/**
 * Collects all interactive elements that should be disabled when busy.
 * @returns {Array<HTMLElement>} Array of elements
 */
function collectBusyElements() {
  return Array.from(document.querySelectorAll("button, [role='button']"));
}

/**
 * Marks an element as busy by disabling it.
 * @param {HTMLElement} el - The element to mark
 */
function markBusyElement(el) {
  if (!el || el.dataset.pageBusy === "1") return;
  storeBusyAttr(el, "tabindex", "pageBusyTabindex");
  storeBusyAttr(el, "aria-disabled", "pageBusyAria");
  el.setAttribute("aria-disabled", "true");
  el.setAttribute("tabindex", "-1");
  el.classList.add("page-busy");
  el.dataset.pageBusy = "1";
}

/**
 * Removes busy state from an element.
 * @param {HTMLElement} el - The element to unmark
 */
function unmarkBusyElement(el) {
  if (!el || el.dataset.pageBusy !== "1") return;
  restoreBusyAttr(el, "tabindex", "pageBusyTabindex");
  restoreBusyAttr(el, "aria-disabled", "pageBusyAria");
  el.classList.remove("page-busy");
  delete el.dataset.pageBusy;
}

/**
 * Stores an attribute value before modifying it for busy state.
 * @param {HTMLElement} el - The element
 * @param {string} attr - The attribute name
 * @param {string} key - The storage key
 */
function storeBusyAttr(el, attr, key) {
  if (el.dataset[key] !== undefined) return;
  const value = el.getAttribute(attr);
  el.dataset[key] = value === null ? "null" : value;
}

/**
 * Restores a previously stored attribute value.
 * @param {HTMLElement} el - The element
 * @param {string} attr - The attribute name
 * @param {string} key - The storage key
 */
function restoreBusyAttr(el, attr, key) {
  if (el.dataset[key] === undefined) return;
  const value = el.dataset[key];
  if (value === "null") el.removeAttribute(attr);
  else el.setAttribute(attr, value);
  delete el.dataset[key];
}

/**
 * Gets the closest busy-eligible element from an event target.
 * @param {HTMLElement} target - The event target
 * @returns {HTMLElement|null} The closest button element or null
 */
function getBusyTarget(target) {
  if (pageBusyCount === 0 || !target?.closest) return null;
  return target.closest("button, [role='button']");
}

/**
 * Handles click events during busy state.
 * @param {Event} event - The click event
 */
function handleBusyClick(event) {
  if (!getBusyTarget(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Handles submit events during busy state.
 * @param {Event} event - The submit event
 */
function handleBusySubmit(event) {
  if (pageBusyCount === 0) return;
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Handles keydown events during busy state.
 * @param {Event} event - The keydown event
 */
function handleBusyKeydown(event) {
  if (pageBusyCount === 0) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  if (!getBusyTarget(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
}


