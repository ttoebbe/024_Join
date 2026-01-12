/**
 * Template functions for dynamic HTML generation
 * Unified template system using template strings with "html" comments
 */

/**
 * Generates the add task form template
 * @param {string} presetStatus - Optional preset task status
 * @returns {string} HTML template string
 */
export function getAddTaskFormTemplate(presetStatus = 'todo') {
  return /* html */ `
    <form id="addTaskForm" class="addtask-form">
      <input type="hidden" id="taskStatusPreset" value="${presetStatus}" />
      <input type="hidden" id="taskCategoryValue" value="" />

      <div class="addtask-grid">
        <div>
          <label>Title<span class="req">*</span></label>
          <input id="taskTitle" type="text" placeholder="Enter a title" />

          <label>Description</label>
          <textarea id="taskDescription" placeholder="Enter a Description"></textarea>

          <label>Due date<span class="req">*</span></label>
          <input id="taskDueDate" type="date" />
        </div>

        <div>
          <label>Priority</label>
          <div class="prio-row">
            <button type="button" class="prio-btn" data-prio="urgent">Urgent</button>
            <button type="button" class="prio-btn is-active" data-prio="medium">Medium</button>
            <button type="button" class="prio-btn" data-prio="low">Low</button>
          </div>

          <label>Assigned to</label>
          <div class="dropdown dropdown--select" id="assignedDropdown">
            <button
              type="button"
              class="dropdown-toggle"
              data-assigned-toggle
              aria-haspopup="listbox"
              aria-expanded="false"
            >
              <span class="dropdown-placeholder" data-assigned-value>Select contacts to assign</span>
              <span class="dropdown-caret" aria-hidden="true"></span>
            </button>
            <div class="dropdown-menu" data-assigned-menu hidden></div>
          </div>

          <label>Category<span class="req">*</span></label>
          <div class="dropdown dropdown--select" id="categoryDropdown">
            <button
              type="button"
              class="dropdown-toggle"
              data-category-toggle
              aria-haspopup="listbox"
              aria-expanded="false"
            >
              <span class="dropdown-placeholder" data-category-value>Select task category</span>
              <span class="dropdown-caret" aria-hidden="true"></span>
            </button>
            <div class="dropdown-menu" data-category-menu hidden>
              <button
                type="button"
                class="dropdown-item"
                data-category-item
                data-value="userstory"
                data-label="User Story"
              >
                User Story
              </button>
              <button
                type="button"
                class="dropdown-item"
                data-category-item
                data-value="technical"
                data-label="Technical Task"
              >
                Technical Task
              </button>
            </div>
          </div>

          <label>Subtasks</label>
          <div class="subtask-row">
            <input id="subtaskInput" type="text" placeholder="Add new subtask" />
            <button type="button" id="subtaskAddBtn">+</button>
          </div>
          <div id="subtaskList"></div>
        </div>
      </div>

      <p class="req-note"><span class="req">*</span>This field is required</p>

      <div class="addtask-footer">
        <button type="button" id="clearBtn">Clear</button>
        <button type="submit" id="createBtn">Create Task</button>
      </div>
    </form>
  `;
}

/**
 * Generates contact entry template
 * @param {Object} contact - Contact object
 * @param {boolean} isActive - Whether contact is currently selected
 * @returns {string} HTML template string
 */
export function getContactTemplate(contact, isActive = false) {
  const activeClass = isActive ? ' active' : '';
  const initials = contact.name ? contact.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'C';
  
  return /* html */ `
    <article class="contact-card${activeClass}" data-contact-id="${contact.id}">
      <div class="contact-avatar">${initials}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.name || 'Unknown'}</div>
        <div class="contact-email">${contact.email || ''}</div>
      </div>
    </article>
  `;
}

/**
 * Generates task card template
 * @param {Object} task - Task object
 * @returns {string} HTML template string
 */
export function getTaskCardTemplate(task) {
  const priorityClass = task.priority ? `priority-${task.priority}` : 'priority-low';
  const assignees = task.assignees || [];
  
  return /* html */ `
    <div class="task-card card ${priorityClass}" data-task-id="${task.id}">
      <div class="task-title">${task.title || 'Untitled Task'}</div>
      <div class="task-description">${task.description || ''}</div>
      <div class="task-meta">
        <div class="task-assignees">
          ${assignees.slice(0, 3).map(assignee => `
            <div class="task-assignee-avatar" title="${assignee.name}">
              ${assignee.initials || 'U'}
            </div>
          `).join('')}
          ${assignees.length > 3 ? `<div class="task-assignee-avatar">+${assignees.length - 3}</div>` : ''}
        </div>
        <div class="task-due-date">${task.dueDate || ''}</div>
      </div>
    </div>
  `;
}

/**
 * Generates loading spinner template
 * @param {string} message - Optional loading message
 * @returns {string} HTML template string
 */
export function getLoadingTemplate(message = 'Loading...') {
  return /* html */ `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Generates error message template
 * @param {string} message - Error message
 * @returns {string} HTML template string
 */
export function getErrorTemplate(message = 'An error occurred') {
  return /* html */ `
    <div class="error-message">
      <p>${message}</p>
    </div>
  `;
}