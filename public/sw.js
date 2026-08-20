self.__GONGMOZIP_SW_VERSION__ = "2026-08-17-navigation-fallback-fix";

const CACHE_NAME = "gongmozip-app-shell-v1";
const APP_SHELL_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(APP_SHELL_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 네비게이션(문서) 요청만 가로챈다. RSC 데이터 fetch, API 호출, 정적 자원 등은
// 그대로 통과시켜 일반 fetch와 동일한 재시도/에러 처리 흐름을 따르게 한다 -
// 이전에는 이런 요청도 실패 시 Response.error()로 강제 종료시켜, 앱 캐시가
// 아직 채워지지 않은 신규 방문자(예: 소셜 로그인 최초 가입 플로우)에게
// "This page couldn't load" 하드 에러를 유발했다.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.mode !== "navigate") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch((error) =>
      caches.match(APP_SHELL_URL).then((cached) => {
        if (cached) return cached;
        // 캐시된 앱 셸도 없으면 원래 네트워크 에러를 그대로 전파해
        // SW가 없을 때와 동일하게 브라우저 기본 처리에 맡긴다.
        throw error;
      }),
    ),
  );
});
