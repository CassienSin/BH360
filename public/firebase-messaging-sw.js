importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

let messaging = null;

// Listen for config from the main app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'INIT_FIREBASE_CONFIG' && event.data?.config) {
    const firebaseConfig = event.data.config;

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      messaging = firebase.messaging();

      // Set up background message handler
      messaging.onBackgroundMessage((payload) => {
        console.log('Received background message ', payload);

        const notificationTitle = payload.notification?.title || 'Notification';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: '/BH_Logo.png',
          badge: '/BH_Logo.png',
          data: payload.data || {},
        };

        try {
          self.registration.showNotification(notificationTitle, notificationOptions);
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      });

      console.log('Firebase messaging initialized in service worker');
    } catch (error) {
      console.error('Failed to initialize Firebase in service worker:', error);
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data?.link) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if there's already a window with this URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === event.notification.data.link && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.link);
        }
      })
    );
  }
});