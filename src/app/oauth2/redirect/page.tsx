"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { reissueAccessToken } from "@/lib/http";

export default function OAuthRedirectPage() {
  return (
    <Suspense fallback={null}>
      <OAuthRedirectPageInner />
    </Suspense>
  );
}

function OAuthRedirectPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const isNewMember = searchParams.get("isNewMember") === "true";

  useEffect(() => {
    let cancelled = false;

    // 백엔드가 OAuth 콜백에서 내려주는 accessToken 쿠키는 백엔드 도메인(nip.io)
    // 소유라 프론트(vercel.app)에서 document.cookie로 읽을 수 없다. 대신 일반
    // 로그인과 동일하게, refreshToken 쿠키(Path=/api/auth)를 실어 reissue를
    // 호출해 응답 바디로 accessToken을 받아온다.
    reissueAccessToken().then((accessToken) => {
      if (cancelled) return;

      if (!accessToken) {
        router.replace("/login");
        return;
      }

      setAccessToken(accessToken);
      router.replace(isNewMember ? "/signup/complete" : "/");
    });

    return () => {
      cancelled = true;
    };
  }, [router, setAccessToken, isNewMember]);

  return (
    <p className="px-4 py-16 text-center text-[13px] text-[#949494]">로그인 처리 중이에요...</p>
  );
}
