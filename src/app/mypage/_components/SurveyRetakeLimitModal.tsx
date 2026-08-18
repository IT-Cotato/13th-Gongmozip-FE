"use client";

import { useEffect, useRef } from "react";

type SurveyRetakeLimitModalProps = {
  onClose: () => void;
};

export function SurveyRetakeLimitModal({ onClose }: SurveyRetakeLimitModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;

    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      const firstFocusableElement = focusableElements?.[0];
      const lastFocusableElement = focusableElements?.[focusableElements.length - 1];

      if (!firstFocusableElement || !lastFocusableElement) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        if (event.shiftKey) {
          lastFocusableElement.focus();
        } else {
          firstFocusableElement.focus();
        }
        return;
      }

      if (
        event.shiftKey &&
        (document.activeElement === dialogRef.current ||
          document.activeElement === firstFocusableElement)
      ) {
        event.preventDefault();
        lastFocusableElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (
        previouslyFocusedElement instanceof HTMLElement &&
        document.contains(previouslyFocusedElement)
      ) {
        previouslyFocusedElement.focus();
      }
    };
  }, [onClose]);

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(31,31,31,0.6)] px-3"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-retake-limit-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[350px] flex-col items-center rounded-2xl bg-white px-6 pt-12 pb-8 shadow-[0_8px_28px_rgba(0,0,0,0.24)] outline-none"
      >
        <p
          id="survey-retake-limit-title"
          className="text-center font-[Pretendard] text-[17px] leading-[150%] font-normal text-[#1F1F1F]"
        >
          [안내]
          <br />
          성격&협업스타일 검사는 3개월에
          <br />
          한번만 재응시 가능합니다.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex h-[52px] w-full max-w-[302px] shrink-0 items-center justify-center self-stretch rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] font-[Pretendard] text-[17px] leading-[125%] font-semibold text-white"
        >
          확인
        </button>
      </div>
    </div>
  );
}
