/**
 * Announcements Service
 * Firebase operations for announcement management
 */

import { USE_MOCK_DATA } from '../mocks/mockConfig';
import { mockAnnouncements } from '../mocks/mockData';

// ─── mock write no-op ────────────────────────────────────────────────────────
const mockWrite = (label) => {
  console.info(`[MOCK] ${label} — write skipped (USE_MOCK_DATA=true)`);
  return Promise.resolve('mock-id');
};

import {
  createDocument,
  getDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  queryDocuments,
  COLLECTIONS,
} from './firebaseService';

// Extended collections for announcements
const ANNOUNCEMENTS_COLLECTION = 'announcements';

/**
 * Create announcement
 * @param {Object} announcementData - Announcement details
 * @returns {Promise<string>} Document ID
 */
export const createAnnouncement = async (announcementData) => {
  if (USE_MOCK_DATA) return mockWrite('createAnnouncement');
  const announcement = {
    ...announcementData,
    status: announcementData.status || 'published',
    views: 0,
    likes: 0,
  };
  
  return await createDocument(ANNOUNCEMENTS_COLLECTION, announcement);
};

/**
 * Get announcement by ID
 * @param {string} announcementId - Announcement ID
 * @returns {Promise<Object>} Announcement data
 */
export const getAnnouncement = async (announcementId) => {
  if (USE_MOCK_DATA) return mockAnnouncements.find((a) => a.id === announcementId) ?? null;
  return await getDocument(ANNOUNCEMENTS_COLLECTION, announcementId);
};

/**
 * Get all announcements
 * @returns {Promise<Array>} Array of announcements
 */
export const getAllAnnouncements = async () => {
  if (USE_MOCK_DATA)
    return [...mockAnnouncements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return await queryDocuments(
    ANNOUNCEMENTS_COLLECTION,
    [],
    { orderBy: { field: 'createdAt', direction: 'desc' } }
  );
};

/**
 * Get published announcements
 * @param {number} limit - Number of announcements to fetch
 * @returns {Promise<Array>} Array of announcements
 */
export const getPublishedAnnouncements = async (limit = 50) => {
  if (USE_MOCK_DATA)
    return [...mockAnnouncements]
      .filter((a) => a.status === 'published')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  return await queryDocuments(
    ANNOUNCEMENTS_COLLECTION,
    [{ field: 'status', operator: '==', value: 'published' }],
    {
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit,
    }
  );
};

/**
 * Get announcements by category
 * @param {string} category - Announcement category
 * @returns {Promise<Array>} Array of announcements
 */
export const getAnnouncementsByCategory = async (category) => {
  return await queryDocuments(
    ANNOUNCEMENTS_COLLECTION,
    [{ field: 'category', operator: '==', value: category }],
    { orderBy: { field: 'createdAt', direction: 'desc' } }
  );
};

/**
 * Update announcement
 * @param {string} announcementId - Announcement ID
 * @param {Object} updates - Fields to update
 */
export const updateAnnouncement = async (announcementId, updates) => {
  if (USE_MOCK_DATA) return mockWrite('updateAnnouncement');
  return await updateDocument(ANNOUNCEMENTS_COLLECTION, announcementId, updates);
};

/**
 * Increment announcement views
 * @param {string} announcementId - Announcement ID
 */
export const incrementViews = async (announcementId) => {
  const announcement = await getAnnouncement(announcementId);
  return await updateDocument(ANNOUNCEMENTS_COLLECTION, announcementId, {
    views: (announcement.views || 0) + 1,
  });
};

/**
 * Toggle announcement like
 * @param {string} announcementId - Announcement ID
 * @param {boolean} isLiked - Whether to like or unlike
 */
export const toggleLike = async (announcementId, isLiked) => {
  const announcement = await getAnnouncement(announcementId);
  return await updateDocument(ANNOUNCEMENTS_COLLECTION, announcementId, {
    likes: (announcement.likes || 0) + (isLiked ? 1 : -1),
  });
};

/**
 * Delete announcement
 * @param {string} announcementId - Announcement ID
 */
export const deleteAnnouncement = async (announcementId) => {
  if (USE_MOCK_DATA) return mockWrite('deleteAnnouncement');
  return await deleteDocument(ANNOUNCEMENTS_COLLECTION, announcementId);
};

export default {
  createAnnouncement,
  getAnnouncement,
  getAllAnnouncements,
  getPublishedAnnouncements,
  getAnnouncementsByCategory,
  updateAnnouncement,
  incrementViews,
  toggleLike,
  deleteAnnouncement,
};
