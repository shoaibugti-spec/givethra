const BUILD_ID = "faf7e3ac385e";
const CACHE_NAME = `givethra-cache-${BUILD_ID}`;
const urlsToCache = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("givethra-cache-") && key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname === "/sw.js") {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((res) => res || caches.match("/"))));
});
