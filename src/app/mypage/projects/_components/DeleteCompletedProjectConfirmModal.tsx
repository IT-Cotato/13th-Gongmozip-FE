"use client";

import { useEffect, useRef } from "react";

type DeleteCompletedProjectConfirmModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function DeleteCompletedProjectConfirmModal({
  onCancel,
  onConfirm,
  isDeleting,
}: DeleteCompletedProjectConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const getFocusable = () =>
      dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    (getFocusable()[0] ?? dialog)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
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
  }, [onCancel]);

  return (
    <div
      role="presentation"
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(31,31,31,0.6)] px-8"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-completed-project-confirm-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[400px] w-full flex-col items-center rounded-2xl bg-white px-4 pt-2 pb-4 shadow-[0px_53px_7.5px_rgba(0,0,0,0),0px_34px_7px_rgba(0,0,0,0.01),0px_19px_6px_rgba(0,0,0,0.05),0px_9px_4.5px_rgba(0,0,0,0.09),0px_2px_2.5px_rgba(0,0,0,0.1)] outline-none"
      >
        <div className="flex w-full flex-col items-start gap-2.5 px-1 py-4 text-center">
          <p
            id="delete-completed-project-confirm-title"
            className="w-full text-[20px] leading-[1.35] font-medium text-[#1F1F1F]"
          >
            완료 기록을 삭제할까요?
          </p>
          <p className="w-full text-[17px] leading-[1.5] text-[#616161]">
            삭제한 기록은 목록에서 다시 볼 수 없어요.
          </p>
        </div>
        <div className="flex h-[60px] w-full items-center gap-2 px-2 py-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-full flex-1 rounded-xl border border-[rgba(97,97,97,0.5)] p-2 text-[15px] leading-[1.25] font-semibold text-[#616161] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-full flex-1 rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold text-white disabled:opacity-50"
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
