"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import CollaborationResultPendingLeaveModal from "../_components/CollaborationResultPendingLeaveModal";

export default function CollaborationTypeResultLoadingPage() {
  // TODO: 백엔드 API 연동 시 저장된 검사 응답을 요청 payload로 전달하고,
  // 응답으로 받은 단일 resultType으로 /collaboration-type/results/[resultType] 경로에 이동합니다.
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <header className="z-10 flex h-[46px] shrink-0 items-center justify-between bg-white px-4 py-1">
        <span className="h-6 w-6" aria-hidden="true" />
        <h1 className="flex h-[38px] flex-col justify-center text-center font-[Roboto] text-[17px] font-semibold leading-[135%] text-[#111111]">
          협업 유형 검사
        </h1>
        <button
          aria-label="협업 유형 검사 닫기"
          className="flex h-6 w-6 items-center justify-center"
          onClick={() => setIsLeaveModalOpen(true)}
          type="button"
        >
          <Image alt="" height={24} priority src="/icons/contests/x.svg" width={24} />
        </button>
      </header>

      <div className="scrollbar-hidden relative min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <Image
          alt=""
          className="pointer-events-none absolute inset-x-0 top-[84px] z-0 h-[570px] w-full object-cover"
          height={751}
          priority
          src="/icons/contests/Frame.svg"
          width={390}
        />

        <section className="relative z-10 pt-[49px] text-center">
          <h2 className="text-center font-[Pretendard] text-[20px] font-bold leading-[135%] text-[#1F1F1F]">
            검사가 완료되었어요!
          </h2>
          <p className="mt-[17px] text-center font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
            15개의 문항에 모두 답변해 주셔서 감사합니다.
            <br />
            이제 나의 협업 유형을 확인해 보세요.
          </p>

          <Image
            alt="협업 유형 검사 완료 캐릭터"
            className="mx-auto mt-[85px] h-[308px] w-[308px] max-w-full object-contain"
            height={308}
            priority
            src="/images/test/test.png"
            width={308}
          />
        </section>
      </div>

      <div className="shrink-0 bg-white px-4 pb-3 pt-2">
        <Link
          className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-white"
          href="/collaboration-type/results/planner"
        >
          검사 결과 확인하기
        </Link>
      </div>

      <CollaborationResultPendingLeaveModal
        onOpenChange={setIsLeaveModalOpen}
        open={isLeaveModalOpen}
      />
    </main>
  );
}
