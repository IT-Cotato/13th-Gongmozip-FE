import type { ReactNode } from "react";

import TeamMatchingActionBar from "./TeamMatchingActionBar";
import TeamMatchingHeader from "./TeamMatchingHeader";
import TeamMatchingProgress from "./TeamMatchingProgress";

type TeamMatchingStepLayoutProps = {
  actionHref: string;
  actionLabel: string;
  children: ReactNode;
  currentStep: number;
};

export default function TeamMatchingStepLayout({
  actionHref,
  actionLabel,
  children,
  currentStep,
}: TeamMatchingStepLayoutProps) {
  return (
    <main className="fixed left-1/2 top-0 flex h-[851px] max-h-dvh w-full max-w-[390px] -translate-x-1/2 flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader />
      <TeamMatchingProgress currentStep={currentStep} />
      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-[21px]">
        {children}
      </div>
      <TeamMatchingActionBar href={actionHref} label={actionLabel} />
    </main>
  );
}
