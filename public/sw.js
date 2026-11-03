/**
 * Daily Appreciation App - PWA Service Worker
 * Optimized for Samsung Galaxy S26 & Android Standalone Web App
 */

const CACHE_NAME = 'daily-appreciation-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Ignore chrome-extension or external api requests
  const url = new URL(event.request.url);
  if (!url.origin.includes(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// ---------------------------------------------------------------------------
// Clinical Evening Reminder Push Notifications (Android S26 Doze-Resistant)
// ---------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: 'Daily Appreciation | יום הודיה', body: event.data.text() };
    }
  }

  const title =
    payload.title ||
    (payload.notification && payload.notification.title) ||
    'טקס הכרת תודה לפני השינה 🌙 | Evening Gratitude Ritual';

  const body =
    payload.body ||
    (payload.notification && payload.notification.body) ||
    '10 דקות להרגעה וגאלית, הקלה רגשית והפחתת מתח לפני השינה.';

  const targetUrl =
    (payload.data && payload.data.url) ||
    '/?mode=evening_ritual&source=push_s26';

  const options = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [150, 80, 150],
    tag: 'evening-gratitude-reminder',
    renotify: true,
    data: {
      url: targetUrl
    },
    actions: [
      { action: 'open_ritual', title: 'התחל תרגול | Start' },
      { action: 'dismiss', title: 'סגור | Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/?mode=evening_ritual';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
