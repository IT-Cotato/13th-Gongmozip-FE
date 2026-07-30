"use client";

import Link from "next/link";
import { useRef } from "react";

import Dialog from "@/components/Dialog";

type CollaborationTestLeaveModalProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export default function CollaborationTestLeaveModal({
  onOpenChange,
  open,
}: CollaborationTestLeaveModalProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      aria-labelledby="collaboration-test-leave-title"
      className="fixed left-1/2 top-0 z-50 m-0 hidden h-full max-h-dvh w-full max-w-[390px] -translate-x-1/2 items-center justify-center bg-transparent px-8 backdrop:bg-[rgba(31,31,31,0.60)] open:flex"
      initialFocusRef={continueButtonRef}
      onOpenChange={onOpenChange}
      open={open}
    >
      <section className="w-full rounded-2xl bg-white p-4">
        <h2 id="collaboration-test-leave-title">검사를 그만둘까요?</h2>
        <p>이 화면을 벗어나면 지금까지 선택한 답변이 사라질 수 있어요.</p>
        <button onClick={() => onOpenChange(false)} ref={continueButtonRef} type="button">
          계속 검사하기
        </button>
        <Link href="/collaboration-type">나가기</Link>
      </section>
    </Dialog>
  );
}
