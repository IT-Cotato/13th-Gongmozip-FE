"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sulphur_Point } from "next/font/google";
import { ChevronLeftIcon } from "./_components/icons";

const sulphurPoint = Sulphur_Point({
  subsets: ["latin"],
  weight: "400",
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

export default function EmailLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValid = EMAIL_REGEX.test(email) && password.length > 0;

  function handleBack() {
    router.back();
  }

  function handleLogin() {
    if (!isValid) return;
    // TODO(backend): 로그인 API 연동 전까지 성공했다고 가정하고 홈으로 이동
    router.push("/");
  }

  return (
    <main className="flex min-h-screen justify-center bg-white">
      <div className="flex w-full max-w-sm flex-col">
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gongmozip@gongmo-zip.com"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1 p-4">
            <p className="px-1 text-[17px] leading-[1.25] font-medium text-[#1F1F1F]">비밀번호</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요."
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-8">
            <Link
              href="/signup"
              className="text-[13px] leading-[1.25] font-semibold text-[#616161]"
            >
              회원가입
            </Link>
            <span className="text-gray-200">|</span>
            <button
              type="button"
              onClick={() => alert("비밀번호 재설정 기능은 준비 중입니다.")}
              className="text-[13px] leading-[1.25] font-semibold text-[#616161]"
            >
              비밀번호 재설정
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
          <button
            type="button"
            disabled={!isValid}
            onClick={handleLogin}
            className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
              isValid ? "bg-[#FF7658] text-white" : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
            }`}
          >
            로그인
          </button>
        </div>
      </div>
    </main>
  );
}
