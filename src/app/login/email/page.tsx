"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sulphur_Point } from "next/font/google";
import { ChevronLeftIcon } from "./_components/icons";
import { useLoginMutation } from "@/queries/useLoginMutation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ApiError } from "@/lib/http";

const sulphurPoint = Sulphur_Point({
  subsets: ["latin"],
  weight: "400",
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MEMBER_NOT_FOUND_CODE = "MEMBER_404_1";
const LOGIN_LOCKED_CODE = "AUTH_401_7";

const INPUT_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494] focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-color-gray-900";

type LoginError = {
  type: "not-registered" | "locked" | "generic";
  message: string;
};

export default function EmailLoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const loginMutation = useLoginMutation();

  const isValid = EMAIL_REGEX.test(email) && password.length > 0;

  function handleBack() {
    router.back();
  }

  function handleLogin() {
    if (!isValid || loginMutation.isPending) return;
    setLoginError(null);
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setAccessToken(data.accessToken);
          router.push("/mypage");
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === MEMBER_NOT_FOUND_CODE) {
            setLoginError({ type: "not-registered", message: "가입되지 않은 이메일이에요." });
            return;
          }
          if (error instanceof ApiError && error.code === LOGIN_LOCKED_CODE) {
            setLoginError({ type: "locked", message: error.message });
            return;
          }
          setLoginError({
            type: "generic",
            message: error instanceof ApiError ? error.message : "로그인에 실패했습니다. 다시 시도해주세요.",
          });
        },
      },
    );
  }

  return (
    <main className="flex h-full w-full flex-col overflow-y-auto bg-white">
        <div className="relative flex items-center justify-center px-4 py-1">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="absolute left-4 flex h-6 w-6 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">로그인</h1>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-1 px-4 py-8">
            <p
              className={`${sulphurPoint.className} bg-gradient-to-r from-[#FF7658] to-[#FFAD62] bg-clip-text text-[36px] leading-normal tracking-[-1.44px] text-transparent`}
            >
              gongmo.zip
            </p>
            <p className="text-[13px] leading-[1.35] text-[#616161]">
              공모전 수상을 위한 최고의 팀 매칭 서비스
            </p>
          </div>

          <div className="flex flex-col gap-1 p-4">
            <p className="px-1 text-[17px] leading-[1.25] font-medium text-[#1F1F1F]">
              아이디(이메일)
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLoginError(null);
              }}
              placeholder="gongmozip@gongmo-zip.com"
              className={INPUT_CLASS}
              aria-describedby={loginError ? "login-error" : undefined}
            />
          </div>

          <div className="flex flex-col gap-1 p-4">
            <p className="px-1 text-[17px] leading-[1.25] font-medium text-[#1F1F1F]">비밀번호</p>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLoginError(null);
              }}
              placeholder="비밀번호를 입력해 주세요."
              className={INPUT_CLASS}
              aria-describedby={loginError ? "login-error" : undefined}
            />
            {loginError && (
              <div
                id="login-error"
                role="alert"
                className="flex flex-col gap-1 px-1 text-xs leading-[1.35]"
              >
                <p className="text-[#FF5A5A]">{loginError.message}</p>
                {loginError.type === "not-registered" && (
                  <Link href="/signup" className="font-semibold text-[#FF7658] underline">
                    회원가입 하러 가기
                  </Link>
                )}
                {loginError.type === "locked" && (
                  <Link
                    href="/login/reset-password"
                    className="font-semibold text-[#FF7658] underline"
                  >
                    비밀번호 재설정 하러 가기
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-8">
            <Link
              href="/signup"
              className="text-[13px] leading-[1.25] font-semibold text-[#616161]"
            >
              회원가입
            </Link>
            <span className="text-gray-200">|</span>
            <Link
              href="/login/reset-password"
              className="text-[13px] leading-[1.25] font-semibold text-[#616161]"
            >
              비밀번호 재설정
            </Link>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
          <button
            type="button"
            disabled={!isValid || loginMutation.isPending}
            onClick={handleLogin}
            className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
              isValid && !loginMutation.isPending
                ? "bg-[#FF7658] text-white"
                : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
            }`}
          >
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </button>
        </div>
    </main>
  );
}
