/* eslint-disable no-restricted-globals */
/**
 * Service Worker for Intentional Movement PWA
 * Provides offline support and caching strategies
 */

const CACHE_NAME = 'intentional-movement-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching essential assets');
        return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('Service Worker: Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - network first, then cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip Stripe and external API calls
  if (request.url.includes('/api/') ||
      request.url.includes('stripe.com') ||
      request.url.includes('firebase') ||
      request.url.includes('analytics')) {
    return;
  }

  // Network first, fallback to cache strategy
  event.respondWith(
    networkFirstStrategy(request)
  );
});

/**
 * Network first strategy with cache fallback
 * - Try network first (for fresh content)
 * - Fallback to cache if offline
 * - Update cache with network response
 */
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Clone the response for caching
    const responseClone = networkResponse.clone();

    // Update runtime cache with fresh content
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.put(request, responseClone);
    });

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('Service Worker: Network failed, trying cache:', request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // If no cache, return offline page or error
    if (request.destination === 'document') {
      return caches.match('/offline.html') ||
             new Response('Offline - Please check your connection', {
               status: 503,
               statusText: 'Service Unavailable',
               headers: new Headers({
                 'Content-Type': 'text/html'
               })
             });
    }

    // For other requests, just throw the error
    throw error;
  }
}

/**
 * Cache first strategy (for static assets)
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const responseClone = networkResponse.clone();

    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.put(request, responseClone);
    });

    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Fetch failed:', error);
    throw error;
  }
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncOfflinePosts());
  }
});

async function syncOfflinePosts() {
  // Implementation for syncing offline posts when connection is restored
  console.log('Service Worker: Syncing offline posts...');
  // This would integrate with IndexedDB to sync queued actions
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Intentional Movement',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Intentional Movement', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Loaded');
