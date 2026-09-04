// public/sw.js
// Givethra - Service Worker with APK download support

const CACHE_NAME = 'givethra-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/Givethra.apk'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Skip waiting...');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Activate event - claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch event - handle APK downloads
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special handling for APK files
  if (url.pathname.endsWith('.apk') || url.pathname.includes('Givethra.apk')) {
    console.log('[SW] APK download request:', url.pathname);
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok) {
            console.error('[SW] APK fetch failed:', response.status);
            return new Response('APK file not found', { 
              status: 404,
              statusText: 'Not Found',
              headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache'
              }
            });
          }
          
          console.log('[SW] APK fetch successful, size:', response.headers.get('content-length'));
          
          // Create new response with correct headers
          const headers = new Headers(response.headers);
          headers.set('Content-Type', 'application/vnd.android.package-archive');
          headers.set('Content-Disposition', 'attachment; filename="Givethra.apk"');
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          headers.set('Accept-Ranges', 'bytes');
          
          return new Response(response.body, {
            status: 200,
            statusText: 'OK',
            headers: headers
          });
        })
        .catch((error) => {
          console.error('[SW] APK fetch error:', error);
          return new Response('APK download failed', { 
            status: 500,
            statusText: 'Internal Server Error',
            headers: {
              'Content-Type': 'text/plain',
              'Cache-Control': 'no-cache'
            }
          });
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response for assets
          if (event.request.method === 'GET' && 
              (url.pathname.startsWith('/assets/') || 
               url.pathname.endsWith('.css') || 
               url.pathname.endsWith('.js'))) {
            return cachedResponse;
          }
        }

        // Network request
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses for non-API requests
            if (networkResponse.ok && 
                event.request.method === 'GET' &&
                !url.pathname.startsWith('/api/') &&
                !url.pathname.startsWith('/__')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  try {
                    cache.put(event.request, responseToCache);
                  } catch (e) {
                    // Ignore caching errors
                  }
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW] Fetch error:', error);
            // Return cached response if available, even for dynamic content
            return caches.match(event.request);
          });
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  let data = { 
    title: 'Givethra', 
    body: 'You have a new notification.',
    url: '/dashboard'
  };
  
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {
    data.body = event.data ? event.data.text() : data.body;
  }

  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { 
      url: data.url || '/dashboard',
      timestamp: Date.now()
    },
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Givethra', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  if (event.action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // Try to find existing client
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window if none found
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
