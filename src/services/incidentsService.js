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
import { getUser, updateUserProfile } from './usersService';
import { Timestamp } from 'firebase/firestore';

const INCIDENT_SPAM_RULES = {
  minIntervalMinutes: 10,
  maxPerHour: 3,
  maxPerDay: 10,
};

const createSpamError = (message) => {
  const error = new Error(message);
  error.code = 'incident/spam-limit';
  return error;
};

const getUserIncidentsWithin = async (userId, sinceTimestamp) => {
  try {
    return await queryDocuments(
      COLLECTIONS.INCIDENTS,
      [
        { field: 'userId', operator: '==', value: userId },
        { field: 'createdAt', operator: '>=', value: sinceTimestamp },
      ],
      { orderBy: { field: 'createdAt', direction: 'desc' } }
    );
  } catch (error) {
    if (error.message?.includes('index') || error.code === 'failed-precondition') {
      const allIncidents = await getAllDocuments(COLLECTIONS.INCIDENTS);
      return allIncidents.filter(
        (incident) =>
          incident.userId === userId &&
          incident.createdAt &&
          incident.createdAt.toDate &&
          incident.createdAt.toDate() >= sinceTimestamp.toDate()
      );
    }
    throw error;
  }
};

/**
 * Create a new incident
 * @param {Object} incidentData - Incident details
 * @returns {Promise<string>} Document ID
 */
export const createIncident = async (incidentData) => {
  const reporterId = incidentData.userId;
  if (reporterId) {
    const now = new Date();
    const minInterval = Timestamp.fromDate(new Date(now.getTime() - INCIDENT_SPAM_RULES.minIntervalMinutes * 60000));
    const hourAgo = Timestamp.fromDate(new Date(now.getTime() - 60 * 60000));
    const dayAgo = Timestamp.fromDate(new Date(now.getTime() - 24 * 60 * 60000));

    const recentDayIncidents = await getUserIncidentsWithin(reporterId, dayAgo);
    const reportsLast10Minutes = recentDayIncidents.filter((incident) => {
      const createdAt = incident.createdAt?.toDate ? incident.createdAt.toDate() : new Date(incident.createdAt);
      return createdAt >= minInterval.toDate();
    }).length;
    const reportsLastHour = recentDayIncidents.filter((incident) => {
      const createdAt = incident.createdAt?.toDate ? incident.createdAt.toDate() : new Date(incident.createdAt);
      return createdAt >= hourAgo.toDate();
    }).length;
    const reportsLastDay = recentDayIncidents.length;

    if (reportsLast10Minutes >= 1) {
      throw createSpamError(`Please wait ${INCIDENT_SPAM_RULES.minIntervalMinutes} minutes before submitting another incident report.`);
    }
    if (reportsLastHour >= INCIDENT_SPAM_RULES.maxPerHour) {
      throw createSpamError(`You have submitted too many incident reports in the last hour. Please wait and try again later.`);
    }
    if (reportsLastDay >= INCIDENT_SPAM_RULES.maxPerDay) {
      throw createSpamError(`You have reached the report limit for today. Please try again tomorrow.`);
    }

    const reporter = await getUser(reporterId);
    if (reporter?.blacklisted) {
      const error = new Error(
        'Your account is blocked from submitting incident reports due to repeated false reports.'
      );
      error.code = 'incident/blacklisted';
      throw error;
    }
  }

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
 * Mark an incident as a false report and warn the reporter.
 * @param {Object} params
 * @param {string} params.incidentId - Incident ID
 * @param {string} params.reporterId - User ID of reporter
 * @param {string} params.updatedBy - User ID or email of current tanod
 * @param {string} params.note - Optional reason/note
 */
export const markIncidentAsFalseReport = async ({ incidentId, reporterId, updatedBy, note }) => {
  await updateDocument(COLLECTIONS.INCIDENTS, incidentId, {
    status: 'false-report',
    falseReport: true,
    falseReportNote: note || 'Marked as false report by tanod.',
    rejectedAt: new Date(),
    updatedBy,
    notes: note || 'Marked as false report by tanod.',
  });

  if (!reporterId) return;

  const reporter = await getUser(reporterId);
  if (!reporter) return;

  const warnings = (reporter.falseReportWarnings || 0) + 1;
  await updateUserProfile(reporterId, {
    falseReportWarnings: warnings,
    blacklisted: warnings >= 3,
    blacklistedAt: warnings >= 3 ? new Date() : reporter.blacklistedAt || null,
  });
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
