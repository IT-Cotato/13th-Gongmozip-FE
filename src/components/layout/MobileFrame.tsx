import type { ReactNode } from "react";

type MobileFrameProps = {
  children: ReactNode;
};

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-white">
      <div className="relative h-dvh w-full transform-gpu overflow-hidden bg-white sm:h-[844px] sm:w-[390px] sm:rounded-[40px] sm:shadow-[0_0_60px_rgba(0,0,0,0.35)]">
        <div className="relative h-full w-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
