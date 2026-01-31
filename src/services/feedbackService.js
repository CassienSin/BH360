/**
 * Feedback Service
 * Firebase operations for feedback management
 */

import {
  createDocument,
  getDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  queryDocuments,
  COLLECTIONS,
} from './firebaseService';

/**
 * Submit feedback
 * @param {Object} feedbackData - Feedback details
 * @returns {Promise<string>} Document ID
 */
export const submitFeedback = async (feedbackData) => {
  const feedback = {
    ...feedbackData,
    status: 'pending',
    response: null,
  };
  
  return await createDocument(COLLECTIONS.FEEDBACK, feedback);
};

/**
 * Get feedback by ID
 * @param {string} feedbackId - Feedback ID
 * @returns {Promise<Object>} Feedback data
 */
export const getFeedback = async (feedbackId) => {
  return await getDocument(COLLECTIONS.FEEDBACK, feedbackId);
};

/**
 * Get all feedback
 * @returns {Promise<Array>} Array of feedback
 */
export const getAllFeedback = async () => {
  return await queryDocuments(
    COLLECTIONS.FEEDBACK,
    [],
    { orderBy: { field: 'createdAt', direction: 'desc' } }
  );
};

/**
 * Get feedback by user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of feedback
 */
export const getUserFeedback = async (userId) => {
  return await queryDocuments(
    COLLECTIONS.FEEDBACK,
    [{ field: 'userId', operator: '==', value: userId }],
    { orderBy: { field: 'createdAt', direction: 'desc' } }
  );
};

/**
 * Get feedback by status
 * @param {string} status - Feedback status
 * @returns {Promise<Array>} Array of feedback
 */
export const getFeedbackByStatus = async (status) => {
  return await queryDocuments(
    COLLECTIONS.FEEDBACK,
    [{ field: 'status', operator: '==', value: status }],
    { orderBy: { field: 'createdAt', direction: 'desc' } }
  );
};

/**
 * Update feedback
 * @param {string} feedbackId - Feedback ID
 * @param {Object} updates - Fields to update
 */
export const updateFeedback = async (feedbackId, updates) => {
  return await updateDocument(COLLECTIONS.FEEDBACK, feedbackId, updates);
};

/**
 * Respond to feedback
 * @param {string} feedbackId - Feedback ID
 * @param {string} response - Response message
 */
export const respondToFeedback = async (feedbackId, response) => {
  return await updateDocument(COLLECTIONS.FEEDBACK, feedbackId, {
    response,
    status: 'resolved',
    respondedAt: new Date(),
  });
};

/**
 * Delete feedback
 * @param {string} feedbackId - Feedback ID
 */
export const deleteFeedback = async (feedbackId) => {
  return await deleteDocument(COLLECTIONS.FEEDBACK, feedbackId);
};

export default {
  submitFeedback,
  getFeedback,
  getAllFeedback,
  getUserFeedback,
  getFeedbackByStatus,
  updateFeedback,
  respondToFeedback,
  deleteFeedback,
};
