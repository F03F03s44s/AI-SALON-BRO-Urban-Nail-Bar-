// Public booking PWA service worker (internet-facing)
// Network-first: freshest menu/prices when online, cached shell when offline.
const CACHE = 'public-booking-v20260731alignFix';

const SHELL = [
    './booking.html',
    './manifest.webmanifest',
    '/shared/styles.css',
    '/shared/utils.js',
    '/assets/pwa/booking-icon-192.png',
    '/assets/pwa/booking-icon-512.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE)
            .then((c) => c.addAll(SHELL))
            .then(() => self.skipWaiting())
            .catch(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                if (res.ok && new URL(e.request.url).origin === self.location.origin) {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put(e.request, copy));
                }
                return res;
            })
            .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./booking.html')))
    );
});
