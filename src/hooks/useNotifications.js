import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { subscribeToQuery } from '../services/firebaseService';
import { setNotifications } from '../store/slices/notificationSlice';
import { initializeFCM } from '../services/notificationService';

export const useNotificationSync = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.id) {
      dispatch(setNotifications([]));
      return undefined;
    }

    // Initialize FCM for push notifications
    initializeFCM(user.id).catch((error) => {
      console.warn('FCM initialization failed:', error);
    });

    const unsubscribe = subscribeToQuery(
      'notifications',
      [{ field: 'userId', operator: '==', value: user.id }],
      { orderBy: { field: 'createdAt', direction: 'desc' } },
      (notifications) => {
        dispatch(setNotifications(notifications));
      }
    );

    return () => unsubscribe();
  }, [dispatch, user?.id]);
};

export const useBrowserNotificationPermission = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission().catch((error) => {
        console.error('Browser notification permission request failed:', error);
      });
    }
  }, []);
};

export default {
  useNotificationSync,
  useBrowserNotificationPermission,
};
