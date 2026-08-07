self.__GONGMOZIP_SW_VERSION__ = "2026-08-07-skip-navigate-fetch";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // navigate 모드 요청(페이지 이동)을 그대로 fetch()에 넘기면 브라우저가
  // TypeError: Failed to fetch를 던진다 - fetch()는 mode가 "navigate"인
  // Request를 받을 수 없다. 그래서 페이지 이동은 가로채지 않고 흘려보낸다.
  if (event.request.mode === "navigate") return;

  event.respondWith(fetch(event.request));
});
