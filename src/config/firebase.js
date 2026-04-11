/**
 * Firebase Configuration
 * 
 * Setup instructions:
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Create a new project or select existing one
 * 3. Go to Project Settings > General > Your apps
 * 4. Click "Add app" and select Web (</>) 
 * 5. Register your app and copy the configuration
 * 6. Add the values to your .env file
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
if (measurementId) {
  firebaseConfig.measurementId = measurementId;
}

// Validate required configuration values
const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const isConfigValid = requiredConfigKeys.every(
  (key) => firebaseConfig[key] !== undefined && firebaseConfig[key] !== ''
);

if (!isConfigValid) {
  console.warn(
    '⚠️ Firebase configuration is incomplete. Please add required Firebase credentials to your .env file.'
  );
}

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let analytics;
let messaging;

try {
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize Messaging
  if (typeof window !== 'undefined') {
    messaging = getMessaging(app);

    // Send config to service worker for background message handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: 'INIT_FIREBASE_CONFIG',
          config: firebaseConfig,
        });
      }).catch((error) => {
        console.warn('Service worker not available for Firebase config:', error);
      });
    }
  }

  // Initialize Analytics (only in production and if supported)
  if (import.meta.env.PROD) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }

  // Connect to emulators in development if enabled
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { app, auth, db, storage, analytics, messaging };
export default app;
