"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "./useAuthStore";

// localStorage에서 accessToken을 복원하는 게 마운트 이후 비동기로 끝나기 때문에,
// 복원 전 순간의 accessToken===null을 "로그아웃 상태"로 오판하면 로그인된
// 사용자를 잘못 튕겨낼 수 있다. 복원이 끝났는지 이 훅으로 확인하고 나서
// accessToken 유무를 판단해야 한다.
export function useHasAuthHydrated() {
  // persist는 기본 storage(localStorage)가 없는 서버 환경(SSR)에서는
  // api.persist 자체를 붙이지 않으므로 옵셔널 체이닝이 필요하다.
  const [hasHydrated, setHasHydrated] = useState(
    () => useAuthStore.persist?.hasHydrated() ?? false,
  );

  useEffect(() => {
    // hydrate()는 마이크로태스크로 끝나서, useState 초기화 이후 이 effect가
    // 붙기 전에 이미 완료돼버리면 onFinishHydration 콜백은 놓친 이벤트라 다시
    // 안 불린다. 그래서 구독 직후 한 번 더 확인해서 그 사이 끝났으면 반영한다 -
    // zustand persist를 외부 스토어로 구독하는 경우라 이 setState는 필요하다.
    if (useAuthStore.persist?.hasHydrated()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasHydrated(true);
    }
    return useAuthStore.persist?.onFinishHydration(() => setHasHydrated(true));
  }, []);

  return hasHydrated;
}
