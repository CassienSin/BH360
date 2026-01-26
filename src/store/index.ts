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
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
