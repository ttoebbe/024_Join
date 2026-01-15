/**
 * Shared UI templates
 */
function getLoadingTemplate(message = 'Loading...') {
  return /* html */ `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * @param {*} message = 'An error occurred'
 * @returns {*}
 */
function getErrorTemplate(message = 'An error occurred') {
  return /* html */ `
    <div class="error-message">
      <p>${message}</p>
    </div>
  `;
}