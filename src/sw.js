/* eslint-disable no-restricted-globals, no-undef */
const SHELL_CACHE = 'campus-shell-v1';
const IMAGE_CACHE = 'campus-images-v1';
const MAX_IMAGE_ENTRIES = 60;
const OFFLINE_URL = '/offline.html';

// vite-plugin-pwa (injectManifest) replaces this at build time with the
// current build's real, content-hashed asset list — always in sync with the
// deploy, unlike a hand-maintained precache list that would go stale the
// moment filenames change on the next build.
const manifestEntries = self.__WB_MANIFEST || [];
const precacheUrls = [...new Set([
  ...manifestEntries.map((entry) => (typeof entry === 'string' ? entry : entry.url)),
  OFFLINE_URL,
])];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(precacheUrls))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== SHELL_CACHE && key !== IMAGE_CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isCloudinaryImage(request) {
  return request.destination === 'image' && request.url.includes('res.cloudinary.com');
}

// Caps the image cache so a marketplace with many vendors/products doesn't
// grow it unbounded — evicts the oldest entry once the cap is exceeded.
async function trimImageCache() {
  const cache = await caches.open(IMAGE_CACHE);
  const keys = await cache.keys();
  if (keys.length > MAX_IMAGE_ENTRIES) {
    await cache.delete(keys[0]);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        trimImageCache();
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (isCloudinaryImage(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Full-page navigations: try the network first (so buyers always see
  // live product/price data when online), fall back to the offline page
  // only when the network genuinely fails.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Precached app-shell assets (hashed JS/CSS): cache-first, since their
  // content never changes for a given filename.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
