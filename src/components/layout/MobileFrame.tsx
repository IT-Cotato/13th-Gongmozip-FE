import type { ReactNode } from "react";

type MobileFrameProps = {
  children: ReactNode;
};

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden overscroll-none bg-white">
      <div
        data-mobile-frame
        className="relative h-dvh w-full transform-gpu overflow-hidden overscroll-none bg-white sm:h-[844px] sm:w-[390px] sm:rounded-[40px] sm:shadow-[0_0_60px_rgba(0,0,0,0.35)]"
      >
        <div className="relative h-full w-full overflow-hidden overscroll-none pt-[env(safe-area-inset-top)]">
          {children}
        </div>
      </div>
    </div>
  );
}
