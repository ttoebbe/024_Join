/**
 * Builds the HTML for the greeting overlay.
 * @param {{ text: string, name: string }} params
 * @returns {string}
 */
function buildGreetingOverlayHtml({ text, name }) {
  const nameHtml = name ? `<h2 class="greeting-overlay-name">${name}</h2>` : "";
  return `<div class="greeting-overlay-content"><p class="greeting-overlay-text">${text}</p>${nameHtml}</div>`;
}
