// /**
//  * Template functions for board cards
//  */
// /**
//  * @param {*} task
//  * @returns {*}
//  */
// function getTaskCardTemplate(task) {
//   const data = buildTaskCardData(task);
//   return buildTaskCardTemplate(task, data);
// }

// /**
//  * @param {*} task
//  * @returns {*}
//  */
// function buildTaskCardData(task) {
//   return {
//     priorityClass: task.priority ? `priority-${task.priority}` : "priority-low",
//     assignees: task.assignees || [],
//   };
// }

// /**
//  * @param {*} task
//  * @param {*} data
//  * @returns {*}
//  */
// function buildTaskCardTemplate(task, data) {
//   return `
//     <div class="task-card card ${data.priorityClass}" data-task-id="${task.id}">
//       <div class="task-title">${task.title || "Untitled Task"}</div>
//       <div class="task-description">${task.description || ""}</div>
//       <div class="task-meta">
//         <div class="task-assignees">
//           ${buildAssigneeMarkup(data.assignees)}
//         </div>
//         <div class="task-due-date">${task.dueDate || ""}</div>
//       </div>
//     </div>
//   `;
// }

// /**
//  * @param {*} assignees
//  * @returns {*}
//  */
// function buildAssigneeMarkup(assignees) {
//   const list = assignees.slice(0, 3).map((assignee) => {
//     return buildAssigneeAvatar(assignee);
//   });
//   if (assignees.length > 3) list.push(buildAssigneeOverflow(assignees.length));
//   return list.join("");
// }

// /**
//  * @param {*} assignee
//  * @returns {*}
//  */
// function buildAssigneeAvatar(assignee) {
//   return `
//     <div class="task-assignee-avatar" title="${assignee.name}">
//       ${assignee.initials || "U"}
//     </div>
//   `;
// }

// /**
//  * @param {*} count
//  * @returns {*}
//  */
// function buildAssigneeOverflow(count) {
//   return `<div class="task-assignee-avatar">+${count - 3}</div>`;
// }

/**
 * Template for task detail overlay shell
 * @returns {string}
 */
function getTaskDetailShellTemplate() {
  return `
    <div class="overlay-backdrop" data-overlay-close></div>
    <div class="overlay-panel overlay-panel--detail" role="dialog" aria-modal="true" aria-label="Task Details">
      <button class="overlay-close" type="button" data-overlay-close aria-label="Close">×</button>
      <div class="task-detail"></div>
    </div>
  `;
}
