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
    return useAuthStore.persist?.onFinishHydration(() => setHasHydrated(true));
  }, []);

  return hasHydrated;
}
