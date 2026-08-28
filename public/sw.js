// GLASS — Service Worker

const CACHE = 'glass-v27';
const ASSETS = [
  '/',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Only static assets are cache-first. Everything else (auth pages, future
// member/profile routes) is dynamic/per-user and must always hit the network.
const CACHEABLE_PREFIXES = ['/css/', '/js/', '/images/', '/icons/'];

function isCacheable(url) {
  const path = new URL(url).pathname;
  // '/' is precached for the offline shell (see ASSETS above) but its
  // response is per-session (header shows login/logout state), so it must
  // never be served cache-first on a live request.
  if (path === '/') return false;
  return ASSETS.includes(path) || CACHEABLE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (!isCacheable(e.request.url)) return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
