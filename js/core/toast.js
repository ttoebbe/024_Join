if (!window.__toastInit) {
  window.__toastInit = true;
  const TOAST_MAX_COUNT = 3;
  const TOAST_GAP_PX = 12;
  const toastState = { container: null, toasts: [] };
  const imageToastState = { container: null };

  function showToast(message) {
    showToastInternal(message, "info");
  }

  function showErrorToast(message) {
    showToastInternal(message, "error");
  }

  function showAddedToBoardToast() {
    showImageToast("/assets/img/icons/added-to-board.png", "Added to board");
  }

  function showImageToast(src, alt = "") {
    if (!src) return;
    const toast = createImageToast(src, alt);
    const container = getImageToastContainer();
    container.innerHTML = "";
    container.appendChild(toast);
    scheduleImageToastShow(toast);
    scheduleImageToastHide(toast);
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

  function getImageToastContainer() {
    if (imageToastState.container) return imageToastState.container;
    const container = document.createElement("div");
    container.className = "toast-container toast-container--image";
    document.body.appendChild(container);
    imageToastState.container = container;
    return container;
  }

  function createImageToast(src, alt) {
    const toast = document.createElement("div");
    toast.className = "toast toast-image";
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    toast.appendChild(img);
    return toast;
  }

  function scheduleToastShow(toast) {
    setTimeout(() => toast.classList.add("show"), 100);
  }

  function scheduleImageToastShow(toast) {
    setTimeout(() => toast.classList.add("show"), 50);
  }

  function scheduleToastHide(toast) {
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => removeToast(toast), 300);
    }, 3000);
  }

  function scheduleImageToastHide(toast) {
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
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

  window.showToast = showToast;
  window.showErrorToast = showErrorToast;
  window.showAddedToBoardToast = showAddedToBoardToast;
  window.showImageToast = showImageToast;
}
