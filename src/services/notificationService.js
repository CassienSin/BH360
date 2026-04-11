import {
  createDocument,
  getDocument,
  queryDocuments,
  updateDocument,
  COLLECTIONS,
} from './firebaseService';
import { DEFAULTS, SETTINGS_DOCS } from './settingsService';
import { messaging } from '../config/firebase';
import { getToken, onMessage } from 'firebase/messaging';

const EMAIL_QUEUE_COLLECTION = 'emailNotifications';

const EVENT_CONFIG = {
  newIncident: {
    category: 'incident',
    type: 'info',
    title: (data) => `New incident reported${data.title ? `: ${data.title}` : ''}`,
    message: (data) => data.message || 'A new incident has been submitted and requires your attention.',
    link: (data) => data.link || `/incidents/${data.incidentId}`,
  },
  resolved: {
    category: 'incident',
    type: 'success',
    title: (data) => `Incident resolved${data.title ? `: ${data.title}` : ''}`,
    message: (data) => data.message || 'An incident has been marked resolved.',
    link: (data) => data.link || `/incidents/${data.incidentId}`,
  },
  feedback: {
    category: 'feedback',
    type: 'info',
    title: (data) => `New feedback received${data.title ? `: ${data.title}` : ''}`,
    message: (data) => data.message || 'New feedback has been submitted.',
    link: (data) => data.link || '',
  },
  taskAssigned: {
    category: 'incident',
    type: 'info',
    title: (data) => `Task assigned${data.title ? `: ${data.title}` : ''}`,
    message: (data) => data.message || 'You have been assigned a new incident task.',
    link: (data) => data.link || `/incidents/${data.incidentId}`,
  },
  announcement: {
    category: 'announcement',
    type: 'info',
    title: (data) => `New announcement${data.title ? `: ${data.title}` : ''}`,
    message: (data) => data.message || 'A new announcement has been published.',
    link: (data) => data.link || '/announcements',
  },
};

const getNotificationSettings = async () => {
  try {
    const settings = await getDocument(COLLECTIONS.SETTINGS, SETTINGS_DOCS.NOTIFICATIONS);
    return settings?.events ? settings : DEFAULTS.notifications;
  } catch (error) {
    if (error.message === 'Document not found') {
      return DEFAULTS.notifications;
    }
    throw error;
  }
};

const getUsersByRole = async (role) => queryDocuments(COLLECTIONS.USERS, [{ field: 'role', operator: '==', value: role }]);

const getUserById = async (id) => {
  if (!id) return null;
  try {
    return await getDocument(COLLECTIONS.USERS, id);
  } catch (error) {
    console.error(`Unable to load user ${id} for notifications:`, error);
    return null;
  }
};

const getUsersByIds = async (ids = []) => {
  const results = await Promise.all(ids.map((userId) => getUserById(userId)));
  return results.filter(Boolean);
};

const buildNotificationPayload = (eventKey, eventData = {}) => {
  const config = EVENT_CONFIG[eventKey];
  if (!config) {
    return {
      title: eventData.title || 'Notification',
      message: eventData.message || 'You have a new system notification.',
      category: 'general',
      type: 'info',
      link: eventData.link || '',
    };
  }

  return {
    title: config.title(eventData),
    message: config.message(eventData),
    category: config.category,
    type: config.type,
    link: config.link(eventData),
  };
};

const createInAppNotification = async ({ user, payload, eventKey, metadata = {} }) => {
  if (!user?.id) return null;

  return createDocument(COLLECTIONS.NOTIFICATIONS, {
    userId: user.id,
    userEmail: user.email,
    title: payload.title,
    message: payload.message,
    category: payload.category,
    type: payload.type,
    link: payload.link,
    read: false,
    eventKey,
    metadata,
  });
};

const queueEmailNotification = async ({ user, payload, eventKey, metadata = {} }) => {
  if (!user?.email) return null;

  return createDocument(EMAIL_QUEUE_COLLECTION, {
    userId: user.id,
    userEmail: user.email,
    userPhone: user.phone, // Include phone for potential SMS
    subject: payload.title,
    body: payload.message,
    link: payload.link,
    eventKey,
    metadata,
    sent: false,
    retryCount: 0,
  });
};

const getBrowserNotificationPermission = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const requestBrowserNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'default') {
    return Notification.requestPermission();
  }

  return Notification.permission;
};

