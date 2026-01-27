/**
 * Central constants for the Join application.
 */

/**
 * Firebase collection names.
 * @readonly
 * @type {{USERS: string, TASKS: string, CONTACTS: string}}
 */
const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  CONTACTS: 'contacts'
};

/**
 * Authentication storage keys.
 * @readonly
 * @type {string}
 */
const CURRENT_USER_KEY = 'join_current_user';
/**
 * Authentication storage keys.
 * @readonly
 * @type {string}
 */
const USERS_KEY = 'join_users';

/**
 * Navigation URLs.
 * @readonly
 * @type {{
 *   LOGIN: string,
 *   SUMMARY: string,
 *   BOARD: string,
 *   CONTACTS: string,
 *   ADD_TASK: string,
 *   HELP: string,
 *   LEGAL_NOTICE: string,
 *   PRIVACY_POLICY: string
 * }}
 */
const ROUTES = {
  LOGIN: '/index.html',
  SUMMARY: '/html/pages/summary.html',
  BOARD: '/html/pages/board.html',
  CONTACTS: '/html/pages/contacts.html',
  ADD_TASK: '/html/pages/add-task.html',
  HELP: '/html/pages/help.html',
  LEGAL_NOTICE: '/html/pages/legal-notice.html',
  PRIVACY_POLICY: '/html/pages/privacy-policy.html'
};

/**
 * Task status constants.
 * @readonly
 * @type {{TODO: string, IN_PROGRESS: string, AWAIT_FEEDBACK: string, DONE: string}}
 */
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  AWAIT_FEEDBACK: 'await-feedback',
  DONE: 'done'
};

/**
 * Priority levels.
 * @readonly
 * @type {{LOW: string, MEDIUM: string, HIGH: string}}
 */
const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * API endpoints and configuration.
 * @readonly
 * @type {{BASE_URL: string, TIMEOUT: number}}
 */
const API_CONFIG = {
  BASE_URL: 'https://remotestorage-67778-default-rtdb.europe-west1.firebasedatabase.app',
  TIMEOUT: 10000
};
