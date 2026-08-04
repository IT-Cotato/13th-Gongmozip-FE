"use client";

import type { MouseEvent, ReactNode } from "react";
import Dialog from "./Dialog";

type BottomSheetProps = {
  onClose: () => void;
  children: ReactNode;
  "aria-label": string;
};

export default function BottomSheet({ onClose, children, ...ariaProps }: BottomSheetProps) {
  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <Dialog
      {...ariaProps}
      role="dialog"
      aria-modal="true"
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onClick={handleBackdropClick}
      className="fixed inset-x-0 bottom-0 top-auto mx-auto flex max-h-[88vh] w-full max-w-[390px] flex-col overflow-hidden rounded-t-2xl bg-white p-0 shadow-none backdrop:bg-[rgba(31,31,31,0.6)]"
    >
      <div className="flex w-full shrink-0 flex-col items-center pt-4 pb-6">
        <span className="h-1 w-12 rounded-full bg-[rgba(97,97,97,0.22)]" />
      </div>
      {children}
    </Dialog>
  );
}
