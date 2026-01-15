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
    timeoutId = setTimeout(() => func.apply(this, args), delay);
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

function getUserNumbers(existingUsers) {
  return existingUsers
    .map((user) => user.id)
    .filter((id) => isUserId(id))
    .map((id) => parseUserIdNumber(id))
    .filter((num) => num >= 0);
}

function isUserId(id) {
  return Boolean(id && id.startsWith("u"));
}

function parseUserIdNumber(id) {
  const num = parseInt(id.substring(1));
  return Number.isNaN(num) ? -1 : num;
}

/**
 * Generates task ID with 't' prefix.
 * @returns {string} - Task ID like 't123456789'
 */
function generateTaskId() {
  return 't' + Math.random().toString(36).substr(2, 9);
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
