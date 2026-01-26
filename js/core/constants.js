/**
 * Central constants for the Join application
 */

// Firebase collection names
const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  CONTACTS: 'contacts'
};

// Authentication constants
const CURRENT_USER_KEY = 'join_current_user';
const USERS_KEY = 'join_users';

// Navigation URLs
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

// Task status constants
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  AWAIT_FEEDBACK: 'await-feedback',
  DONE: 'done'
};

// Priority levels
const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// API endpoints and configuration
const API_CONFIG = {
  BASE_URL: 'https://remotestorage-67778-default-rtdb.europe-west1.firebasedatabase.app',
  TIMEOUT: 10000
};

