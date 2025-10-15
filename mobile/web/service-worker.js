/* eslint-disable no-restricted-globals */
/**
 * Service Worker for Intentional Movement PWA
 * Handles offline functionality, caching, and background sync
 */

// Workbox configuration
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  console.log('Workbox is loaded');

  // Force production builds
  workbox.setConfig({ debug: false });

  // Cache name configuration
  workbox.core.setCacheNameDetails({
    prefix: 'intentional-movement',
    suffix: 'v1',
    precache: 'precache',
    runtime: 'runtime'
  });

  // Skip waiting and claim clients immediately
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // Precache static assets
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache images with expiration
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Cache API responses with network-first strategy
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        }),
      ],
    })
  );

  // Cache static assets (JS, CSS) with stale-while-revalidate
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );

  // Cache fonts
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'font',
    new workbox.strategies.CacheFirst({
      cacheName: 'fonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }),
      ],
    })
  );

  // Cache Google Fonts
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }),
      ],
    })
  );

  // Offline fallback
  const FALLBACK_HTML = '/offline.html';
  const FALLBACK_IMAGE = '/icons/icon-192x192.png';

  workbox.routing.setCatchHandler(async ({ event }) => {
    // Return cached response or fallback
    switch (event.request.destination) {
      case 'document':
        return caches.match(FALLBACK_HTML) || Response.error();

      case 'image':
        return caches.match(FALLBACK_IMAGE) || Response.error();

      default:
        return Response.error();
    }
  });

  // Background sync for failed requests (optional)
  // Uncomment if you want to queue failed requests
  /*
  const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('apiQueue', {
    maxRetentionTime: 24 * 60 // Retry for up to 24 Hours
  });

  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/posts') ||
                 url.pathname.startsWith('/api/likes'),
    new workbox.strategies.NetworkOnly({
      plugins: [bgSyncPlugin]
    }),
    'POST'
  );
  */

  console.log('Service Worker configured successfully');

} else {
  console.error('Workbox failed to load');
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Intentional Movement', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
