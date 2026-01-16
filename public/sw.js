// Empty service worker file
// This prevents 404 errors when browser tries to load /sw.js
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    // Clean up old caches if any
});
