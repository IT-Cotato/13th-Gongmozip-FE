"use client";

import { useEffect } from "react";

type CollaborationTypeTestPromptModalProps = {
  onClose: () => void;
  onStartTest: () => void;
};

export function CollaborationTypeTestPromptModal({
  onClose,
  onStartTest,
}: CollaborationTypeTestPromptModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(31,31,31,0.6)] px-8"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="collaboration-type-test-prompt-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[350px] flex-col items-center rounded-2xl bg-white px-4 pt-2 pb-4 shadow-[0_2px_5px_rgba(0,0,0,0.1),0_9px_9px_rgba(0,0,0,0.09),0_19px_12px_rgba(0,0,0,0.05),0_34px_14px_rgba(0,0,0,0.01)]"
      >
        <div className="flex w-full flex-col items-center py-4">
          <p
            id="collaboration-type-test-prompt-title"
            className="text-center text-[20px] leading-[1.35] font-medium text-[#1F1F1F]"
          >
            협업 유형 검사를
            <br />
            먼저 진행해주세요
          </p>
        </div>

        <div className="flex h-[60px] w-full items-center gap-2 px-2 py-1">
          <button
            type="button"
            onClick={onClose}
            className="h-full flex-1 rounded-xl border border-[rgba(97,97,97,0.5)] text-[15px] leading-[1.25] font-semibold text-[#616161]"
          >
            나가기
          </button>
          <button
            type="button"
            onClick={onStartTest}
            className="h-full flex-1 rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
          >
            검사하기
          </button>
        </div>
      </div>
    </div>
  );
}
