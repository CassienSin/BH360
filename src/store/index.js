import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import incidentReducer from './slices/incidentSlice';
import userReducer from './slices/userSlice';
import tanodReducer from './slices/tanodSlice';
import notificationReducer from './slices/notificationSlice';
import announcementReducer from './slices/announcementSlice';
import ticketReducer from './slices/ticketSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    incident: incidentReducer,
    user: userReducer,
    tanod: tanodReducer,
    notification: notificationReducer,
    announcement: announcementReducer,
    ticket: ticketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (Firestore Timestamps are serialized before dispatch,
        // but these actions may still carry non-serializable metadata transiently)
        ignoredActions: [
          'persist/PERSIST',
          'auth/setCredentials',
          'auth/updateUser',
          'auth/setLoading',
        ],
        // Ignore these paths in state so Timestamps that slip through don't cause errors
        ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt'],
      },
    }),
});
