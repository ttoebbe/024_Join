/** @type {number} */
const TITLE_MAX_LENGTH = 40;
/** @type {number} */
const DESCRIPTION_MAX_LENGTH = 200;

/**
 * Wire input listeners for add-task counters.
 * @param {object} state
 * @returns {void}
 */
function wireAddTaskCounters(state) {
  updateAddTaskCounters(state);
  state.titleInput?.addEventListener("input", () => updateAddTaskCounters(state));
  const desc = document.getElementById("task-description");
  desc?.addEventListener("input", () => updateAddTaskCounters(state));
}

/**
 * Update counters and enforce max lengths.
 * @param {object} state
 * @returns {void}
 */
function updateAddTaskCounters(state) {
  enforceMaxLength(state.titleInput, TITLE_MAX_LENGTH);
  if (typeof validateTitleLength === "function") validateTitleLength(state);
  updateFieldCounter(state.titleInput, "task-title-counter", TITLE_MAX_LENGTH);
  const desc = document.getElementById("task-description");
  enforceMaxLength(desc, DESCRIPTION_MAX_LENGTH);
  if (typeof validateDescriptionLength === "function") validateDescriptionLength(state);
  updateFieldCounter(desc, "task-description-counter", DESCRIPTION_MAX_LENGTH);
}

/**
 * Update a single counter element.
 * @param {HTMLInputElement|HTMLTextAreaElement|null} input
 * @param {string} counterId
 * @param {number} max
 * @returns {void}
 */
function updateFieldCounter(input, counterId, max) {
  const counter = document.getElementById(counterId);
  if (!counter) return;
  const length = (input?.value || "").length;
  counter.textContent = `${length}/${max}`;
}

/**
 * Hard-limit the value length.
 * @param {HTMLInputElement|HTMLTextAreaElement|null} input
 * @param {number} max
 * @returns {void}
 */
function enforceMaxLength(input, max) {
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= max) return;
  input.value = value.slice(0, max);
}
