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
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      aria-labelledby="collaboration-result-pending-leave-title"
      className="fixed left-1/2 top-0 z-50 m-0 hidden h-full max-h-dvh w-full max-w-[390px] -translate-x-1/2 items-center justify-center bg-transparent px-8 backdrop:bg-[rgba(31,31,31,0.60)] open:flex"
      initialFocusRef={continueButtonRef}
      onOpenChange={onOpenChange}
      open={open}
    >
      <section className="w-full rounded-2xl bg-white p-4">
        <h2 id="collaboration-result-pending-leave-title">결과를 확인하지 않고 나갈까요?</h2>
        <p>검사는 완료됐지만 아직 협업 유형 결과를 확인하지 않았어요.</p>
        <button onClick={() => onOpenChange(false)} ref={continueButtonRef} type="button">
          결과 기다리기
        </button>
        <Link href="/collaboration-type">나가기</Link>
      </section>
    </Dialog>
  );
}
