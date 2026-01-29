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
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-");
  if (normalized === "todo" || normalized === "to-do") return "todo";
  if (normalized === "in-progress" || normalized === "inprogress")
    return "inprogress";
  if (normalized === "await-feedback" || normalized === "awaitfeedback")
    return "awaitfeedback";
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
