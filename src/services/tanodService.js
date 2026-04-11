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

// ─── Tanod profile (stored in users collection) ───────────────────────────────

/**
 * Create a new tanod profile in the users collection
 */
export const createTanodProfile = async (profileData) => {
  return await createDocument(COLLECTIONS.USERS, { ...profileData, role: 'tanod' });
};

/**
 * Update an existing tanod's profile in the users collection
 */
export const updateTanodProfile = async (tanodId, updates) => {
  return await updateDocument(COLLECTIONS.USERS, tanodId, updates);
};

// ─── Patrol areas ──────────────────────────────────────────────────────────────

/** Default patrol areas seeded when the collection is empty */
const DEFAULT_PATROL_AREAS = [
  {
    name: 'Zone A – Poblacion',
    priority: 'high',
    coordinates: [
      { lat: 14.5995, lng: 120.9842 }, { lat: 14.601, lng: 120.9842 },
      { lat: 14.601, lng: 120.986 },   { lat: 14.5995, lng: 120.986 },
    ],
    assignedTanodIds: [],
  },
  {
    name: 'Zone B – Riverside',
    priority: 'medium',
    coordinates: [
      { lat: 14.597, lng: 120.982 }, { lat: 14.599, lng: 120.982 },
      { lat: 14.599, lng: 120.984 }, { lat: 14.597, lng: 120.984 },
    ],
    assignedTanodIds: [],
  },
  {
    name: 'Zone C – Market Area',
    priority: 'low',
    coordinates: [
      { lat: 14.600, lng: 120.986 }, { lat: 14.602, lng: 120.986 },
      { lat: 14.602, lng: 120.988 }, { lat: 14.600, lng: 120.988 },
    ],
    assignedTanodIds: [],
  },
];

export const getAllPatrolAreas = async () => {
  const areas = await getAllDocuments(COLLECTIONS.PATROL_AREAS);
  if (areas.length === 0) {
    // Seed defaults on first load
    await Promise.all(
      DEFAULT_PATROL_AREAS.map((area) => createDocument(COLLECTIONS.PATROL_AREAS, area))
    );
    return await getAllDocuments(COLLECTIONS.PATROL_AREAS);
  }
  return areas;
};

export const createPatrolArea = async (areaData) => {
  return await createDocument(COLLECTIONS.PATROL_AREAS, areaData);
};

export const updatePatrolAreaById = async (areaId, updates) => {
  return await updateDocument(COLLECTIONS.PATROL_AREAS, areaId, updates);
};

export const deletePatrolArea = async (areaId) => {
  return await deleteDocument(COLLECTIONS.PATROL_AREAS, areaId);
};

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
  // No server-side orderBy to avoid requiring a Firestore composite index.
  // Sort client-side instead.
  const results = await queryDocuments(
    COLLECTIONS.ATTENDANCE,
    [{ field: 'tanodId', operator: '==', value: tanodId }],
    options
  );
  return results.sort((a, b) => {
    const aTime = a.checkInTime?.toDate ? a.checkInTime.toDate() : new Date(a.checkInTime || 0);
    const bTime = b.checkInTime?.toDate ? b.checkInTime.toDate() : new Date(b.checkInTime || 0);
    return bTime - aTime; // desc
  });
};

/**
 * Get all attendance records
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of attendance records
 */
export const getAllAttendance = async (options = {}) => {
  const results = await queryDocuments(COLLECTIONS.ATTENDANCE, [], options);
  return results.sort((a, b) => {
    const aTime = a.checkInTime?.toDate ? a.checkInTime.toDate() : new Date(a.checkInTime || 0);
    const bTime = b.checkInTime?.toDate ? b.checkInTime.toDate() : new Date(b.checkInTime || 0);
    return bTime - aTime; // desc
  });
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
  // No server-side orderBy to avoid requiring a Firestore composite index.
  // Sort client-side instead.
  const results = await queryDocuments(
    COLLECTIONS.SCHEDULES,
    [{ field: 'tanodId', operator: '==', value: tanodId }]
  );
  return results.sort((a, b) => {
    const aDate = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
    const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
    return aDate - bDate; // asc
  });
};

/**
 * Get all schedules
 * @returns {Promise<Array>} Array of schedules
 */
export const getAllSchedules = async () => {
  const results = await queryDocuments(COLLECTIONS.SCHEDULES, []);
  return results.sort((a, b) => {
    const aDate = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
    const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
    return aDate - bDate; // asc
  });
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
  createTanodProfile,
  updateTanodProfile,
  getAllPatrolAreas,
  createPatrolArea,
  updatePatrolAreaById,
  deletePatrolArea,
};
