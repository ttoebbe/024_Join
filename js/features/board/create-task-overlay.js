/**
 * Ensures the overlay root exists.
 * @returns {HTMLElement}
 */
function ensureOverlayRoot() {
  let root = document.getElementById("overlayRoot");
  if (root) return root;
  root = document.createElement("div");
  root.id = "overlayRoot";
  root.className = "overlay-root hidden";
  root.setAttribute("aria-hidden", "true");
  document.body.appendChild(root);
  return root;
}

/**
 * Opens the task overlay root.
 * @returns {HTMLElement}
 */
function openTaskOverlayRoot() {
  const root = ensureOverlayRoot();
  root.classList.remove("hidden");
  root.setAttribute("aria-hidden", "false");
  return root;
}

function closeTaskOverlay() {
  const root = document.getElementById("overlayRoot");
  if (!root) return;
  root.classList.add("hidden");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = "";
}

/**
 * Wires close handlers for the detail overlay.
 * @param {HTMLElement} root
 */
function wireTaskDetailClose(root) {
  root.querySelectorAll("[data-overlay-close]").forEach((el) => {
    el.addEventListener("click", closeTaskOverlay);
  });
}
