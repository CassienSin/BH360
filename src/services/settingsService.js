/**
 * Settings Service
 * Firestore persistence for all Settings & System Configuration sections.
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createDocument, getDocument, queryDocuments, COLLECTIONS } from './firebaseService';

// ── Document IDs inside the 'settings' collection ───────────────────────────

export const SETTINGS_DOCS = {
  GENERAL:       'general',
  OPERATIONAL:   'operational',
  NOTIFICATIONS: 'notifications',
  PERMISSIONS:   'permissions',
  SLA:           'sla',
  APPEARANCE:    'appearance',
};

export const AUDIT_COLLECTION = 'auditLogs';

// ── Default values (used when the Firestore doc doesn't exist yet) ───────────

export const DEFAULTS = {
  general: {
    name:         'Barangay San Isidro',
    municipality: 'Quezon City',
    province:     'Metro Manila',
    zipCode:      '1100',
    email:        'bsanisidro@quezoncity.gov.ph',
    phone:        '+63 917 555 0100',
    captain:      'Hon. Ricardo S. Dela Cruz',
    version:      'BH360 v2.1.4',
    timezone:     'Asia/Manila (UTC+8)',
    language:     'English',
    dateFormat:   'MM/DD/YYYY',
  },

  operational: {
    selfRegistration:   true,
    aiHelpDesk:         true,
    communityFeedback:  true,
    publicIncidentMap:  false,
    emailNotifications: true,
    incidentsPerPage:   20,
    mapZoomLevel:       14,
    sessionTimeout:     60,
  },

  // notifications: { events: { [eventKey]: { [role]: { email, push } } } }
  notifications: {
    events: {
      newIncident:  { admin: { email: true,  push: true  }, staff: { email: false, push: true  }, tanod: { email: false, push: true  }, resident: { email: false, push: false } },
      resolved:     { admin: { email: true,  push: false }, staff: { email: true,  push: false }, tanod: { email: false, push: false }, resident: { email: true,  push: false } },
      feedback:     { admin: { email: false, push: true  }, staff: { email: false, push: true  }, tanod: { email: false, push: false }, resident: { email: false, push: false } },
      taskAssigned: { admin: { email: false, push: false }, staff: { email: false, push: false }, tanod: { email: true,  push: true  }, resident: { email: false, push: false } },
      announcement: { admin: { email: true,  push: true  }, staff: { email: false, push: true  }, tanod: { email: false, push: true  }, resident: { email: false, push: true  } },
    },
  },

  // permissions: { [featureKey]: { admin, staff, tanod, resident } }
  permissions: {
    viewDashboard:    { admin: true,  staff: true,  tanod: true,  resident: true  },
    createIncident:   { admin: true,  staff: true,  tanod: false, resident: true  },
    manageIncidents:  { admin: true,  staff: true,  tanod: false, resident: false },
    assignTanod:      { admin: true,  staff: true,  tanod: false, resident: false },
    userManagement:   { admin: true,  staff: false, tanod: false, resident: false },
    viewAnalytics:    { admin: true,  staff: true,  tanod: false, resident: false },
    tanodManagement:  { admin: true,  staff: true,  tanod: false, resident: false },
    systemSettings:   { admin: true,  staff: false, tanod: false, resident: false },
    aiHelpDesk:       { admin: true,  staff: true,  tanod: true,  resident: true  },
    announcements:    { admin: true,  staff: true,  tanod: true,  resident: true  },
    ticketManagement: { admin: true,  staff: true,  tanod: false, resident: true  },
  },

  // sla: array of threshold objects (stored as 'thresholds' field)
  sla: [
    { key: 'criticalEsc', label: 'Critical – Emergency Escalation', desc: 'Immediate escalation threshold', value: 5,  unit: 'minutes', color: 'error'   },
    { key: 'highFirst',   label: 'High Priority – First Response',  desc: 'Tanod dispatch target',         value: 10, unit: 'minutes', color: 'warning' },
    { key: 'medFirst',    label: 'Medium Priority – First Response',desc: 'Acknowledgement required within',value: 30, unit: 'minutes', color: 'info'    },
    { key: 'lowRes',      label: 'Low Priority – Resolution',       desc: 'Maximum resolution time',       value: 72, unit: 'hours',   color: 'success' },
  ],

  appearance: {
    colorScheme: 0,
    darkMode:    false,
    compactMode: false,
  },
};

// ── Shared fetch helper ───────────────────────────────────────────────────────

const fetchSetting = async (docId, defaults) => {
  try {
    const result = await getDocument(COLLECTIONS.SETTINGS, docId);
    // Merge defaults so new fields always have values
    return { ...defaults, ...result };
  } catch (error) {
    if (error.message === 'Document not found') {
      return { ...defaults };
    }
    throw error;
  }
};

// ── Fetch functions (one per section) ────────────────────────────────────────

export const fetchGeneralSettings = () =>
  fetchSetting(SETTINGS_DOCS.GENERAL, DEFAULTS.general);

export const fetchOperationalSettings = () =>
  fetchSetting(SETTINGS_DOCS.OPERATIONAL, DEFAULTS.operational);

export const fetchNotificationSettings = () =>
  fetchSetting(SETTINGS_DOCS.NOTIFICATIONS, DEFAULTS.notifications);

export const fetchPermissionsSettings = () =>
  fetchSetting(SETTINGS_DOCS.PERMISSIONS, DEFAULTS.permissions);

export const fetchSLASettings = async () => {
  const result = await fetchSetting(SETTINGS_DOCS.SLA, { thresholds: DEFAULTS.sla });
  // Ensure thresholds is always an array (Firestore may return it slightly different)
  return Array.isArray(result.thresholds) ? result : { thresholds: DEFAULTS.sla };
};

export const fetchAppearanceSettings = () =>
  fetchSetting(SETTINGS_DOCS.APPEARANCE, DEFAULTS.appearance);

// ── Save function (merge so createdAt is preserved) ──────────────────────────

export const saveSettingsDoc = async (docId, data, user) => {
  // Strip Firestore meta fields that shouldn't be round-tripped
  const { id, createdAt, updatedAt, updatedBy, updatedByName, ...clean } = data;

  const ref = doc(db, COLLECTIONS.SETTINGS, docId);
  await setDoc(
    ref,
    {
      ...clean,
      updatedAt:     serverTimestamp(),
      updatedBy:     user?.uid || user?.id || 'system',
      updatedByName: user ? `${user.firstName} ${user.lastName}` : 'System',
    },
    { merge: true },
  );
};

// ── Audit log ─────────────────────────────────────────────────────────────────

export const addAuditLog = async ({ action, category, user }) => {
  return createDocument(AUDIT_COLLECTION, {
    action,
    category,
    userId:   user?.uid || user?.id || 'system',
    userName: user
      ? `Admin (${user.firstName} ${user.lastName?.charAt(0) ?? ''}.)`
      : 'System',
  });
};

export const fetchAuditLogs = async (limitCount = 50) => {
  try {
    return await queryDocuments(
      AUDIT_COLLECTION,
      [],
      { orderBy: { field: 'createdAt', direction: 'desc' }, limit: limitCount },
    );
  } catch {
    return [];
  }
};
