"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function OAuthRedirectPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const accessToken = readCookie("accessToken");

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    setAccessToken(accessToken);
    router.replace("/");
  }, [router, setAccessToken]);

  return (
    <p className="px-4 py-16 text-center text-[13px] text-[#949494]">로그인 처리 중이에요...</p>
  );
}
