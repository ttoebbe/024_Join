/**
 * Template functions for summary page
 */

/**
 * @param {Object} params
 * @param {string} params.text
 * @param {string} params.name
 * @returns {string}
 */
function buildGreetingOverlayHtml({ text, name }) {
  const nameHtml = name ? `<h2 class="greeting-overlay-name">${name}</h2>` : "";
  return `<div class="greeting-overlay-content"><p class="greeting-overlay-text">${text}</p>${nameHtml}</div>`;
}
