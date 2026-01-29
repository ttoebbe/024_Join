/**
 * Creates the priority block.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createPrioBlock(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-prio";
  wrap.appendChild(buildPrioImage(task));
  return wrap;
}

/**
 * Builds the priority image.
 * @param {Object} task
 * @returns {HTMLImageElement}
 */
function buildPrioImage(task) {
  const img = document.createElement("img");
  img.alt = "Priority";
  img.dataset.prio = normalizePrioKey(task?.prio);
  img.src = mapPrioToIcon(task?.prio);
  img.onerror = () => handlePrioImageError(img);
  return img;
}

/**
 * Handles priority image load errors.
 * @param {HTMLImageElement} img
 */
function handlePrioImageError(img) {
  img.onerror = null;
  img.dataset.prio = "medium";
  img.src = "/assets/img/icons/Prio-medium.svg";
}

/**
 * Maps a priority to its icon.
 * @param {string} prio
 * @returns {string}
 */
function mapPrioToIcon(prio) {
  const key = normalizePrioKey(prio);
  if (key === "urgent") return "/assets/img/icons/Prio-Urgent.svg";
  if (key === "low") return "/assets/img/icons/Prio-low.svg";
  return "/assets/img/icons/Prio-medium.svg";
}

/**
 * Normalizes a priority key.
 * @param {string} prio
 * @returns {string}
 */
function normalizePrioKey(prio) {
  const simple = normalizePrioString(prio);
  if (isUrgentPrio(simple)) return "urgent";
  if (isLowPrio(simple)) return "low";
  if (isMediumPrio(simple)) return "medium";
  return "medium";
}

/**
 * Normalizes a priority string.
 * @param {string} prio
 * @returns {string}
 */
function normalizePrioString(prio) {
  return String(prio || "medium")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/**
 * Checks for urgent priority.
 * @param {string} simple
 * @returns {boolean}
 */
function isUrgentPrio(simple) {
  return (
    simple.includes("urgent") ||
    simple.includes("high") ||
    simple.includes("alta")
  );
}

/**
 * Checks for low priority.
 * @param {string} simple
 * @returns {boolean}
 */
function isLowPrio(simple) {
  return simple.includes("low") || simple.includes("baja");
}

/**
 * Checks for medium priority.
 * @param {string} simple
 * @returns {boolean}
 */
function isMediumPrio(simple) {
  return simple.includes("medium") || simple.includes("media");
}
