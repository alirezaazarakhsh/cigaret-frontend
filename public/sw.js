// Service Worker - Sevin Wholesale PWA
// Cache-First strategy for static assets with instant update lifecycle

const CURRENT_VERSION = 'v3.5.2';
const CACHE_NAME = `sevin-static-${CURRENT_VERSION}`;

// Core shell assets to precache on install for instant offline availability
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// 1. INSTALL: Pre-cache core shell & skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Continue even if some individual static icon fails to precache
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Purge previous version caches & claim active clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => self.clients.claim())
    .then(() => {
      // Broadcast update notification to all active browser & PWA client windows
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CURRENT_VERSION,
            cacheName: CACHE_NAME,
            timestamp: Date.now()
          });
        });
      });
    })
  );
});

// 3. MESSAGE LISTENER: Manual skip waiting signal from client UI
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. FETCH: Strategy router
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from the same origin (or trusted CDN fonts/images)
  if (request.method !== 'GET') {
    return;
  }

  // A. Dynamic API / Database / Settings / CRM endpoints: Network-Only (Strict Zero-Cache)
  const isDynamicOrApi = 
    url.pathname.startsWith('/api/') || 
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/products/') ||
    url.pathname.startsWith('/orders/') ||
    url.pathname.startsWith('/site-settings/') ||
    url.pathname.startsWith('/footer-settings/') ||
    url.pathname.startsWith('/retail-shops/') ||
    url.pathname.startsWith('/pos/') ||
    url.pathname.startsWith('/tickets/') ||
    url.pathname.startsWith('/live-rates/') ||
    url.search.includes('_nocache') ||
    url.search.includes('no-cache') ||
    request.headers.get('cache-control')?.includes('no-cache') ||
    request.headers.get('cache-control')?.includes('no-store') ||
    request.headers.get('pragma') === 'no-cache';

  if (isDynamicOrApi) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => {
        return new Response(JSON.stringify({ error: 'Network error or offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // B. HTML Navigations & Document Requests: Network-First with forced no-cache revalidation
  // Ensures user always gets the latest index.html pointing to newly hashed asset chunks
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('/index.html') || caches.match('/'));
        })
    );
    return;
  }

  // C. Static Files (JS, CSS, Images, Fonts, Icons, Manifest): Cache-First Strategy
  const isStaticAsset = 
    url.pathname.includes('/assets/') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.json');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // If found in cache, return immediately (Cache-First)
        if (cachedResponse) {
          // Optional background revalidation for non-hashed root assets
          if (!url.pathname.includes('/assets/')) {
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
                }
              })
              .catch(() => {});
          }
          return cachedResponse;
        }

        // Otherwise, fetch from network, cache it, and return
        return fetch(request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            const contentType = networkResponse.headers.get('content-type') || '';
            // Guard: Don't cache HTML fallback pages as CSS/JS
            if ((url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) && contentType.includes('text/html')) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return networkResponse;
          })
          .catch((error) => {
            console.warn('[SW] Fetch failed for static asset:', request.url, error);
            throw error;
          });
      })
    );
    return;
  }

  // D. Default fallback: Stale-While-Revalidate for any other GET requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});



