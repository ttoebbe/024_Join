/**
 * Template functions for the add task form
 */
function getAddTaskFormTemplate(presetStatus = "todo") {
  return [
    getAddTaskFormOpen(presetStatus),
    getAddTaskLeftColumn(),
    getAddTaskRightColumn(),
    getAddTaskFormFooter(),
    getAddTaskFormClose(),
  ].join("");
}

function getAddTaskFormOpen(presetStatus) {
  return `
    <form id="addTaskForm" class="addtask-form">
      <input type="hidden" id="taskStatusPreset" value="${presetStatus}" />
      <input type="hidden" id="taskCategoryValue" value="" />
      <div class="addtask-grid">
        <div>
          ${getAddTaskLeftFields()}
        </div>
  `;
}

function getAddTaskLeftFields() {
  return `
    <label>Title<span class="req">*</span></label>
    <input id="taskTitle" type="text" placeholder="Enter a title" />
    <label>Description</label>
    <textarea id="taskDescription" placeholder="Enter a Description"></textarea>
    <label>Due date<span class="req">*</span></label>
    <input id="taskDueDate" type="date" />
  `;
}

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

function getAddTaskPriorityBlock() {
  return `
    <label>Priority</label>
    <div class="prio-row">
      <button type="button" class="prio-btn" data-prio="urgent">Urgent</button>
      <button type="button" class="prio-btn is-active" data-prio="medium">Medium</button>
      <button type="button" class="prio-btn" data-prio="low">Low</button>
    </div>
  `;
}

function getAddTaskAssignedBlock() {
  return `
    <label>Assigned to</label>
    <div class="dropdown dropdown--select" id="assignedDropdown">
      <button type="button" class="dropdown-toggle" data-assigned-toggle aria-haspopup="listbox" aria-expanded="false">
        <span class="dropdown-placeholder" data-assigned-value>Select contacts to assign</span>
        <span class="dropdown-caret" aria-hidden="true"></span>
      </button>
      <div class="dropdown-menu" data-assigned-menu hidden></div>
    </div>
  `;
}

function getAddTaskCategoryBlock() {
  return `<label>Category<span class="req">*</span></label>\n` +
    `<div class="dropdown dropdown--select" id="categoryDropdown">\n` +
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

function getAddTaskSubtaskBlock() {
  return `
    <label>Subtasks</label>
    <div class="subtask-row">
      <input id="subtaskInput" type="text" placeholder="Add new subtask" />
      <button type="button" id="subtaskAddBtn">+</button>
    </div>
    <div id="subtaskList"></div>
  `;
}

function getAddTaskFormFooter() {
  return `
      <p class="req-note"><span class="req">*</span>This field is required</p>
      <div class="addtask-footer">
        <button type="button" id="clearBtn">Clear</button>
        <button type="submit" id="createBtn">Create Task</button>
      </div>
  `;
}

function getAddTaskFormClose() {
  return `
    </form>
  `;
}
