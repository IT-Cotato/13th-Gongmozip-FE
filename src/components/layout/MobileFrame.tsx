"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

type MobileFrameProps = {
  children: ReactNode;
};

export default function MobileFrame({ children }: MobileFrameProps) {
  useEffect(() => {
    const viewport = window.visualViewport;
    let animationFrameId: number | null = null;

    const updateViewportHeight = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--app-viewport-height",
          `${viewport?.height ?? window.innerHeight}px`,
        );
      });
    };

    updateViewportHeight();
    viewport?.addEventListener("resize", updateViewportHeight);
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      viewport?.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
    };
  }, []);

  return (
    <div className="flex h-[var(--app-viewport-height,100dvh)] w-full items-center justify-center overflow-hidden overscroll-none bg-white">
      <div
        data-mobile-frame
        className="relative h-[var(--app-viewport-height,100dvh)] w-full transform-gpu overflow-hidden overscroll-none bg-white sm:h-[844px] sm:w-[390px] sm:rounded-[40px] sm:shadow-[0_0_60px_rgba(0,0,0,0.35)]"
      >
        <div className="relative h-full w-full overflow-hidden overscroll-none pt-[min(env(safe-area-inset-top),47px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
