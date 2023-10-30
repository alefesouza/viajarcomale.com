const cacheName = 'v1';

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(cacheName);
  await cache.addAll(resources);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    addResourcesToCache([
      '/',
      '/index.html',
      '/favicon.ico',
      '/app.js',
      '/manifest.json',
      '/profile-photo.jpg',
      '/icons/36x36.png',
      '/icons/48x48.png',
      '/icons/60x60.jpg',
      '/icons/72x72.png',
      '/icons/76x76.jpg',
      '/icons/96x96.png',
      '/icons/120x120.jpg',
      '/icons/144x144.png',
      '/icons/152x152.jpg',
      '/icons/167x167.jpg',
      '/icons/180x180.jpg',
      '/icons/192x192.png',
      '/icons/512x512.png',
      '/images/360.jpeg',
      '/images/asexplore.png',
      '/images/twitch.png',
      '/logos/instagram.png',
      '/logos/instagram96.png',
      '/logos/tiktok.png',
      '/logos/tiktok96.png',
      '/logos/youtube.png',
      '/logos/youtube96.png',
      '/screenshots/1.png',
      '/screenshots/2.png',
      '/screenshots/3.png',
      '/screenshots/4.png'
    ]),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })(),
  );
});
