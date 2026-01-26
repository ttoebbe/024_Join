function normalizeConfirmOptions(options = {}) {
  return {
    title: options.title || "Confirm",
    message: options.message || "Are you sure?",
    confirmText: options.confirmText || "Confirm",
    cancelText: options.cancelText || "Cancel",
  };
}

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

function buildConfirmOverlay(data) {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay is-visible";
  overlay.setAttribute("aria-hidden", "false");
  overlay.setAttribute("tabindex", "-1");
  overlay.innerHTML = getConfirmOverlayHtml(data);
  return overlay;
}

function getConfirmOverlayHtml({ title, message, confirmText, cancelText }) {
  return `<div class="confirm-backdrop" data-confirm-cancel></div><div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmOverlayTitle"><h3 class="confirm-title" id="confirmOverlayTitle">${title}</h3><p class="confirm-message">${message}</p><div class="confirm-actions"><button type="button" class="confirm-btn confirm-btn-secondary" data-confirm-cancel>${cancelText}</button><button type="button" class="confirm-btn confirm-btn-primary" data-confirm-ok>${confirmText}</button></div></div>`;
}

function wireConfirmOverlay(overlay, done) {
  const onCancel = () => done(false);
  const onConfirm = () => done(true);
  overlay.querySelectorAll("[data-confirm-cancel]").forEach((el) => el.addEventListener("click", onCancel));
  overlay.querySelector("[data-confirm-ok]")?.addEventListener("click", onConfirm);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") onCancel();
  });
  overlay.focus();
}

function closeConfirmOverlay(overlay) {
  overlay.remove();
}
