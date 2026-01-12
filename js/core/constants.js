/**
 * Central constants for the Join application
 */

// Firebase collection names
export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  CONTACTS: 'contacts'
};

// Authentication constants
export const CURRENT_USER_KEY = 'join_current_user';
export const USERS_KEY = 'join_users';

// Navigation URLs
export const ROUTES = {
  LOGIN: '../index.html',
  SUMMARY: '/pages/summary.html',
  BOARD: '/pages/board.html',
  CONTACTS: '/pages/contacts.html',
  ADD_TASK: '/pages/add_task.html',
  HELP: '/pages/help.html',
  LEGAL_NOTICE: '/pages/legal_notice.html',
  PRIVACY_POLICY: '/pages/privacy_policy.html'
};

// Task status constants
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  AWAIT_FEEDBACK: 'await-feedback',
  DONE: 'done'
};

// Priority levels
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// API endpoints and configuration
export const API_CONFIG = {
  BASE_URL: 'https://remotestorage-67778-default-rtdb.europe-west1.firebasedatabase.app/',
  TIMEOUT: 10000
};