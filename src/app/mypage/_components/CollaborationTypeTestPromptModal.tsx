"use client";

import { useEffect, useRef } from "react";

type CollaborationTypeTestPromptModalProps = {
  onClose: () => void;
  onStartTest: () => void;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CollaborationTypeTestPromptModal({
  onClose,
  onStartTest,
}: CollaborationTypeTestPromptModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const getFocusable = () =>
      dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    (getFocusable()[0] ?? dialog)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const elements = getFocusable();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="collaboration-type-test-prompt-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[350px] flex-col items-center rounded-2xl bg-white px-4 pt-2 pb-4 shadow-[0_2px_5px_rgba(0,0,0,0.1),0_9px_9px_rgba(0,0,0,0.09),0_19px_12px_rgba(0,0,0,0.05),0_34px_14px_rgba(0,0,0,0.01)] outline-none"
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
