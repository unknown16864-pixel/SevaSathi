// firebase-messaging-sw.js
// This service worker handles background messages from Firebase Cloud Messaging (FCM).

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAhkKwgc7k4PNCqNiA3869LREJ_3mQhBtQ",
  authDomain: "sevasathi-1667b.firebaseapp.com",
  projectId: "sevasathi-1667b",
  storageBucket: "sevasathi-1667b.firebasestorage.app",
  messagingSenderId: "6654259155",
  appId: "1:6654259155:web:9133ff27c069d421484926"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Background message handler for compat
// This is called when the web app is in the background (or closed) and FCM pushes a message.
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notification = payload.notification || {};
  const title = notification.title || payload.data?.title || 'Seva Sathi';
  const options = {
    body: notification.body || payload.data?.body || '',
    icon: notification.icon || '/icons/icon-192.png',
    data: payload.data || {}
  };
  return self.registration.showNotification(title, options);
});

// Handle notificationclick in the FCM SW as well
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});