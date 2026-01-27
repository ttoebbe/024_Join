const TITLE_MAX_LENGTH = 40;
const DESCRIPTION_MAX_LENGTH = 200;

function wireAddTaskCounters(state) {
  updateAddTaskCounters(state);
  state.titleInput?.addEventListener("input", () => updateAddTaskCounters(state));
  const desc = document.getElementById("task-description");
  desc?.addEventListener("input", () => updateAddTaskCounters(state));
}

function updateAddTaskCounters(state) {
  enforceMaxLength(state.titleInput, TITLE_MAX_LENGTH);
  if (typeof validateTitleLength === "function") validateTitleLength(state);
  updateFieldCounter(state.titleInput, "task-title-counter", TITLE_MAX_LENGTH);
  const desc = document.getElementById("task-description");
  enforceMaxLength(desc, DESCRIPTION_MAX_LENGTH);
  if (typeof validateDescriptionLength === "function") validateDescriptionLength(state);
  updateFieldCounter(desc, "task-description-counter", DESCRIPTION_MAX_LENGTH);
}

function updateFieldCounter(input, counterId, max) {
  const counter = document.getElementById(counterId);
  if (!counter) return;
  const length = (input?.value || "").length;
  counter.textContent = `${length}/${max}`;
}

function enforceMaxLength(input, max) {
  if (!input) return;
  const value = String(input.value || "");
  if (value.length <= max) return;
  input.value = value.slice(0, max);
}
