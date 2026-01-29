/**
 * Creates the subtask progress element.
 * @param {Object} task
 * @returns {HTMLElement|null}
 */
function createSubtaskProgress(task) {
  const stats = getSubtaskStats(task);
  if (!stats || stats.done === 0) return null;
  return buildProgressWrap(stats);
}

/**
 * Calculates subtask stats.
 * @param {Object} task
 * @returns {Object|null}
 */
function getSubtaskStats(task) {
  const subtasks = getSubtasks(task);
  if (subtasks.length === 0) return null;
  const done = subtasks.filter((s) => isSubtaskDone(s)).length;
  const total = subtasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

/**
 * Builds the progress wrapper.
 * @param {Object} stats
 * @returns {HTMLElement}
 */
function buildProgressWrap(stats) {
  const wrap = document.createElement("div");
  wrap.className = "board-progress";
  wrap.title = `${stats.done} von ${stats.total} Subtasks erledigt`;
  wrap.appendChild(buildProgressText(stats));
  wrap.appendChild(buildProgressBar(stats));
  return wrap;
}

/**
 * Builds the progress text element.
 * @param {Object} stats
 * @returns {HTMLElement}
 */
function buildProgressText(stats) {
  const text = document.createElement("div");
  text.className = "board-progress-text";
  text.textContent = `${stats.done}/${stats.total} Subtasks`;
  return text;
}

/**
 * Builds the progress bar element.
 * @param {Object} stats
 * @returns {HTMLElement}
 */
function buildProgressBar(stats) {
  const bar = document.createElement("div");
  bar.className = "board-progress-bar";
  bar.appendChild(buildProgressFill(stats));
  return bar;
}

/**
 * Builds the progress fill element.
 * @param {Object} stats
 * @returns {HTMLElement}
 */
function buildProgressFill(stats) {
  const fill = document.createElement("div");
  fill.className = "board-progress-fill";
  fill.style.width = `${stats.percent}%`;
  return fill;
}

/**
 * Gets subtasks from a task.
 * @param {Object} task
 * @returns {Array}
 */
function getSubtasks(task) {
  const primarySubtasks = task?.subtasks;
  const fallbackSubtasks = task?.subTasks;
  if (Array.isArray(primarySubtasks)) return primarySubtasks;
  if (Array.isArray(fallbackSubtasks)) return fallbackSubtasks;
  return [];
}

/**
 * Checks if a subtask is done.
 * @param {Object} subtask
 * @returns {boolean}
 */
function isSubtaskDone(subtask) {
  if (!subtask || typeof subtask !== "object") return false;
  return Boolean(subtask.done || subtask.completed || subtask.isDone);
}
