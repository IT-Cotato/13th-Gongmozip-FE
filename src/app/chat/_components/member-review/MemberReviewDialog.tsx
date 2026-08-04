"use client";

import Image from "next/image";

import Dialog from "@/components/Dialog";
import type { ReviewMember } from "./types";

type MemberReviewStartDialogProps = {
  bonusDistance?: number;
  completionVariant?: "member" | "leader";
  member: ReviewMember;
  onClose: () => void;
  onStart: () => void;
  open: boolean;
  reviewerName: string;
  totalDistance?: number;
};

export function MemberReviewStartDialog({
  bonusDistance = 10,
  completionVariant = "member",
  member,
  onClose,
  onStart,
  open,
  reviewerName,
  totalDistance = 20,
}: MemberReviewStartDialogProps) {
  const completionMessage =
    completionVariant === "leader"
      ? `${reviewerName}님의 프로젝트\n완주를 축하드려요!!\n팀을 끝까지 성공적으로 이끌어\n협업거리 ${totalDistance}m를 획득했어요.`
      : `${reviewerName}님의 프로젝트\n완주를 축하드려요!!\n협업거리가 ${totalDistance}m 늘어났어요.`;

  return (
    <Dialog
      aria-label="팀원 리뷰 시작"
      className="m-auto w-[min(calc(100vw-40px),350px)] rounded-[16px] bg-white p-0 text-color-gray-850 shadow-[0_2px_5px_rgba(0,0,0,0.10),0_9px_9px_rgba(0,0,0,0.09),0_19px_12px_rgba(0,0,0,0.05),0_34px_14px_rgba(0,0,0,0.01)] backdrop:bg-color-gray-850/60"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={open}
    >
      <div className="flex flex-col items-center px-4 pb-4 pt-2">
        <div className="flex h-[38px] w-full justify-end">
          <button
            aria-label="닫기"
            className="flex size-[38px] items-center justify-center rounded-[14px] text-color-gray-900"
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex w-full flex-col items-center px-1 pb-4">
          <MemberReviewAvatar member={member} size="large" />

          <h2 className="mt-2 whitespace-pre-line text-center text-[20px] leading-[1.35] font-medium text-color-gray-850">
            {completionMessage}
          </h2>
          <p className="mt-2 whitespace-pre-line text-center text-[17px] leading-[1.5] font-medium text-color-gray-650">
            {`팀원들에 대한 솔직한 리뷰를 남기면\n협업거리가 ${bonusDistance}m 더 늘어나요`}
          </p>
        </div>

        <div className="flex h-[60px] w-full px-2 py-1">
          <button
            className="flex h-full flex-1 items-center justify-center rounded-[14px] bg-color-coral-500 px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
            onClick={onStart}
            type="button"
          >
            팀원들 리뷰하러 가기
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function MemberReviewStopDialog({
  onCancel,
  onLeave,
  open,
}: {
  onCancel: () => void;
  onLeave: () => void;
  open: boolean;
}) {
  return (
    <Dialog
      aria-label="팀원 리뷰 중단"
      className="m-auto max-h-[400px] w-[min(calc(100vw-40px),350px)] rounded-[16px] bg-white p-0 text-color-gray-850 shadow-[0_2px_5px_rgba(0,0,0,0.10),0_9px_9px_rgba(0,0,0,0.09),0_19px_12px_rgba(0,0,0,0.05),0_34px_14px_rgba(0,0,0,0.01),0_53px_15px_rgba(0,0,0,0)] backdrop:bg-color-gray-850/60"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel();
        }
      }}
      open={open}
    >
      <div className="flex flex-col items-center px-4 pb-4 pt-2 text-center">
        <div className="flex w-full flex-col items-center justify-center gap-2.5 overflow-hidden px-1 py-4">
          <h2 className="text-[20px] leading-[1.35] font-medium text-color-gray-850">
            팀원 리뷰를 나가시나요?
          </h2>
          <p className="whitespace-pre-line text-center text-[17px] leading-[1.5] font-medium text-color-gray-650">
            {`팀원 리뷰를 모두 완료해야\n협업거리가 10m 늘어나요.\n작성하신 내용은 임시저장됩니다.`}
          </p>
        </div>

        <div className="flex h-[60px] w-full gap-2 px-2 py-1">
          <button
            className="flex h-full flex-1 items-center justify-center rounded-[12px] border border-[rgba(97,97,97,0.5)] bg-white p-2 text-[15px] leading-[1.25] font-semibold text-color-gray-650"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="flex h-full flex-1 items-center justify-center rounded-[14px] bg-color-coral-500 px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
            onClick={onLeave}
            type="button"
          >
            나가기
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function MemberReviewAvatar({
  member,
  size = "medium",
}: {
  member: ReviewMember;
  size?: "large" | "medium" | "small";
}) {
  const sizeClass = {
    large: "size-[102px]",
    medium: "size-[64px]",
    small: "size-[44px]",
  }[size];
  const imageSize = {
    large: "102px",
    medium: "64px",
    small: "44px",
  }[size];
  const toneClass = {
    blue: "bg-color-blue-50",
    coral: "bg-color-coral-100",
    green: "bg-color-green-100",
    robot: "bg-color-blue-50",
  }[member.avatarTone];

  return (
    <span
      className={`relative shrink-0 overflow-hidden rounded-full border-2 border-white ${toneClass} ${sizeClass}`}
    >
      {member.avatarSrc ? (
        <Image src={member.avatarSrc} alt="" fill sizes={imageSize} className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[20px] font-semibold text-color-gray-750">
          {member.name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
