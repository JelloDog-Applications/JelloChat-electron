const CACHE_NAME = 'jellochat-shell-v2';
const SHELL_ASSETS = [
  '/app',
  '/ban-appeal',
  '/styles.css',
  '/renderer.js',
  '/manifest.webmanifest',
  '/assets/app-icon-256.png',
  '/assets/app-icon-1024.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function shouldBypassCache(request) {
  const url = new URL(request.url);
  return request.method !== 'GET'
    || url.pathname.startsWith('/api/')
    || url.pathname.startsWith('/invite/')
    || url.pathname.startsWith('/socket')
    || url.protocol === 'ws:'
    || url.protocol === 'wss:';
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (shouldBypassCache(request)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/app', copy));
          return response;
        })
        .catch(() => caches.match('/app'))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && new URL(request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
