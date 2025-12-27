/**
 * Bootstraps the page and renders demo cards.
 */
function initPage() {
  renderCards(demoCards);
}

/**
 * Renders all cards into the grid.
 * @param {Array<Object>} cards - Card list
 */
function renderCards(cards) {
  const grid = document.getElementById("card-grid");
  grid.innerHTML = cards.map(renderCard).join("");
}

/**
 * Builds the HTML of a single card.
 * @param {Object} card - Card data
 * @returns {string} Markup for the card
 */
function renderCard(card) {
  return /* html */ `
    <article class="card-item">
      <h4>${card.title}</h4>
      <p>${card.description}</p>
      <div class="chip-row">${renderChips(card.tags)}</div>
    </article>`;
}

/**
 * Renders the chips for a card.
 * @param {Array<string>} tags - Tag labels
 * @returns {string} Markup for chips
 */
function renderChips(tags) {
  return tags.map((tag) => `<span class="chip">${tag}</span>`).join("");
}

/**
 * Adds one more demo card.
 */
function addDemoCard() {
  demoCards.unshift(createDemoCard());
  renderCards(demoCards);
}

/**
 * Creates a demo card with a timestamp.
 * @returns {Object} Card data
 */
function createDemoCard() {
  return {
    title: "Neue Idee",
    description: `Erstellt am ${new Date().toLocaleTimeString("de-DE")}. Passe Text und Inhalt an.`,
    tags: ["Neu", "Platzhalter"],
  };
}

/**
 * Clears the card grid.
 */
function clearCards() {
  demoCards.length = 0;
  renderCards(demoCards);
}

const demoCards = [
  {
    title: "Willkommen",
    description: "Dies ist deine Basisvorlage. Ersetze diese Karten durch eigene Inhalte.",
    tags: ["Start", "Layout"],
  },
  {
    title: "Struktur",
    description: "Header, Footer und Grundstil sind vorbereitet – lege direkt los.",
    tags: ["UI", "Vorlage"],
  },
  {
    title: "Anpassung",
    description: "Projektstyles kommen in project.css, Logik in main.js.",
    tags: ["CSS", "JS"],
  },
];