export const getFCMToken = async () => {
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export const saveFCMToken = async (userId, token) => {
  if (!userId || !token) return;
  await updateDocument(COLLECTIONS.USERS, userId, { fcmToken: token });
};

export const initializeFCM = async (userId) => {
  if (!messaging) return;

  // Request permission
  const permission = await requestBrowserNotificationPermission();
  if (permission !== 'granted') return;

  // Get and save token
  const token = await getFCMToken();
  if (token) {
    await saveFCMToken(userId, token);
  }

  // Handle foreground messages
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    showBrowserNotification({
      title: payload.notification?.title || 'Notification',
      message: payload.notification?.body || '',
    });
  });
};

const showBrowserNotification = ({ title, message }) => {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      body: message,
      silent: false,
    });
    setTimeout(() => notification.close(), 5000);
  } catch (error) {
    console.error('Browser notification failed:', error);
  }
};

export const notifyEvent = async (eventKey, eventData = {}) => {
  const settings = await getNotificationSettings();
  const eventConfig = settings.events?.[eventKey] || DEFAULTS.notifications.events[eventKey] || {};
  const payload = buildNotificationPayload(eventKey, eventData);

  const recipientsByRole = Object.entries(eventConfig).reduce((acc, [role, channels]) => {
    if (channels?.email || channels?.push) {
      acc[role] = channels;
    }
    return acc;
  }, {});

  let recipients = [];

  if (eventData.targetUserIds && eventData.targetUserIds.length > 0) {
    recipients = await getUsersByIds(eventData.targetUserIds);
  } else {
    const usersByRole = await Promise.all(
      Object.keys(recipientsByRole).map((role) => getUsersByRole(role))
    );

    recipients = usersByRole.flat();
  }

  const uniqueRecipients = Array.from(
    new Map(recipients.filter(Boolean).map((user) => [user.id, user])).values()
  );

  const notifiedUserIds = new Set();

  await Promise.all(
    uniqueRecipients.map(async (recipient) => {
      const roleChannels = recipientsByRole[recipient.role] || { email: false, push: false };
      if (!roleChannels.email && !roleChannels.push) return null;

      if (roleChannels.push) {
        await createInAppNotification({ user: recipient, payload, eventKey, metadata: eventData });
      }

      if (roleChannels.email && recipient.email) {
        await queueEmailNotification({ user: recipient, payload, eventKey, metadata: eventData });
      }

      notifiedUserIds.add(recipient.id);
      return null;
    })
  );

  if (eventData.currentUserId && notifiedUserIds.has(eventData.currentUserId)) {
    const currentUserRoleChannels = recipientsByRole[eventData.currentUserRole] || {};
    if (currentUserRoleChannels.push) {
      showBrowserNotification(payload);
    }
  }

  return {
    eventKey,
    count: uniqueRecipients.length,
    notifiedUserIds: Array.from(notifiedUserIds),
  };
};

export const notifyNewIncident = async ({ incidentId, incident = {}, currentUserId, currentUserRole }) => {
  return notifyEvent('newIncident', {
    incidentId,
    title: incident.title,
    message: incident.message,
    link: `/incidents/${incidentId}`,
    currentUserId,
    currentUserRole,
  });
};

export const notifyIncidentResolved = async ({ incidentId, title, currentUserId, currentUserRole }) => {
  return notifyEvent('resolved', {
    incidentId,
    title,
    message: `Incident has been resolved.`,
    link: `/incidents/${incidentId}`,
    currentUserId,
    currentUserRole,
  });
};

export const notifyTaskAssigned = async ({ incidentId, assignedTo, title, currentUserId, currentUserRole }) => {
  return notifyEvent('taskAssigned', {
    incidentId,
    title,
    message: `You have been assigned a new incident task.`,
    link: `/incidents/${incidentId}`,
    targetUserIds: assignedTo ? [assignedTo] : [],
    currentUserId,
    currentUserRole,
  });
};

export const notifyAnnouncementPublished = async ({ title, link = '/announcements', currentUserId, currentUserRole }) => {
  return notifyEvent('announcement', {
    title,
    link,
    currentUserId,
    currentUserRole,
  });
};

export const notifyFeedbackSubmitted = async ({ ticketId, title, currentUserId, currentUserRole }) => {
  return notifyEvent('feedback', {
    title,
    message: `New feedback has been submitted for ticket ${ticketId}.`,
    link: `/tickets`,
    currentUserId,
    currentUserRole,
  });
};

export default {
  requestBrowserNotificationPermission,
  notifyEvent,
  notifyNewIncident,
  notifyIncidentResolved,
  notifyTaskAssigned,
  notifyAnnouncementPublished,
  notifyFeedbackSubmitted,
};
