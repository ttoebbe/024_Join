/**
 * Creates the assigned avatars container.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createAssignedAvatars(task) {
  const wrap = document.createElement("div");
  wrap.className = "board-avatars";
  const assigned = getAssigned(task);
  appendAssignedBubbles(wrap, assigned);
  return wrap;
}

/**
 * Appends assigned avatar bubbles.
 * @param {HTMLElement} wrap
 * @param {Array} assigned
 */
function appendAssignedBubbles(wrap, assigned) {
  assigned.slice(0, 4).forEach((a) => wrap.appendChild(createAvatarBubble(a)));
  if (assigned.length > 4) addMoreBubble(wrap, assigned.length - 4);
}

/**
 * Adds a more-count bubble.
 * @param {HTMLElement} wrap
 * @param {number} remaining
 */
function addMoreBubble(wrap, remaining) {
  wrap.appendChild(createMoreBubble(remaining));
}

/**
 * Normalizes assigned items.
 * @param {Object} task
 * @returns {Array}
 */
function getAssigned(task) {
  const raw = task?.assigned ?? task?.assignees ?? [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeAssignedItem(item))
    .filter((x) => x && String(x.name || "").trim().length > 0);
}

/**
 * Normalizes a single assignee item.
 * @param {any} item
 * @returns {Object|null}
 */
function normalizeAssignedItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { name: item, color: null };
  if (typeof item === "object") return buildAssignedObject(item);
  return null;
}

/**
 * Builds a normalized assignee object.
 * @param {Object} item
 * @returns {Object}
 */
function buildAssignedObject(item) {
  const name = item.name || item.fullName || item.username || "";
  const color = item.color || null;
  return { name, color };
}

/**
 * Creates an avatar bubble.
 * @param {Object} person
 * @returns {HTMLElement}
 */
function createAvatarBubble(person) {
  const avatarElement = document.createElement("span");
  avatarElement.className = "board-avatar";
  const name = String(person?.name || "").trim();
  avatarElement.textContent = getInitials(name);
  avatarElement.style.background = person?.color || "#2a3647";
  return avatarElement;
}

/**
 * Creates a more-count bubble.
 * @param {number} remainingCount
 * @returns {HTMLElement}
 */
function createMoreBubble(remainingCount) {
  const avatarElement = document.createElement("span");
  avatarElement.className = "board-avatar";
  avatarElement.textContent = `+${remainingCount}`;
  avatarElement.style.background = "#2a3647";
  return avatarElement;
}
