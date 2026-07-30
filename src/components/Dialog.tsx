"use client";

import { type ComponentPropsWithoutRef, type RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type DialogProps = Omit<ComponentPropsWithoutRef<"dialog">, "onCancel" | "open"> & {
  initialFocusRef?: RefObject<HTMLElement | null>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export default function Dialog({
  children,
  initialFocusRef,
  onOpenChange,
  open,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;

      if (!dialog.open) {
        dialog.showModal();
      }

      requestAnimationFrame(() => {
        const initialFocusTarget =
          initialFocusRef?.current ?? dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

        initialFocusTarget?.focus();
      });

      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [initialFocusRef, open]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleClose = () => {
      onOpenChange(false);
      restoreFocusRef.current?.focus();
    };

    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, [onOpenChange]);

  return (
    <dialog
      {...props}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      ref={dialogRef}
    >
      {children}
    </dialog>
  );
}
