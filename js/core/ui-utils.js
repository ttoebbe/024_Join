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
  "#C5FF7A",
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
 * Generates a random color from the predefined color pool.
 * @returns {string} Random color hex code
 */
function generateRandomColor() {
  return RANDOM_COLOR_POOL[
    Math.floor(Math.random() * RANDOM_COLOR_POOL.length)
  ];
}

/**
 * Checks if the current user is a guest.
 * @returns {boolean} True if guest user
 */
function isGuest() {
  const user = getCurrentUser();
  return user?.guest === true;
}

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
 * Executes a callback when the page becomes visible.
 * @param {Function} reloadFn - Async function to execute on page visible
 */
function onPageVisible(reloadFn) {
  if (typeof reloadFn !== "function") return;
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      reloadFn().catch((error) =>
        console.error("Page visibility reload error:", error),
      );
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
