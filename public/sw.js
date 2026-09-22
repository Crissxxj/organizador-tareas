// Service worker mínimo: solo habilita que la app sea instalable como PWA.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Passthrough: no se cachea nada, siempre va a la red.
  event.respondWith(fetch(event.request));
});
