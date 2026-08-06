"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type TeamMatchingModalPreviewShellProps = {
  background: ReactNode;
  children: ReactNode;
};

type TeamMatchingModalPreviewDialogProps = {
  children: ReactNode;
  className: string;
  titleId: string;
};

export function TeamMatchingModalPreviewShell({
  background,
  children,
}: TeamMatchingModalPreviewShellProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backgroundElement = backgroundRef.current;

    if (!backgroundElement) {
      return;
    }

    backgroundElement.inert = true;

    return () => {
      backgroundElement.inert = false;
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div aria-hidden="true" inert ref={backgroundRef}>
        {background}
      </div>

      <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(31,31,31,0.60)] px-5">
        {children}
      </div>
    </div>
  );
}

export function TeamMatchingModalPreviewDialog({
  children,
  className,
  titleId,
}: TeamMatchingModalPreviewDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    requestAnimationFrame(() => {
      const initialFocusTarget = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? dialog;

      initialFocusTarget.focus();
    });

    return () => {
      restoreFocusRef.current?.focus();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);

    if (focusableElements.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-modal="true"
      className={className}
      onKeyDown={handleKeyDown}
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
    >
      {children}
    </section>
  );
}
