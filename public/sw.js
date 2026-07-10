// Minimal service worker: exists only to satisfy PWA installability checks
// (Chrome/Android requires one registered with a fetch handler). It doesn't
// cache anything — every fetch falls through to the network untouched — so
// sellers and buyers never see stale product listings, prices, or orders.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {});
