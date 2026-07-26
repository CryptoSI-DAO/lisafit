// LisaFit Service Worker - offline app shell caching
const CACHE_NAME = "lisafit-v1";
const APP_SHELL = ["/", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip cross-origin (Supabase API calls)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for pages, cache fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html"))
    );
  }
});
