"use client";

import Dialog from "@/components/Dialog";

type TeamMatchingAlreadyAppliedModalProps = {
  onClose: () => void;
  open: boolean;
};

export default function TeamMatchingAlreadyAppliedModal({
  onClose,
  open,
}: TeamMatchingAlreadyAppliedModalProps) {
  const titleId = "team-matching-already-applied-modal-title";

  return (
    <Dialog
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-transparent px-5 py-4 backdrop:bg-[rgba(31,31,31,0.60)]"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={open}
      role="dialog"
    >
      <section className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[350px] shrink-0 flex-col items-center overflow-y-auto rounded-2xl bg-white px-4 pb-4 pt-2 shadow-[0_53px_15px_0_rgba(0,0,0,0),0_34px_14px_0_rgba(0,0,0,0.01),0_19px_12px_0_rgba(0,0,0,0.05),0_9px_9px_0_rgba(0,0,0,0.09),0_2px_5px_0_rgba(0,0,0,0.10)]">
        <div className="flex w-full flex-col items-center gap-[10px] px-1 pb-4 pt-4 text-center">
          <h1
            className="whitespace-pre-line font-[Pretendard] text-[20px] font-medium leading-[135%] text-[#1F1F1F]"
            id={titleId}
          >
            이미 매칭에 신청하셨어요.
          </h1>

          <p className="whitespace-pre-line font-[Pretendard] text-[17px] font-medium leading-[150%] text-[#616161]">
            매칭신청은 최대 하루에 한번 가능합니다.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <button
            className="flex h-12 w-full max-w-[302px] items-center justify-center rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-white"
            onClick={onClose}
            type="button"
          >
            확인
          </button>
        </div>
      </section>
    </Dialog>
  );
}
