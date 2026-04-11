/**
 * Settings Service
 * Firestore persistence for Settings & System Configuration.
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createDocument, getDocument, queryDocuments, getScopedPath, COLLECTIONS } from './firebaseService';

// ── Document IDs inside the 'settings' collection ───────────────────────────

export const SETTINGS_DOCS = {
  GENERAL:       'general',
  NOTIFICATIONS: 'notifications',
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

  notifications: {
    events: {
      newIncident:  { captain: { email: true,  push: true  }, kagawad: { email: false, push: true  }, secretary: { email: false, push: true  }, tanod: { email: false, push: true  }, resident: { email: false, push: false } },
      resolved:     { captain: { email: true,  push: false }, kagawad: { email: true,  push: false }, secretary: { email: true,  push: false }, tanod: { email: false, push: false }, resident: { email: true,  push: false } },
      feedback:     { captain: { email: false, push: true  }, kagawad: { email: false, push: true  }, secretary: { email: false, push: true  }, tanod: { email: false, push: false }, resident: { email: false, push: false } },
      taskAssigned: { captain: { email: false, push: false }, kagawad: { email: false, push: false }, secretary: { email: false, push: false }, tanod: { email: true,  push: true  }, resident: { email: false, push: false } },
      announcement: { captain: { email: true,  push: true  }, kagawad: { email: false, push: true  }, secretary: { email: false, push: true  }, tanod: { email: false, push: true  }, resident: { email: false, push: true  } },
    },
  },

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
    return { ...defaults, ...result };
  } catch (error) {
    if (error.message === 'Document not found') {
      return { ...defaults };
    }
    throw error;
  }
};

// ── Fetch functions ──────────────────────────────────────────────────────────

export const fetchGeneralSettings = () =>
  fetchSetting(SETTINGS_DOCS.GENERAL, DEFAULTS.general);

export const fetchNotificationSettings = () =>
  fetchSetting(SETTINGS_DOCS.NOTIFICATIONS, DEFAULTS.notifications);

export const fetchAppearanceSettings = () =>
  fetchSetting(SETTINGS_DOCS.APPEARANCE, DEFAULTS.appearance);

// ── Save function (merge so createdAt is preserved) ──────────────────────────

export const saveSettingsDoc = async (docId, data, user) => {
  const { id, createdAt, updatedAt, updatedBy, updatedByName, ...clean } = data;

  const ref = doc(db, getScopedPath(COLLECTIONS.SETTINGS), docId);
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
      ? `${user.firstName} ${user.lastName}`
      : 'System',
  });
};
