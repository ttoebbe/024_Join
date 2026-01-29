/**
 * Creates a task card element.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createCard(task) {
  const cardElement = createCardRoot();
  attachCardMeta(cardElement, task);
  appendCardContent(cardElement, task);
  return cardElement;
}

/**
 * Creates the card root element.
 * @returns {HTMLElement}
 */
function createCardRoot() {
  const cardElement = document.createElement("article");
  cardElement.className = "board-card";
  cardElement.setAttribute("role", "button");
  cardElement.tabIndex = 0;
  cardElement.draggable = true;
  return cardElement;
}

/**
 * Attaches metadata and handlers to a card.
 * @param {HTMLElement} cardElement
 * @param {Object} task
 */
function attachCardMeta(cardElement, task) {
  if (task?.id) cardElement.dataset.taskId = String(task.id);
  wireCardDragHandlers(cardElement);
  wireCardOpenHandlers(cardElement, task);
}

/**
 * Appends card content sections.
 * @param {HTMLElement} cardElement
 * @param {Object} task
 */
function appendCardContent(cardElement, task) {
  cardElement.appendChild(createCardMetaRow(task));
  cardElement.appendChild(createCardTitle(task));
  cardElement.appendChild(createCardDescription(task));
  appendCardProgress(cardElement, task);
  cardElement.appendChild(createCardFooter(task));
}

/**
 * Creates the card title element.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createCardTitle(task) {
  const title = document.createElement("h3");
  title.className = "board-card-title";
  title.textContent = task?.title || task?.name || "(No title)";
  return title;
}

/**
 * Creates the card description element.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createCardDescription(task) {
  const descriptionElement = document.createElement("p");
  descriptionElement.className = "board-card-desc";
  descriptionElement.textContent = task?.description || task?.desc || "";
  return descriptionElement;
}

/**
 * Appends progress info if available.
 * @param {HTMLElement} cardElement
 * @param {Object} task
 */
function appendCardProgress(cardElement, task) {
  const progress = createSubtaskProgress(task);
  if (progress) cardElement.appendChild(progress);
}

/**
 * Creates the card footer element.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createCardFooter(task) {
  const footer = document.createElement("div");
  footer.className = "board-card-footer";
  footer.appendChild(createAssignedAvatars(task));
  footer.appendChild(createPrioBlock(task));
  return footer;
}
