const CACHED_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/assets/js/db.js',
    '/assets/js/index.js',
    '/manifest.json',
    "/icons/icon_96x96.png",
    "/icons/icon_128x128.png",
    "/icons/icon_192x192.png",
    "/icons/icon_256x256.png",
    "/icons/icon_384x384.png",
    "/icons/icon_512x512.png",
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
];

// set up caching variables
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// event listeners
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(PRECACHE)
            .then((cache) => cache.addAll(CACHED_FILES))
            .then(self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== "GET") {
        event.respondWith(fetch(event.request)
            .then(response => {
                return response;
            }).catch(err => {
                console.log(err);
                return err;
            }));
    } else if (event.request.url) {
        event.respondWith(
            caches.open(RUNTIME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        // If the response worked, clone
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        // if network fails
                        return cache.match(event.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }
});