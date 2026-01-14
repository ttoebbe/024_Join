/**
 * Template functions for board cards
 */
function getTaskCardTemplate(task) {
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