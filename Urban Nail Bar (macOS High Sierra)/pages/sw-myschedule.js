// My Schedule PWA service worker
// Network-first: always try the freshest copy (the salon is actively updated),
// fall back to cache when offline so the app still opens on the shop floor.
const CACHE = 'my-schedule-v20260728g';

const SHELL = [
    './my-schedule.html',
    './manifest-myschedule.webmanifest',
    '../shared/styles.css',
    '../shared/data-manager.js',
    '../shared/utils.js',
    '../shared/auth.js',
    '../assets/pwa/icon-192.png',
    '../assets/pwa/icon-512.png'
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
            .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./my-schedule.html')))
    );
});
