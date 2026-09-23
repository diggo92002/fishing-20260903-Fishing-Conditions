/*
 * 2026-09-23 PWA shell cache
 *
 * Only static application files are cached. Forecast API responses remain
 * network-only so stale sea conditions cannot be presented as current data.
 */
const CACHE_NAME = 'sunnyfish-shell-v2';
const APP_SHELL = [
  './',
  './index.html',
  './index-20260923-safety-pwa.html',
  './index-20260923-safety-pwa-v1.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys
      .filter(key => key !== CACHE_NAME)
      .map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
