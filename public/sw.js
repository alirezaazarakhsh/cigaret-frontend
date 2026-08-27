const CACHE_NAME = 'sevin-wholesale-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept HTTP/HTTPS GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // HTML navigation requests: Network-First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Static assets: Cache or Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const contentType = networkResponse.headers.get('content-type') || '';
          const isAsset = event.request.url.includes('/assets/') || 
                          event.request.url.endsWith('.css') || 
                          event.request.url.endsWith('.js');
          // Avoid caching HTML for CSS/JS requests
          if (isAsset && contentType.includes('text/html')) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch((err) => {
          if (cachedResponse) return cachedResponse;
          throw err;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

