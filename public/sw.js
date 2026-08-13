self.__GONGMOZIP_SW_VERSION__ = "2026-08-13-navigation-fallback";

const CACHE_NAME = "gongmozip-app-shell-v1";
const APP_SHELL_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(APP_SHELL_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(APP_SHELL_URL).then((response) => response || Response.error());
      }),
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      if (event.request.destination === "document") {
        return caches.match(APP_SHELL_URL).then((response) => response || Response.error());
      }

      return Response.error();
    }),
  );
});
