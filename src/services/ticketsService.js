/**
 * Tickets Service
 * Firebase operations for helpdesk ticket management
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

// Extended collections for tickets
const TICKETS_COLLECTION = 'tickets';

/**
 * Create ticket
 * @param {Object} ticketData - Ticket details
 * @returns {Promise<string>} Document ID
 */
export const createTicket = async (ticketData) => {
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
  return await getDocument(TICKETS_COLLECTION, ticketId);
};

/**
 * Get all tickets
 * @returns {Promise<Array>} Array of tickets
 */
export const getAllTickets = async () => {
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
  return await updateDocument(TICKETS_COLLECTION, ticketId, updates);
};

/**
 * Assign ticket to agent
 * @param {string} ticketId - Ticket ID
 * @param {string} agentId - Agent user ID
 */
export const assignTicket = async (ticketId, agentId) => {
  return await updateDocument(TICKETS_COLLECTION, ticketId, {
    assignedTo: agentId,
    status: 'in-progress',
  });
};

/**
 * Add message to ticket
 * @param {string} ticketId - Ticket ID
 * @param {Object} message - Message object
 */
export const addTicketMessage = async (ticketId, message) => {
  const ticket = await getTicket(ticketId);
  const messages = ticket.messages || [];
  
  return await updateDocument(TICKETS_COLLECTION, ticketId, {
    messages: [
      ...messages,
      {
        ...message,
        timestamp: new Date(),
      },
    ],
  });
};

/**
 * Resolve ticket
 * @param {string} ticketId - Ticket ID
 * @param {Object} resolution - Resolution details
 */
export const resolveTicket = async (ticketId, resolution = {}) => {
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
  return await deleteDocument(TICKETS_COLLECTION, ticketId);
};

/**
 * Get ticket statistics
 * @returns {Promise<Object>} Statistics object
 */
export const getTicketStats = async () => {
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
  resolveTicket,
  closeTicket,
  deleteTicket,
  getTicketStats,
};
