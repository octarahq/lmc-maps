self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // This fetch handler is required for the browser to consider the app a PWA
  // For now, we just pass through to the network
  event.respondWith(
    fetch(event.request).catch(() => {
      // If offline, you might want to return a cached page here
      return caches.match(event.request);
    }),
  );
});
