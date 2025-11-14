const CACHE_NAME = 'trek-stay-v2.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Fredoka+One&display=swap'
];

// Install event - aggressive caching for mobile app feel
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache)
          .catch(err => console.warn('[SW] Cache addAll failed (some URLs may not exist):', err));
      })
      .then(() => self.skipWaiting()) // Immediately activate
  );
});

// Fetch event with better offline support
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache non-GET requests
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // Strategy: Network-first for API/dynamic, Cache-first for static
  const isAPI = url.pathname.includes('/api/');
  const isStatic = /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/.test(url.pathname);

  if (isAPI) {
    // Network-first for API calls
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request)
            .then(response => response || createOfflineResponse());
        })
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            // Update cache in background
            fetch(request)
              .then(freshResponse => {
                if (freshResponse && freshResponse.status === 200) {
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, freshResponse);
                  });
                }
              })
              .catch(() => {});
            return response;
          }

          // Not in cache, fetch from network
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200) {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });

              return response;
            })
            .catch(() => createOfflineResponse());
        })
    );
  }
});

// Helper to create offline response
function createOfflineResponse() {
  return new Response(
    `<html><body><h1>You are offline</h1><p>This page is not available offline.</p></body></html>`,
    {
      headers: { 'Content-Type': 'text/html' },
      status: 503,
      statusText: 'Service Unavailable'
    }
  );
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
  );
});

// Background sync for reliability
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    // Attempt to re-sync pending requests
    for (const request of requests) {
      if (request.url.includes('/api/bookings')) {
        await fetch(request);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

console.log('[SW] Service worker ready for v2.0.0');
