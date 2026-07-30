"use client";

import Link from "next/link";
import { useRef } from "react";

import Dialog from "@/components/Dialog";

type CollaborationResultPendingLeaveModalProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export default function CollaborationResultPendingLeaveModal({
  onOpenChange,
  open,
}: CollaborationResultPendingLeaveModalProps) {
  const confirmLinkRef = useRef<HTMLAnchorElement>(null);

  return (
    <Dialog
      aria-labelledby="collaboration-result-pending-leave-title"
      className="fixed left-1/2 top-0 z-50 m-0 hidden h-full max-h-dvh w-full max-w-[390px] -translate-x-1/2 items-center justify-center bg-transparent px-6 backdrop:bg-[rgba(31,31,31,0.60)] open:flex"
      initialFocusRef={confirmLinkRef}
      onOpenChange={onOpenChange}
      open={open}
    >
      <section className="flex max-h-[400px] w-[326px] max-w-full flex-col items-center rounded-2xl bg-white px-4 pb-4 pt-2 shadow-[0_53px_15px_0_rgba(0,0,0,0),0_34px_14px_0_rgba(0,0,0,0.01),0_19px_12px_0_rgba(0,0,0,0.05),0_9px_9px_0_rgba(0,0,0,0.09),0_2px_5px_0_rgba(0,0,0,0.1)]">
        <h2
          className="mt-4 text-center font-['42dot_Sans'] text-[20px] font-medium leading-[135%] text-[#1F1F1F]"
          id="collaboration-result-pending-leave-title"
        >
          검사 결과를 확인 안하시겠어요?
        </h2>
        <p className="mt-2.5 text-center font-[Roboto] text-[17px] font-normal leading-[150%] text-[#616161]">
          검사는 완료되었지만, 지금 나가면
          <br />
          협업 유형 검사의 상세 결과는
          <br />
          이후 다시 확인할 수 없습니다.
        </p>
        <div className="mt-5 flex h-[51px] w-full items-center gap-2">
          <Link
            className="flex flex-1 items-center justify-center self-stretch rounded-xl border border-[rgba(97,97,97,0.5)] bg-white p-2 text-center font-[Pretendard] text-[15px] font-semibold leading-[125%] text-[#616161]"
            href="/collaboration-type/results/planner"
            ref={confirmLinkRef}
          >
            확인하기
          </Link>
          <Link
            className="flex flex-1 items-center justify-center self-stretch rounded-[14px] bg-[#FF7658] px-2.5 py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-white"
            href="/collaboration-type"
          >
            나가기
          </Link>
        </div>
      </section>
    </Dialog>
  );
}
