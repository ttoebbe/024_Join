/**
 * Task management functionality
 * Centralized task operations and business logic
 */

import { TaskService } from './core/firebase-service.js';
import { TASK_STATUS, PRIORITY } from './core/constants.js';
import { generateId, normalizeTasks } from './core/utils.js';

/**
 * Creates a new task
 * @param {Object} taskData - Task data object
 * @returns {Promise<Object|null>} Created task or null on error
 */
export async function createTask(taskData) {
  try {
    const task = {
      id: generateId(),
      title: taskData.title || '',
      description: taskData.description || '',
      dueDate: taskData.dueDate || '',
      priority: taskData.priority || PRIORITY.MEDIUM,
      status: taskData.status || TASK_STATUS.TODO,
      category: taskData.category || '',
      assignees: taskData.assignees || [],
      subtasks: taskData.subtasks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await TaskService.create(task);
    return result ? { ...task, ...result } : null;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

/**
 * Updates an existing task
 * @param {string} taskId - Task ID
 * @param {Object} updates - Task updates object
 * @returns {Promise<boolean>} Success status
 */
export async function updateTask(taskId, updates) {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const result = await TaskService.update(taskId, updateData);
    return !!result;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
}

/**
 * Deletes a task
 * @param {string} taskId - Task ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteTask(taskId) {
  try {
    const result = await TaskService.delete(taskId);
    return !!result;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

/**
 * Gets all tasks
 * @returns {Promise<Array>} Array of tasks
 */
export async function getAllTasks() {
  try {
    const data = await TaskService.getAll();
    return normalizeTasks(data);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

/**
 * Gets a single task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object|null>} Task object or null
 */
export async function getTaskById(taskId) {
  try {
    return await TaskService.get(taskId);
  } catch (error) {
    console.error('Error loading task:', error);
    return null;
  }
}

/**
 * Filters tasks by status
 * @param {Array} tasks - Array of tasks
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered tasks
 */
export function filterTasksByStatus(tasks, status) {
  return tasks.filter(task => task.status === status);
}

/**
 * Filters tasks by priority
 * @param {Array} tasks - Array of tasks
 * @param {string} priority - Priority to filter by
 * @returns {Array} Filtered tasks
 */
export function filterTasksByPriority(tasks, priority) {
  return tasks.filter(task => task.priority === priority);
}

/**
 * Searches tasks by title and description
 * @param {Array} tasks - Array of tasks
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered tasks
 */
export function searchTasks(tasks, searchTerm) {
  if (!searchTerm.trim()) return tasks;
  
  const term = searchTerm.toLowerCase();
  return tasks.filter(task => 
    (task.title || '').toLowerCase().includes(term) ||
    (task.description || '').toLowerCase().includes(term)
  );
}

/**
 * Moves a task to a different status
 * @param {string} taskId - Task ID
 * @param {string} newStatus - New status
 * @returns {Promise<boolean>} Success status
 */
export async function moveTaskToStatus(taskId, newStatus) {
  return await updateTask(taskId, { status: newStatus });
}

/**
 * Gets tasks grouped by status
 * @returns {Promise<Object>} Tasks grouped by status
 */
export async function getTasksByStatus() {
  const tasks = await getAllTasks();
  
  return {
    todo: filterTasksByStatus(tasks, TASK_STATUS.TODO),
    inProgress: filterTasksByStatus(tasks, TASK_STATUS.IN_PROGRESS),
    awaitFeedback: filterTasksByStatus(tasks, TASK_STATUS.AWAIT_FEEDBACK),
    done: filterTasksByStatus(tasks, TASK_STATUS.DONE)
  };
}

/**
 * Gets urgent tasks that are not done
 * @returns {Promise<Array>} Array of urgent tasks
 */
export async function getUrgentTasks() {
  const tasks = await getAllTasks();
  return tasks.filter(task => 
    task.priority === PRIORITY.HIGH && 
    task.status !== TASK_STATUS.DONE
  );
}

/**
 * Validates task data
 * @param {Object} taskData - Task data to validate
 * @returns {Object} Validation result with errors array
 */
export function validateTaskData(taskData) {
  const errors = [];
  
  if (!taskData.title || !taskData.title.trim()) {
    errors.push('Title is required');
  }
  
  if (taskData.title && taskData.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  if (!taskData.dueDate) {
    errors.push('Due date is required');
  }
  
  if (!taskData.category || !taskData.category.trim()) {
    errors.push('Category is required');
  }
  
  if (taskData.priority && !Object.values(PRIORITY).includes(taskData.priority)) {
    errors.push('Invalid priority level');
  }
  
  if (taskData.status && !Object.values(TASK_STATUS).includes(taskData.status)) {
    errors.push('Invalid task status');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
