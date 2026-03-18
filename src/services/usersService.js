/**
 * Users Service
 * Firebase operations for user management
 */

import { USE_MOCK_DATA } from '../mocks/mockConfig';
import { mockUsers, mockUserStats } from '../mocks/mockData';

// ─── mock write no-op ────────────────────────────────────────────────────────
const mockWrite = (label) => {
  console.info(`[MOCK] ${label} — write skipped (USE_MOCK_DATA=true)`);
  return Promise.resolve('mock-id');
};

import {
  getDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  queryDocuments,
  setDocument,
  COLLECTIONS,
} from './firebaseService';

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
export const getUser = async (userId) => {
  if (USE_MOCK_DATA) return mockUsers.find((u) => u.id === userId) ?? null;
  return await getDocument(COLLECTIONS.USERS, userId);
};

/**
 * Get all users
 * @returns {Promise<Array>} Array of users
 */
export const getAllUsers = async () => {
  if (USE_MOCK_DATA) return [...mockUsers];
  return await getAllDocuments(COLLECTIONS.USERS);
};

/**
 * Get users by role
 * @param {string} role - User role (admin, tanod, resident)
 * @returns {Promise<Array>} Array of users
 */
export const getUsersByRole = async (role) => {
  if (USE_MOCK_DATA) return mockUsers.filter((u) => u.role === role);
  return await queryDocuments(
    COLLECTIONS.USERS,
    [{ field: 'role', operator: '==', value: role }]
  );
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 */
export const updateUserProfile = async (userId, updates) => {
  if (USE_MOCK_DATA) return mockWrite('updateUserProfile');
  return await updateDocument(COLLECTIONS.USERS, userId, updates);
};

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} role - New role
 */
export const updateUserRole = async (userId, role) => {
  if (USE_MOCK_DATA) return mockWrite('updateUserRole');
  return await updateDocument(COLLECTIONS.USERS, userId, { role });
};

/**
 * Create or update user document
 * @param {string} userId - User ID
 * @param {Object} userData - User data
 */
export const saveUser = async (userId, userData) => {
  if (USE_MOCK_DATA) return mockWrite('saveUser');
  return await setDocument(COLLECTIONS.USERS, userId, userData);
};

/**
 * Delete user
 * @param {string} userId - User ID
 */
export const deleteUser = async (userId) => {
  if (USE_MOCK_DATA) return mockWrite('deleteUser');
  return await deleteDocument(COLLECTIONS.USERS, userId);
};

/**
 * Search users by name or email
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of users
 */
export const searchUsers = async (searchTerm) => {
  if (USE_MOCK_DATA) {
    const term = searchTerm.toLowerCase();
    return mockUsers.filter((u) => {
      const name = (u.displayName || `${u.firstName} ${u.lastName}` || '').toLowerCase();
      return name.includes(term) || (u.email || '').toLowerCase().includes(term);
    });
  }
  const allUsers = await getAllUsers();
  const term = searchTerm.toLowerCase();
  
  return allUsers.filter((user) => {
    const name = (user.displayName || user.firstName + ' ' + user.lastName || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return name.includes(term) || email.includes(term);
  });
};

/**
 * Get user statistics
 * @returns {Promise<Object>} Statistics object
 */
export const getUserStats = async () => {
  if (USE_MOCK_DATA) return { ...mockUserStats };
  const allUsers = await getAllUsers();
  
  return {
    total: allUsers.length,
    admins: allUsers.filter((u) => u.role === 'admin').length,
    tanods: allUsers.filter((u) => u.role === 'tanod').length,
    residents: allUsers.filter((u) => u.role === 'resident').length,
  };
};

export default {
  getUser,
  getAllUsers,
  getUsersByRole,
  updateUserProfile,
  updateUserRole,
  saveUser,
  deleteUser,
  searchUsers,
  getUserStats,
};
