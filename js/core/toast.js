const TOAST_MAX_COUNT = 3;
const TOAST_GAP_PX = 12;
const toastState = { container: null, toasts: [] };
const imageToastState = { container: null };

/**
 * Shows an info toast message.
 * @param {string} message - The message to display
 */
function showToast(message) {
  showToastInternal(message, "info");
}

/**
 * Shows an error toast message.
 * @param {string} message - The error message to display
 */
function showErrorToast(message) {
  showToastInternal(message, "error");
}

/**
 * Shows the "Added to board" image toast.
 */
function showAddedToBoardToast() {
  showImageToast("/assets/img/icons/added-to-board.png", "Added to board");
}

/**
 * Shows an image toast notification.
 * @param {string} src - The image source URL
 * @param {string} alt - The alt text for the image
 */
function showImageToast(src, alt = "") {
  if (!src) return;
  const toast = createImageToast(src, alt);
  const container = getImageToastContainer();
  container.innerHTML = "";
  container.appendChild(toast);
  scheduleImageToastShow(toast);
  scheduleImageToastHide(toast);
}

/**
 * Internal function to show a toast with a specific type.
 * @param {string} message - The message to display
 * @param {string} type - The toast type (info or error)
 */
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

/**
 * Gets or creates the toast container element.
 * @returns {HTMLElement} The toast container
 */
function getToastContainer() {
  if (toastState.container) return toastState.container;
  const container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
  toastState.container = container;
  return container;
}

/**
 * Creates a toast element.
 * @param {string} message - The message to display
 * @param {string} type - The toast type
 * @returns {HTMLElement} The toast element
 */
function createToast(message, type) {
  const toast = document.createElement("div");
  toast.className = "toast";
  if (type === "error") toast.classList.add("toast-error");
  toast.textContent = message;
  return toast;
}

/**
 * Gets or creates the image toast container element.
 * @returns {HTMLElement} The image toast container
 */
function getImageToastContainer() {
  if (imageToastState.container) return imageToastState.container;
  const container = document.createElement("div");
  container.className = "toast-container toast-container--image";
  document.body.appendChild(container);
  imageToastState.container = container;
  return container;
}

/**
 * Creates an image toast element.
 * @param {string} src - The image source URL
 * @param {string} alt - The alt text
 * @returns {HTMLElement} The image toast element
 */
function createImageToast(src, alt) {
  const toast = document.createElement("div");
  toast.className = "toast toast-image";
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  toast.appendChild(img);
  return toast;
}

/**
 * Schedules the show animation for a toast.
 * @param {HTMLElement} toast - The toast element to show
 */
function scheduleToastShow(toast) {
  setTimeout(() => toast.classList.add("show"), 100);
}

/**
 * Schedules the show animation for an image toast.
 * @param {HTMLElement} toast - The image toast element to show
 */
function scheduleImageToastShow(toast) {
  setTimeout(() => toast.classList.add("show"), 50);
}

/**
 * Schedules the hide animation and removal for a toast.
 * @param {HTMLElement} toast - The toast element to hide
 */
function scheduleToastHide(toast) {
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => removeToast(toast), 300);
  }, 3000);
}

/**
 * Schedules the hide animation and removal for an image toast.
 * @param {HTMLElement} toast - The image toast element to hide
 */
function scheduleImageToastHide(toast) {
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/**
 * Removes excess toasts to enforce the maximum count limit.
 */
function trimToasts() {
  while (toastState.toasts.length > TOAST_MAX_COUNT) {
    const stale = toastState.toasts.pop();
    if (stale) stale.remove();
  }
}

/**
 * Removes a toast from the display and state.
 * @param {HTMLElement} toast - The toast element to remove
 */
function removeToast(toast) {
  const index = toastState.toasts.indexOf(toast);
  if (index === -1) return;
  toastState.toasts.splice(index, 1);
  toast.remove();
  updateToastPositions();
}

/**
 * Updates the vertical positions of all visible toasts.
 */
function updateToastPositions() {
  let offset = 0;
  toastState.toasts.forEach((toast) => {
    toast.style.setProperty("--toast-offset", `${offset}px`);
    offset += toast.getBoundingClientRect().height + TOAST_GAP_PX;
  });
}


