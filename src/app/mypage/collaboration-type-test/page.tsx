"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "./_components/icons";

// TODO(backend): 협업 유형 검사 문항/제출 API 연동 전까지 임시 목업 화면
export default function CollaborationTypeTestPage() {
  const router = useRouter();

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
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">협업 유형 검사</h1>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-[15px] leading-[1.25] font-medium text-[#616161]">
          🛠️ 협업 유형 검사 페이지는 준비 중이에요.
        </p>
        <p className="text-xs leading-[1.35] text-[rgba(97,97,97,0.6)]">
          조금만 기다려 주시면 나만의 협업 캐릭터를 만나볼 수 있어요.
        </p>
      </div>
    </div>
  );
}
