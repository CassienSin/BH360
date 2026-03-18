/**
 * Tickets Service
 * Firebase operations for helpdesk ticket management
 */

import { USE_MOCK_DATA } from '../mocks/mockConfig';
import { mockTickets, mockTicketStats } from '../mocks/mockData';

// ─── mock write no-op ────────────────────────────────────────────────────────
const mockWrite = (label) => {
  console.info(`[MOCK] ${label} — write skipped (USE_MOCK_DATA=true)`);
  return Promise.resolve('mock-id');
};

import { arrayUnion } from 'firebase/firestore';
import {
  createDocument,
  getDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  queryDocuments,
  COLLECTIONS,
} from './firebaseService';

// Extended collections for tickets
const TICKETS_COLLECTION = 'tickets';

/**
 * Create ticket
 * @param {Object} ticketData - Ticket details
 * @returns {Promise<string>} Document ID
 */
export const createTicket = async (ticketData) => {
  if (USE_MOCK_DATA) return mockWrite('createTicket');
  const ticket = {
    ...ticketData,
    status: ticketData.status || 'open',
    priority: ticketData.priority || 'medium',
    assignedTo: ticketData.assignedTo || null,
    resolvedAt: null,
    messages: [],
  };
  
  return await createDocument(TICKETS_COLLECTION, ticket);
};

/**
 * Get ticket by ID
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Object>} Ticket data
 */
export const getTicket = async (ticketId) => {
  if (USE_MOCK_DATA) return mockTickets.find((t) => t.id === ticketId) ?? null;
  return await getDocument(TICKETS_COLLECTION, ticketId);
};

/**
 * Get all tickets
 * @returns {Promise<Array>} Array of tickets
 */
export const getAllTickets = async () => {
  if (USE_MOCK_DATA)
    return [...mockTickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return await queryDocuments(
    TICKETS_COLLECTION,
    [],
    { orderBy: { field: 'createdAt', direction: 'desc' } }
  );
};

/**
 * Get tickets by status
 * @param {string} status - Ticket status
 * @returns {Promise<Array>} Array of tickets
 */
export const getTicketsByStatus = async (status) => {
  return await queryDocuments(
    TICKETS_COLLECTION,
    [{ field: 'status', operator: '==', value: status }],
    { orderBy: { field: 'createdAt', direction: 'desc' } }
  );
};

/**
 * Get tickets by user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of tickets
 */
export const getUserTickets = async (userId) => {
  if (USE_MOCK_DATA)
    return [...mockTickets]
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return await queryDocuments(
    TICKETS_COLLECTION,
    [{ field: 'userId', operator: '==', value: userId }],
    { orderBy: { field: 'createdAt', direction: 'desc' } }
  );
};

/**
 * Get tickets assigned to agent
 * @param {string} agentId - Agent user ID
 * @returns {Promise<Array>} Array of tickets
 */
export const getAssignedTickets = async (agentId) => {
  return await queryDocuments(
    TICKETS_COLLECTION,
    [{ field: 'assignedTo', operator: '==', value: agentId }],
    { orderBy: { field: 'createdAt', direction: 'desc' } }
  );
};

/**
 * Update ticket
 * @param {string} ticketId - Ticket ID
 * @param {Object} updates - Fields to update
 */
export const updateTicket = async (ticketId, updates) => {
  if (USE_MOCK_DATA) return mockWrite('updateTicket');
  return await updateDocument(TICKETS_COLLECTION, ticketId, updates);
};

/**
 * Assign ticket to agent
 * @param {string} ticketId - Ticket ID
 * @param {string} agentId - Agent user ID
 */
export const assignTicket = async (ticketId, agentId) => {
  if (USE_MOCK_DATA) return mockWrite('assignTicket');
  return await updateDocument(TICKETS_COLLECTION, ticketId, {
    assignedTo: agentId,
    status: 'in-progress',
  });
};

/**
 * Add message to ticket (atomic via arrayUnion)
 * @param {string} ticketId - Ticket ID
 * @param {Object} message - Message object
 */
export const addTicketMessage = async (ticketId, message) => {
  if (USE_MOCK_DATA) return mockWrite('addTicketMessage');
  return await updateDocument(TICKETS_COLLECTION, ticketId, {
    messages: arrayUnion({
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }),
  });
};

/**
 * Add feedback to ticket (atomic via arrayUnion)
 * @param {string} ticketId - Ticket ID
 * @param {Object} feedback - Feedback object
 */
export const addTicketFeedback = async (ticketId, feedback) => {
  if (USE_MOCK_DATA) return mockWrite('addTicketFeedback');
  return await updateDocument(TICKETS_COLLECTION, ticketId, {
    feedback: arrayUnion({
      ...feedback,
      id: `feedback-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }),
  });
};

/**
 * Resolve ticket
 * @param {string} ticketId - Ticket ID
 * @param {Object} resolution - Resolution details
 */
export const resolveTicket = async (ticketId, resolution = {}) => {
  if (USE_MOCK_DATA) return mockWrite('resolveTicket');
  return await updateDocument(TICKETS_COLLECTION, ticketId, {
    status: 'resolved',
    resolvedAt: new Date(),
    resolution,
  });
};

/**
 * Close ticket
 * @param {string} ticketId - Ticket ID
 */
export const closeTicket = async (ticketId) => {
  if (USE_MOCK_DATA) return mockWrite('closeTicket');
  return await updateDocument(TICKETS_COLLECTION, ticketId, {
    status: 'closed',
    closedAt: new Date(),
  });
};

/**
 * Delete ticket
 * @param {string} ticketId - Ticket ID
 */
export const deleteTicket = async (ticketId) => {
  if (USE_MOCK_DATA) return mockWrite('deleteTicket');
  return await deleteDocument(TICKETS_COLLECTION, ticketId);
};

/**
 * Get ticket statistics
 * @returns {Promise<Object>} Statistics object
 */
export const getTicketStats = async () => {
  if (USE_MOCK_DATA) return { ...mockTicketStats };
  const allTickets = await getAllTickets();
  
  return {
    total: allTickets.length,
    open: allTickets.filter((t) => t.status === 'open').length,
    inProgress: allTickets.filter((t) => t.status === 'in-progress').length,
    resolved: allTickets.filter((t) => t.status === 'resolved').length,
    closed: allTickets.filter((t) => t.status === 'closed').length,
  };
};

export default {
  createTicket,
  getTicket,
  getAllTickets,
  getTicketsByStatus,
  getUserTickets,
  getAssignedTickets,
  updateTicket,
  assignTicket,
  addTicketMessage,
  addTicketFeedback,
  resolveTicket,
  closeTicket,
  deleteTicket,
  getTicketStats,
};
