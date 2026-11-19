/*
 * 2026-09-23 PWA shell cache
 * 2026-11-19 加速手機開啟：
 *   - 頁面：仍以網路優先（修正能馬上生效），但最多等 3 秒；網路太慢就先用快取的頁面，
 *     背景下載的新版會存起來，下次開啟就是新版。
 *   - unpkg CDN（Leaflet、SunCalc，網址含固定版本）：快取優先，不用每次重新下載。
 *
 * 預報 API 回應仍然不經過 SW 快取，避免把舊海象當成即時資料（頁面自己有標示時間的快取）。
 */
const CACHE_NAME = 'sunnyfish-shell-v4';
const NAV_TIMEOUT_MS = 3000;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];
const CDN_ORIGINS = ['https://unpkg.com'];

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

  if (CDN_ORIGINS.includes(url.origin)) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
        if (response.ok || response.type === 'opaque') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    const network = fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
      }
      return response;
    });
    event.waitUntil(network.catch(() => {}));
    const cachedPage = () => caches.match('./index.html').then(cached => cached || caches.match('./'));
    const timeout = new Promise(resolve => setTimeout(resolve, NAV_TIMEOUT_MS)).then(cachedPage);
    event.respondWith(
      Promise.race([network.catch(cachedPage), timeout])
        .then(response => response || network)
        .catch(() => cachedPage())
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
