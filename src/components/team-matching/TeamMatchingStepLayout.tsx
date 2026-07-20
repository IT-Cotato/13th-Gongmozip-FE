"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

import Dialog from "@/components/Dialog";
import TeamMatchingActionBar from "./TeamMatchingActionBar";
import TeamMatchingHeader from "./TeamMatchingHeader";
import TeamMatchingProgress from "./TeamMatchingProgress";

type TeamMatchingStepLayoutProps = {
  actionDisabled?: boolean;
  actionHref: string;
  actionLabel: string;
  backHref?: string;
  children: ReactNode;
  currentStep: number;
};

export default function TeamMatchingStepLayout({
  actionDisabled = false,
  actionHref,
  actionLabel,
  backHref = "/team-matching",
  children,
  currentStep,
}: TeamMatchingStepLayoutProps) {
  const [isLeaveConfirmationOpen, setIsLeaveConfirmationOpen] = useState(false);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <main className="fixed left-1/2 top-0 flex h-[851px] max-h-dvh w-full max-w-[390px] -translate-x-1/2 flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader
        backHref={backHref}
        onBackClick={() => setIsLeaveConfirmationOpen(true)}
      />
      <TeamMatchingProgress currentStep={currentStep} />
      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-[21px]">
        {children}
      </div>
      <TeamMatchingActionBar disabled={actionDisabled} href={actionHref} label={actionLabel} />

      <Dialog
        aria-labelledby="leave-confirmation-title"
        className="fixed left-1/2 top-0 z-50 m-0 hidden h-[844px] max-h-dvh w-full max-w-[390px] -translate-x-1/2 items-center justify-center gap-[10px] overflow-hidden bg-transparent px-8 backdrop:bg-[rgba(31,31,31,0.60)] open:flex"
        initialFocusRef={continueButtonRef}
        onOpenChange={setIsLeaveConfirmationOpen}
        open={isLeaveConfirmationOpen}
      >
        <section className="mb-[19px] flex max-h-[400px] w-full flex-1 flex-col items-center rounded-2xl bg-white px-4 pb-4 pt-2 shadow-[0_53px_15px_0_rgba(0,0,0,0),0_34px_14px_0_rgba(0,0,0,0.01),0_19px_12px_0_rgba(0,0,0,0.05),0_9px_9px_0_rgba(0,0,0,0.09),0_2px_5px_0_rgba(0,0,0,0.10)]">
          <div className="flex self-stretch flex-col items-start gap-[10px] px-1 py-4">
            <h2
              className="w-full text-center font-[Pretendard] text-[20px] font-medium leading-[135%] text-[#1F1F1F]"
              id="leave-confirmation-title"
            >
              아직 팀 매칭 신청이
              <br />
              완료되지 않았어요
            </h2>

            <p className="w-full text-center font-[Pretendard] text-[17px] font-medium leading-[150%] text-[#616161]">
              이 화면을 벗어나면
              <br />
              지금까지 입력한 내용이 사라질 수 있어요.
            </p>
          </div>

          <div className="flex h-[60px] self-stretch items-center gap-2 px-2 py-1">
            <button
              className="flex flex-1 self-stretch items-center justify-center rounded-xl border border-[rgba(97,97,97,0.50)] bg-white p-2 text-center font-[Roboto] text-[15px] font-semibold leading-[125%] text-[#616161]"
              onClick={() => setIsLeaveConfirmationOpen(false)}
              ref={continueButtonRef}
              type="button"
            >
              신청 계속하기
            </button>
            <Link
              className="flex flex-1 self-stretch items-center justify-center rounded-[14px] bg-color-coral-700 px-[10px] py-[9px] text-center font-[Roboto] text-[17px] font-semibold leading-[125%] text-white"
              href={backHref}
            >
              나가기
            </Link>
          </div>
        </section>
      </Dialog>
    </main>
  );
}
