/**
 * Template functions for the add task form
 */
function getAddTaskPriorityBlockTemplate() {
  return `
    <label>Priority</label>
    <div class="prio-row">
      <button type="button" class="prio-btn" data-prio="urgent">
        <span class="prio-label">Urgent</span>
        <svg class="prio-icon" viewBox="0 0 20 16" aria-hidden="true">
          <path d="M4 10L10 4L16 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M4 14L10 8L16 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button type="button" class="prio-btn is-active" data-prio="medium">
        <span class="prio-label">Medium</span>
        <svg class="prio-icon" viewBox="0 0 20 16" aria-hidden="true">
          <path d="M4 6H16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M4 10H16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
      <button type="button" class="prio-btn" data-prio="low">
        <span class="prio-label">Low</span>
        <svg class="prio-icon" viewBox="0 0 20 16" aria-hidden="true">
          <path d="M4 2L10 8L16 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M4 6L10 12L16 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  `;
}

/**
 * @param {*} presetStatus = "todo"
 * @returns {*}
 */
function getAddTaskFormTemplate(presetStatus = "todo") {
  return [
    getAddTaskFormOpen(presetStatus),
    getAddTaskRightColumn(),
    getAddTaskFormFooter(),
    getAddTaskFormClose(),
  ].join("");
}

/**
 * @param {*} presetStatus
 * @returns {*}
 */
function getAddTaskFormOpen(presetStatus) {
  return `
    <form id="add-task-form" class="addtask-form" novalidate>
      <input type="hidden" id="task-status-preset" value="${presetStatus}" />
      <input type="hidden" id="task-category-value" value="" />
      <div class="addtask-grid">
        <div>
          ${getAddTaskLeftFields()}
        </div>
  `;
}

/**
 * @returns {*}
 */
function getAddTaskLeftFields() {
  return `
      <label>Title<span class="req">*</span></label>
      <input id="task-title" type="text" placeholder="Enter a title" />
      <div class="field-error" id="task-title-error"></div>
      <div class="field-counter" id="task-title-counter">0/40</div>
      <label>Description</label>
      <textarea id="task-description" placeholder="Enter a Description"></textarea>
      <div class="field-error" id="task-description-error"></div>
      <div class="field-counter" id="task-description-counter">0/200</div>
    <label>Due date<span class="req">*</span></label>
    <input id="task-due-date" type="date" />
  `;
}

/**
 * @returns {*}
 */
function getAddTaskRightColumn() {
  return `
        <div>
          ${getAddTaskPriorityBlock()}
          ${getAddTaskAssignedBlock()}
          ${getAddTaskCategoryBlock()}
          ${getAddTaskSubtaskBlock()}
        </div>
      </div>
  `;
}

/**
 * @returns {*}
 */
function getAddTaskPriorityBlock() {
  return getAddTaskPriorityBlockTemplate();
}

/**
 * @returns {*}
 */
function getAddTaskAssignedBlock() {
  return `
    <label>Assigned to</label>
    <div class="dropdown dropdown--select" id="assigned-dropdown">
      <button type="button" class="dropdown-toggle" data-assigned-toggle aria-haspopup="listbox" aria-expanded="false">
        <span class="dropdown-placeholder" data-assigned-value>Select contacts to assign</span>
        <span class="dropdown-caret" aria-hidden="true"></span>
      </button>
      <div class="dropdown-menu" data-assigned-menu hidden></div>
    </div>
    <div class="assigned-selected" data-assigned-avatars hidden></div>
  `;
}

/**
 * @returns {*}
 */
function getAddTaskCategoryBlock() {
  return `<label>Category<span class="req">*</span></label>\n` +
    `<div class="dropdown dropdown--select" id="category-dropdown">\n` +
    `  <button type="button" class="dropdown-toggle" data-category-toggle aria-haspopup="listbox" aria-expanded="false">\n` +
    `    <span class="dropdown-placeholder" data-category-value>Select task category</span>\n` +
    `    <span class="dropdown-caret" aria-hidden="true"></span>\n` +
    `  </button>\n` +
    `  <div class="dropdown-menu" data-category-menu hidden>\n` +
    `    <button type="button" class="dropdown-item" data-category-item data-value="userstory" data-label="User Story">User Story</button>\n` +
    `    <button type="button" class="dropdown-item" data-category-item data-value="technical" data-label="Technical Task">Technical Task</button>\n` +
    `  </div>\n` +
    `</div>\n`;
}

/**
 * @returns {*}
 */
function getAddTaskSubtaskBlock() {
  return `
    <label>Subtasks</label>
    <div class="subtask-row">
      <input id="subtask-input" type="text" placeholder="Add new subtask" />
      <button type="button" id="subtask-add-btn">+</button>
    </div>
    <div class="field-error" id="subtask-error"></div>
    <div class="field-counter" id="subtask-counter">0/30</div>
    <div id="subtask-list"></div>
  `;
}

/**
 * @returns {*}
 */
function getAddTaskFormFooter() {
  return `
      <div id="add-task-form-msg" class="form-msg" aria-live="polite"></div>
      <p class="req-note"><span class="req">*</span>This field is required</p>
      <div class="addtask-footer">
        <button type="button" id="clear-btn">Clear</button>
        <button type="submit" id="create-btn">Create Task</button>
      </div>
  `;
}

/**
 * @returns {*}
 */
function getAddTaskFormClose() {
  return `
    </form>
  `;
}
