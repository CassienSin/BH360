/**
 * Incidents Service
 * Firebase operations for incident management
 */

import {
  createDocument,
  getDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  queryDocuments,
  subscribeToQuery,
  COLLECTIONS,
} from './firebaseService';

/**
 * Create a new incident
 * @param {Object} incidentData - Incident details
 * @returns {Promise<string>} Document ID
 */
export const createIncident = async (incidentData) => {
  const incident = {
    ...incidentData,
    status: incidentData.status || 'submitted',
    priority: incidentData.priority || 'medium',
    assignedTo: incidentData.assignedTo || null,
    resolvedAt: null,
  };
  
  return await createDocument(COLLECTIONS.INCIDENTS, incident);
};

/**
 * Get incident by ID
 * @param {string} incidentId - Incident ID
 * @returns {Promise<Object>} Incident data
 */
export const getIncident = async (incidentId) => {
  return await getDocument(COLLECTIONS.INCIDENTS, incidentId);
};

/**
 * Get all incidents
 * @returns {Promise<Array>} Array of incidents
 */
export const getAllIncidents = async () => {
  return await getAllDocuments(COLLECTIONS.INCIDENTS);
};

/**
 * Get incidents by status
 * @param {string} status - Incident status
 * @returns {Promise<Array>} Array of incidents
 */
export const getIncidentsByStatus = async (status) => {
  try {
    // Try with orderBy first (requires composite index)
    return await queryDocuments(
      COLLECTIONS.INCIDENTS,
      [{ field: 'status', operator: '==', value: status }],
      { orderBy: { field: 'createdAt', direction: 'desc' } }
    );
  } catch (error) {
    // If index error, fall back to query without orderBy
    if (error.message?.includes('index') || error.code === 'failed-precondition') {
      console.warn('Composite index not available, fetching without orderBy. Create the index for better performance.');
      const incidents = await queryDocuments(
        COLLECTIONS.INCIDENTS,
        [{ field: 'status', operator: '==', value: status }]
      );
      // Sort in memory
      return incidents.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
    }
    throw error;
  }
};

/**
 * Get incidents by assigned tanod
 * @param {string} tanodId - Tanod user ID
 * @returns {Promise<Array>} Array of incidents
 */
export const getIncidentsByTanod = async (tanodId) => {
  try {
    // Try with orderBy first (requires composite index)
    return await queryDocuments(
      COLLECTIONS.INCIDENTS,
      [{ field: 'assignedTo', operator: '==', value: tanodId }],
      { orderBy: { field: 'createdAt', direction: 'desc' } }
    );
  } catch (error) {
    // If index error, fall back to query without orderBy
    if (error.message?.includes('index') || error.code === 'failed-precondition') {
      console.warn('Composite index not available, fetching without orderBy. Create the index for better performance.');
      const incidents = await queryDocuments(
        COLLECTIONS.INCIDENTS,
        [{ field: 'assignedTo', operator: '==', value: tanodId }]
      );
      // Sort in memory
      return incidents.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
    }
    throw error;
  }
};

/**
 * Get recent incidents
 * @param {number} limit - Number of incidents to fetch
 * @returns {Promise<Array>} Array of incidents
 */
export const getRecentIncidents = async (limit = 10) => {
  return await queryDocuments(
    COLLECTIONS.INCIDENTS,
    [],
    {
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit,
    }
  );
};

/**
 * Update incident
 * @param {string} incidentId - Incident ID
 * @param {Object} updates - Fields to update
 */
export const updateIncident = async (incidentId, updates) => {
  return await updateDocument(COLLECTIONS.INCIDENTS, incidentId, updates);
};

/**
 * Assign incident to tanod
 * @param {string} incidentId - Incident ID
 * @param {string} tanodId - Tanod user ID
 */
export const assignIncident = async (incidentId, tanodId) => {
  return await updateDocument(COLLECTIONS.INCIDENTS, incidentId, {
    assignedTo: tanodId,
    status: 'in-progress',
  });
};

/**
 * Resolve incident
 * @param {string} incidentId - Incident ID
 * @param {Object} resolution - Resolution details
 */
export const resolveIncident = async (incidentId, resolution = {}) => {
  return await updateDocument(COLLECTIONS.INCIDENTS, incidentId, {
    status: 'resolved',
    resolvedAt: new Date(),
    resolution,
  });
};

/**
 * Delete incident
 * @param {string} incidentId - Incident ID
 */
export const deleteIncident = async (incidentId) => {
  return await deleteDocument(COLLECTIONS.INCIDENTS, incidentId);
};

/**
 * Subscribe to real-time incident updates
 * @param {Array} filters - Query filters
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToIncidents = (filters = [], callback) => {
  return subscribeToQuery(
    COLLECTIONS.INCIDENTS,
    filters,
    { orderBy: { field: 'createdAt', direction: 'desc' } },
    callback
  );
};

/**
 * Get incident statistics
 * @returns {Promise<Object>} Statistics object
 */
export const getIncidentStats = async () => {
  const allIncidents = await getAllIncidents();
  
  return {
    total: allIncidents.length,
    submitted: allIncidents.filter((i) => i.status === 'submitted').length,
    inProgress: allIncidents.filter((i) => i.status === 'in-progress').length,
    resolved: allIncidents.filter((i) => i.status === 'resolved').length,
    rejected: allIncidents.filter((i) => i.status === 'rejected').length,
  };
};

export default {
  createIncident,
  getIncident,
  getAllIncidents,
  getIncidentsByStatus,
  getIncidentsByTanod,
  getRecentIncidents,
  updateIncident,
  assignIncident,
  resolveIncident,
  deleteIncident,
  subscribeToIncidents,
  getIncidentStats,
};
