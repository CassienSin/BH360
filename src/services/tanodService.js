/**
 * Tanod Service
 * Firebase operations for tanod/barangay official management
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
  getServerTimestamp,
} from './firebaseService';

/**
 * Get all tanod members
 * @returns {Promise<Array>} Array of tanod users
 */
export const getAllTanods = async () => {
  return await queryDocuments(
    COLLECTIONS.USERS,
    [{ field: 'role', operator: '==', value: 'tanod' }]
  );
};

/**
 * Get tanod by ID
 * @param {string} tanodId - Tanod user ID
 * @returns {Promise<Object>} Tanod data
 */
export const getTanod = async (tanodId) => {
  return await getDocument(COLLECTIONS.TANOD, tanodId);
};

/**
 * Get active tanods (on duty)
 * @returns {Promise<Array>} Array of active tanods
 */
export const getActiveTanods = async () => {
  return await queryDocuments(
    COLLECTIONS.TANOD,
    [{ field: 'status', operator: '==', value: 'active' }]
  );
};

/**
 * Update tanod status
 * @param {string} tanodId - Tanod user ID
 * @param {string} status - New status (active, inactive, on-leave)
 */
export const updateTanodStatus = async (tanodId, status) => {
  return await updateDocument(COLLECTIONS.TANOD, tanodId, { status });
};

/**
 * Record tanod attendance
 * @param {Object} attendanceData - Attendance details
 * @returns {Promise<string>} Document ID
 */
export const recordAttendance = async (attendanceData) => {
  const attendance = {
    ...attendanceData,
    checkInTime: attendanceData.checkInTime || getServerTimestamp(),
    checkOutTime: null,
    duration: null,
  };
  
  return await createDocument(COLLECTIONS.ATTENDANCE, attendance);
};

/**
 * Update attendance checkout
 * @param {string} attendanceId - Attendance record ID
 * @param {Date} checkOutTime - Checkout time
 */
export const checkoutAttendance = async (attendanceId, checkOutTime = new Date()) => {
  const attendance = await getDocument(COLLECTIONS.ATTENDANCE, attendanceId);
  const checkInTime = attendance.checkInTime?.toDate() || new Date();
  const duration = Math.floor((checkOutTime - checkInTime) / (1000 * 60)); // Duration in minutes
  
  return await updateDocument(COLLECTIONS.ATTENDANCE, attendanceId, {
    checkOutTime,
    duration,
  });
};

/**
 * Get attendance records for a tanod
 * @param {string} tanodId - Tanod user ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of attendance records
 */
export const getTanodAttendance = async (tanodId, options = {}) => {
  return await queryDocuments(
    COLLECTIONS.ATTENDANCE,
    [{ field: 'tanodId', operator: '==', value: tanodId }],
    {
      orderBy: { field: 'checkInTime', direction: 'desc' },
      ...options,
    }
  );
};

/**
 * Get all attendance records
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of attendance records
 */
export const getAllAttendance = async (options = {}) => {
  return await queryDocuments(
    COLLECTIONS.ATTENDANCE,
    [],
    {
      orderBy: { field: 'checkInTime', direction: 'desc' },
      ...options,
    }
  );
};

/**
 * Create schedule for tanod
 * @param {Object} scheduleData - Schedule details
 * @returns {Promise<string>} Document ID
 */
export const createSchedule = async (scheduleData) => {
  return await createDocument(COLLECTIONS.SCHEDULES, scheduleData);
};

/**
 * Get schedules for tanod
 * @param {string} tanodId - Tanod user ID
 * @returns {Promise<Array>} Array of schedules
 */
export const getTanodSchedules = async (tanodId) => {
  return await queryDocuments(
    COLLECTIONS.SCHEDULES,
    [{ field: 'tanodId', operator: '==', value: tanodId }],
    { orderBy: { field: 'date', direction: 'asc' } }
  );
};

/**
 * Get all schedules
 * @returns {Promise<Array>} Array of schedules
 */
export const getAllSchedules = async () => {
  return await queryDocuments(
    COLLECTIONS.SCHEDULES,
    [],
    { orderBy: { field: 'date', direction: 'asc' } }
  );
};

/**
 * Update schedule
 * @param {string} scheduleId - Schedule ID
 * @param {Object} updates - Fields to update
 */
export const updateSchedule = async (scheduleId, updates) => {
  return await updateDocument(COLLECTIONS.SCHEDULES, scheduleId, updates);
};

/**
 * Delete schedule
 * @param {string} scheduleId - Schedule ID
 */
export const deleteSchedule = async (scheduleId) => {
  return await deleteDocument(COLLECTIONS.SCHEDULES, scheduleId);
};

/**
 * Get tanod performance metrics
 * @param {string} tanodId - Tanod user ID
 * @returns {Promise<Object>} Performance metrics
 */
export const getTanodPerformance = async (tanodId) => {
  // Get all incidents assigned to this tanod
  const incidents = await queryDocuments(
    COLLECTIONS.INCIDENTS,
    [{ field: 'assignedTo', operator: '==', value: tanodId }]
  );
  
  // Get attendance records
  const attendance = await getTanodAttendance(tanodId);
  
  // Calculate metrics
  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved').length;
  const totalAttendance = attendance.length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.duration || 0), 0) / 60;
  
  return {
    totalIncidents,
    resolvedIncidents,
    resolutionRate: totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0,
    totalAttendance,
    totalHours: totalHours.toFixed(1),
    averageResponseTime: 0, // Can be calculated from incident timestamps
  };
};

/**
 * Subscribe to real-time tanod updates
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTanods = (callback) => {
  return subscribeToQuery(
    COLLECTIONS.USERS,
    [{ field: 'role', operator: '==', value: 'tanod' }],
    {},
    callback
  );
};

export default {
  getAllTanods,
  getTanod,
  getActiveTanods,
  updateTanodStatus,
  recordAttendance,
  checkoutAttendance,
  getTanodAttendance,
  getAllAttendance,
  createSchedule,
  getTanodSchedules,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
  getTanodPerformance,
  subscribeToTanods,
};
