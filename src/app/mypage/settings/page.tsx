"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "./_components/icons";
import { Toggle } from "./_components/Toggle";

export default function SettingsPage() {
  const router = useRouter();
  // TODO(backend): 마케팅 수신 동의 설정 API 연동 전까지 목데이터로 임시 표시
  const [emailMarketing, setEmailMarketing] = useState(true);
  const [smsMarketing, setSmsMarketing] = useState(true);

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex items-center justify-center px-4 py-1">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">서비스 설정</h1>
      </div>

      <div className="flex w-full flex-col items-start px-4">
        <div className="flex w-full flex-col gap-4 border-b border-[rgba(97,97,97,0.16)] pt-6 pb-4">
          <p className="text-xs leading-[1.35] font-semibold text-[#949494]">기타설정</p>
          <div className="flex w-full flex-col gap-4 px-2">
            <div className="flex w-full items-start justify-between">
              <p className="text-[15px] leading-[1.25] font-medium text-[#1F1F1F]">
                Email 마케팅 수신 동의
              </p>
              <Toggle
                checked={emailMarketing}
                onChange={() => setEmailMarketing((v) => !v)}
                label="Email 마케팅 수신 동의"
              />
            </div>
            <div className="flex w-full items-start justify-between">
              <p className="text-[15px] leading-[1.25] font-medium text-[#1F1F1F]">
                SMS 마케팅 수신 동의
              </p>
              <Toggle
                checked={smsMarketing}
                onChange={() => setSmsMarketing((v) => !v)}
                label="SMS 마케팅 수신 동의"
              />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start border-b border-[rgba(97,97,97,0.16)] pt-6 pb-4">
          <div className="flex w-full flex-col items-start px-2">
            <button
              type="button"
              className="w-full text-left text-[15px] leading-[1.25] font-medium text-[#1F1F1F]"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
