"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { ApiError } from "@/lib/http";
import { useTodayMatchingApplicationQuery } from "@/queries/useTodayMatchingApplicationQuery";
import { useWithdrawMatchingApplicationMutation } from "@/queries/useWithdrawMatchingApplicationMutation";

export default function CancelConfirmationModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const initialFocusRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const { data: todayApplication } = useTodayMatchingApplicationQuery();
  const withdrawMutation = useWithdrawMatchingApplicationMutation();
  const withdrawal = todayApplication?.withdrawal;
  const applicationId = todayApplication?.applicationId;
  const canWithdraw = Boolean(applicationId) && (withdrawal?.withdrawable ?? true);
  const expectedPenalty = withdrawal?.expectedPenalty ?? 0;
  const isWithdrawing = withdrawMutation.isPending;
  const errorMessage = withdrawMutation.error
    ? withdrawMutation.error instanceof ApiError
      ? withdrawMutation.error.message
      : "매칭 신청 취소 중 오류가 발생했어요."
    : null;
  const withdrawalDescription = canWithdraw
    ? expectedPenalty > 0
      ? `취소하면 협업거리가 ${expectedPenalty}m 줄어들어요.`
      : "지금은 감점 없이 취소할 수 있어요."
    : "현재는 매칭 신청을 취소할 수 없어요.";

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    initialFocusRef.current?.focus();
  }, []);

  const closeModal = () => {
    router.push("/team-matching/pool");
  };

  const handleWithdraw = () => {
    if (!applicationId || isWithdrawing) {
      return;
    }

    withdrawMutation.mutate(applicationId, {
      onSuccess: () => {
        router.push("/team-matching");
      },
    });
  };

  return (
    <dialog
      aria-labelledby="matching-cancel-title"
      className="fixed left-1/2 top-0 z-50 m-0 hidden h-dvh max-h-none w-full max-w-[390px] -translate-x-1/2 overflow-y-auto bg-transparent px-5 pb-4 pt-[clamp(16px,calc(100dvh_-_180px),315px)] backdrop:bg-[rgba(31,31,31,0.60)] open:flex open:items-start open:justify-center"
      onCancel={(event) => {
        event.preventDefault();
        closeModal();
      }}
      ref={dialogRef}
    >
      <section className="flex max-h-[400px] w-full max-w-[350px] shrink-0 flex-col items-center rounded-2xl bg-white px-4 pb-4 pt-2 shadow-[0_53px_15px_0_rgba(0,0,0,0),0_34px_14px_0_rgba(0,0,0,0.01),0_19px_12px_0_rgba(0,0,0,0.05),0_9px_9px_0_rgba(0,0,0,0.09),0_2px_5px_0_rgba(0,0,0,0.10)]">
        <h2
          className="mt-4 w-full text-center font-[Pretendard] text-[20px] font-medium leading-[135%] text-[#1F1F1F]"
          id="matching-cancel-title"
        >
          팀원 매칭을 취소할까요?
        </h2>
        <p className="mt-2 text-center font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
          {withdrawalDescription}
        </p>
        {errorMessage ? (
          <p
            aria-live="polite"
            className="mt-2 text-center font-[Pretendard] text-[12px] font-medium leading-[150%] text-[#D04A2F]"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 flex h-[60px] self-stretch items-center gap-2 px-2 py-1">
          <Link
            className="flex flex-[1_0_0] items-center justify-center self-stretch rounded-xl border border-[rgba(97,97,97,0.50)] bg-white p-2 text-center font-[Roboto] text-[15px] font-semibold leading-[125%] text-[#616161]"
            href="/team-matching/pool"
            ref={initialFocusRef}
          >
            계속 기다리기
          </Link>
          {canWithdraw ? (
            <button
              className="flex flex-[1_0_0] items-center justify-center self-stretch rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-center font-[Roboto] text-[17px] font-semibold leading-[125%] text-white disabled:bg-[#DFDFDF]"
              disabled={isWithdrawing}
              onClick={handleWithdraw}
              type="button"
            >
              {isWithdrawing ? "취소 중..." : "매칭 취소하기"}
            </button>
          ) : (
            <button
              className="flex flex-[1_0_0] items-center justify-center self-stretch rounded-[14px] bg-[#DFDFDF] px-[10px] py-[9px] text-center font-[Roboto] text-[17px] font-semibold leading-[125%] text-white"
              disabled
              type="button"
            >
              취소 불가
            </button>
          )}
        </div>
      </section>
    </dialog>
  );
}
