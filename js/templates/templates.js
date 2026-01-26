/**
 * Template functions for board cards
 */
/**
 * @param {*} task
 * @returns {*}
 */
function getTaskCardTemplate(task) {
  const data = buildTaskCardData(task);
  return buildTaskCardTemplate(task, data);
}
/**
 * @param {*} task
 * @returns {*}
 */
function buildTaskCardData(task) {
  return {
    priorityClass: task.priority ? `priority-${task.priority}` : "priority-low",
    assignees: task.assignees || [],
  };
}
/**
 * @param {*} task
 * @param {*} data
 * @returns {*}
 */
function buildTaskCardTemplate(task, data) {
  return `
    <div class="task-card card ${data.priorityClass}" data-task-id="${task.id}">
      <div class="task-title">${task.title || "Untitled Task"}</div>
      <div class="task-description">${task.description || ""}</div>
      <div class="task-meta">
        <div class="task-assignees">
          ${buildAssigneeMarkup(data.assignees)}
        </div>
        <div class="task-due-date">${task.dueDate || ""}</div>
      </div>
    </div>
  `;
}
/**
 * @param {*} assignees
 * @returns {*}
 */
function buildAssigneeMarkup(assignees) {
  const list = assignees.slice(0, 3).map((assignee) => {
    return buildAssigneeAvatar(assignee);
  });
  if (assignees.length > 3) list.push(buildAssigneeOverflow(assignees.length));
  return list.join("");
}
/**
 * @param {*} assignee
 * @returns {*}
 */
function buildAssigneeAvatar(assignee) {
  return `
    <div class="task-assignee-avatar" title="${assignee.name}">
      ${assignee.initials || "U"}
    </div>
  `;
}
/**
 * @param {*} count
 * @returns {*}
 */
function buildAssigneeOverflow(count) {
  return `<div class="task-assignee-avatar">+${count - 3}</div>`;
}
/**
 * Template functions for contact views
 */
/**
 * @param {*} contact
 * @param {*} isActive = false
 * @returns {*}
 */
function getContactTemplate(contact, isActive = false) {
  const initials = getInitials(contact.name);
  const avatarColor = contact.color || "#2a3647";
  return `
    <article class="contact-entry" data-contact-id="${contact.id}">
      <span class="contact-avatar" style="background:${avatarColor}">${initials}</span>
      <div class="contact-meta">
        <p class="contact-name">${contact.name}</p>
        <p class="contact-email">${contact.email}</p>
      </div>
    </article>
  `;
}
/**
 * @param {*} letter
 * @returns {*}
 */
function getContactGroupHeaderTemplate(letter) {
  return `
    <div class="contact-group-header">
      <span class="contact-group-letter">${letter}</span>
    </div>
  `;
}
/**
 * @param {*} contact
 * @returns {*}
 */
function getContactDetailTemplate(contact) {
  const initials = getInitials(contact.name);
  return [
    buildContactHero(contact, initials),
    buildContactDetails(contact),
    buildContactMenuButton(),
  ].join("");
}
/**
 * @param {*} contact
 * @param {*} initials
 * @returns {*}
 */
function buildContactHero(contact, initials) {
  return `<div class="contact-hero">\n` +
    `  <div class="contact-avatar contact-avatar-large" style="background-color: ${contact.color}">${initials}</div>\n` +
    `  <div class="contact-info">\n` +
    `    <h2>${contact.name}</h2>\n` +
    `    <div class="detail-actions">\n` +
    `      <button class="secondary-button">Edit</button>\n` +
    `      <button class="secondary-button">Delete</button>\n` +
    `    </div>\n` +
    `  </div>\n` +
    `</div>\n`;
}
/**
 * @param {*} contact
 * @returns {*}
 */
function buildContactDetails(contact) {
  return `<div class="contact-details">\n` +
    `  <h4>Contact Information</h4>\n` +
    `  <div class="detail-row">\n` +
    `    <span class="detail-label">Email</span>\n` +
    `    <a href="mailto:${contact.email}">${contact.email}</a>\n` +
    `  </div>\n` +
    `  <div class="detail-row">\n` +
    `    <span class="detail-label">Phone</span>\n` +
    `    <span>${contact.phone}</span>\n` +
    `  </div>\n` +
    `</div>\n`;
}
/**
 * @returns {*}
 */
function buildContactMenuButton() {
  return `
    <button type="button" class="contact-menu-button" aria-label="Edit contact">
      <img src="../../assets/img/icons/Menu Contact options.png" alt="" aria-hidden="true" />
    </button>
  `;
}
/**
 * Template functions for the add task form
 */
const ADD_TASK_PRIORITY_BLOCK_TEMPLATE = `
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
    <form id="addTaskForm" class="addtask-form" novalidate>
      <input type="hidden" id="taskStatusPreset" value="${presetStatus}" />
      <input type="hidden" id="taskCategoryValue" value="" />
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
      <input id="taskTitle" type="text" placeholder="Enter a title" maxlength="60" />
      <div class="field-error" id="taskTitle-error"></div>
      <div class="field-counter" id="taskTitle-counter">0/60</div>
      <label>Description</label>
      <textarea id="taskDescription" placeholder="Enter a Description" maxlength="200"></textarea>
      <div class="field-counter" id="taskDescription-counter">0/200</div>
    <label>Due date<span class="req">*</span></label>
    <input id="taskDueDate" type="date" />
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
  return ADD_TASK_PRIORITY_BLOCK_TEMPLATE;
}
/**
 * @returns {*}
 */
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
    <div class="assigned-selected" data-assigned-avatars hidden></div>
  `;
}
/**
 * @returns {*}
 */
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
/**
 * @returns {*}
 */
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
/**
 * @returns {*}
 */
function getAddTaskFormFooter() {
  return `
      <div id="addTaskFormMsg" class="form-msg" aria-live="polite"></div>
      <p class="req-note"><span class="req">*</span>This field is required</p>
      <div class="addtask-footer">
        <button type="button" id="clearBtn">Clear</button>
        <button type="submit" id="createBtn">Create Task</button>
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
/**
 * Shared UI templates
 */
/**
 * @param {*} message = "Loading..."
 * @returns {*}
 */
function getLoadingTemplate(message = "Loading...") {
  return `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}
/**
 * @param {*} message = "An error occurred"
 * @returns {*}
 */
function getErrorTemplate(message = "An error occurred") {
  return `
    <div class="error-message">
      <p>${message}</p>
    </div>
  `;
}
