function getTaskDetailShellTemplate() {
  return `
    <div class="overlay-backdrop" data-overlay-close></div>
    <div class="overlay-panel overlay-panel--detail" role="dialog" aria-modal="true" aria-label="Task Details">
      <button class="overlay-close" type="button" data-overlay-close aria-label="Close">×</button>
      <div class="task-detail"></div>
    </div>
  `;
}
