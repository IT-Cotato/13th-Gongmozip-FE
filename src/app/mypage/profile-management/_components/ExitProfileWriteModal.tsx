"use client";

import { useRef } from "react";
import Dialog from "@/components/Dialog";

type ExitProfileWriteModalProps = {
  onExit: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ExitProfileWriteModal({ onExit, onOpenChange, open }: ExitProfileWriteModalProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      aria-labelledby="exit-profile-write-title"
      className="fixed top-0 left-1/2 z-50 m-0 hidden h-full max-h-dvh w-full max-w-[390px] -translate-x-1/2 items-center justify-center bg-transparent px-8 backdrop:bg-[rgba(31,31,31,0.60)] open:flex"
      initialFocusRef={continueButtonRef}
      onOpenChange={onOpenChange}
      open={open}
    >
      <section className="flex max-h-[400px] w-full flex-col items-center rounded-2xl bg-white px-4 pt-2 pb-4 shadow-[0px_53px_7.5px_rgba(0,0,0,0),0px_34px_7px_rgba(0,0,0,0.01),0px_19px_6px_rgba(0,0,0,0.05),0px_9px_4.5px_rgba(0,0,0,0.09),0px_2px_2.5px_rgba(0,0,0,0.1)]">
        <div className="flex w-full flex-col items-center gap-2.5 px-1 py-4 text-center">
          <h2
            id="exit-profile-write-title"
            className="w-full text-[20px] leading-[1.35] font-medium text-[#1f1f1f]"
          >
            프로필 작성을 종료하시겠어요?
          </h2>
          <p className="w-full text-[17px] leading-[1.5] text-[#616161]">
            이 화면을 벗어나면
            <br />
            지금까지 입력한 내용이 사라질 수 있어요.
          </p>
        </div>
        <div className="flex h-[60px] w-full items-center gap-2 px-2 py-1">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            ref={continueButtonRef}
            className="h-full flex-1 rounded-xl border border-[rgba(97,97,97,0.5)] p-2 text-[15px] leading-[1.25] font-semibold text-[#616161]"
          >
            계속 작성하기
          </button>
          <button
            type="button"
            onClick={onExit}
            className="h-full flex-1 rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
          >
            나가기
          </button>
        </div>
      </section>
    </Dialog>
  );
}
