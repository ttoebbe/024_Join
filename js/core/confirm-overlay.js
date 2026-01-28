/**
 * Normalizes confirm overlay options with default values.
 * @param {Object} options - Configuration options
 * @returns {Object} Normalized options
 */
function normalizeConfirmOptions(options = {}) {
  return {
    title: options.title || "Confirm",
    message: options.message || "Are you sure?",
    confirmText: options.confirmText || "Confirm",
    cancelText: options.cancelText || "Cancel",
  };
}

/**
 * Shows a confirm overlay dialog and returns a promise with the user's choice.
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
 */
function showConfirmOverlay(options = {}) {
  const data = normalizeConfirmOptions(options);
  const overlay = buildConfirmOverlay(data);
  document.body.appendChild(overlay);
  return new Promise((resolve) => {
    wireConfirmOverlay(overlay, (ok) => {
      closeConfirmOverlay(overlay);
      resolve(ok);
    });
  });
}

/**
 * Builds the confirm overlay DOM element.
 * @param {Object} data - Normalized options data
 * @returns {HTMLElement} The overlay element
 */
function buildConfirmOverlay(data) {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay is-visible";
  overlay.setAttribute("aria-hidden", "false");
  overlay.setAttribute("tabindex", "-1");
  overlay.innerHTML = getConfirmOverlayHtml(data);
  return overlay;
}

/**
 * Generates the HTML for the confirm overlay dialog.
 * @param {Object} options - Title, message, and button texts
 * @returns {string} HTML string
 */
function getConfirmOverlayHtml({ title, message, confirmText, cancelText }) {
  return `<div class="confirm-backdrop" data-confirm-cancel></div><div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmOverlayTitle"><h3 class="confirm-title" id="confirmOverlayTitle">${title}</h3><p class="confirm-message">${message}</p><div class="confirm-actions"><button type="button" class="confirm-btn confirm-btn-secondary" data-confirm-cancel>${cancelText}</button><button type="button" class="confirm-btn confirm-btn-primary" data-confirm-ok>${confirmText}</button></div></div>`;
}

/**
 * Wires up event listeners for the confirm overlay.
 * @param {HTMLElement} overlay - The overlay element
 * @param {Function} done - Callback function with boolean result
 */
function wireConfirmOverlay(overlay, done) {
  const onCancel = () => done(false);
  const onConfirm = () => done(true);
  overlay
    .querySelectorAll("[data-confirm-cancel]")
    .forEach((el) => el.addEventListener("click", onCancel));
  overlay
    .querySelector("[data-confirm-ok]")
    ?.addEventListener("click", onConfirm);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") onCancel();
  });
  overlay.focus();
}

function closeConfirmOverlay(overlay) {
  overlay.remove();
}
