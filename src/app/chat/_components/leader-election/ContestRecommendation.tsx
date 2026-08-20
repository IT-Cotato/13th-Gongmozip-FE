"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, type KeyboardEvent, type MouseEvent } from "react";

import type { ContestVoteResultItem } from "@/queries/useChatQueries";
import type { ContestSummary } from "@/app/contests/_types";

import type { ChatMessage } from "../../_data/chatTypes";
import { ChatAvatar } from "../ChatAvatar";
import { ChatbotAvatar, MessageMeta } from "./ChatbotMessage";
import type { RecommendedContest } from "./types";

const fallbackVoteRemainingSeconds = 2 * 60 * 60;
const popoverShadow =
  "shadow-[0_53px_15px_rgba(0,0,0,0),0_34px_14px_rgba(0,0,0,0.01),0_19px_12px_rgba(0,0,0,0.05),0_9px_9px_rgba(0,0,0,0.09),0_2px_5px_rgba(0,0,0,0.10)]";

function formatCandidateTimer(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((safeSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const restSeconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${hours} : ${minutes} : ${restSeconds}`;
}

function createContestDetailHref(contestId: number | string, returnTo?: string | null) {
  const href = `/contests/${encodeURIComponent(String(contestId))}`;

  if (!returnTo) {
    return href;
  }

  return `${href}?returnTo=${encodeURIComponent(returnTo)}`;
}

function getContestDetailHref(contest: RecommendedContest, returnTo?: string | null) {
  const contestId = contest.contestId ?? Number(contest.id);

  if (!Number.isFinite(contestId)) {
    return null;
  }

  return createContestDetailHref(contestId, returnTo);
}

function useContestDetailNavigation(contest: RecommendedContest, enabled = true) {
  const router = useRouter();
  const pathname = usePathname();
  const returnTo = pathname.startsWith("/chat/") ? pathname : null;
  const href = getContestDetailHref(contest, returnTo);
  const isClickable = enabled && href !== null;

  const openContestDetail = () => {
    if (isClickable && href) {
      router.push(href);
    }
  };

  const openContestDetailByKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (!isClickable || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    openContestDetail();
  };

  return { isClickable, openContestDetail, openContestDetailByKeyboard };
}

function stopCardActionPropagation(event: MouseEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

function stopCardActionKeyDownPropagation(event: KeyboardEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

export function ContestRecommendationMessage({
  body,
  contests,
  isActionDisabled = false,
  onRemove,
  onStartVote,
  remainingSeconds,
  sentAt,
  timerLabel,
  title,
}: {
  body?: string;
  contests: RecommendedContest[];
  isActionDisabled?: boolean;
  onRemove?: (contest: RecommendedContest) => void;
  onStartVote: () => void;
  remainingSeconds: number;
  sentAt?: string;
  timerLabel: string;
  title: string;
}) {
  const guideBody =
    body ||
    `자기소개를 마쳤다면, 이제 함께 나갈 공모전을 골라볼까요? 🏆
팀의 카테고리를 바탕으로 공모전을 먼저 추천해드릴게요!
• 더 원하는 공모전이 있다면 후보 리스트에 자유롭게 추가해주세요.
• 공모전 투표는 2개까지 가능해요.
• 후보 등록과 투표는 24시간 동안 진행되고, 모든 팀원이 투표하면 바로 마감돼요!`;

  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex w-[304px] min-w-0 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {guideBody}
          </p>
          <MessageMeta sentAt={sentAt} />
        </div>
        <ContestListCard
          contests={contests}
          disabled={isActionDisabled}
          onAction={onStartVote}
          onRemove={onRemove}
          remainingSeconds={remainingSeconds}
          timerLabel={timerLabel}
          title={title}
        />
      </div>
    </article>
  );
}

export function ContestCandidateListPage({
  contests,
  deletingContestId,
  isAddDisabled = false,
  onBack,
  onOpenAdd,
  onRemove,
  remainingSeconds,
}: {
  contests: RecommendedContest[];
  deletingContestId?: string;
  isAddDisabled?: boolean;
  onBack: () => void;
  onOpenAdd: () => void;
  onRemove?: (contest: RecommendedContest) => void;
  remainingSeconds: number;
}) {
  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-850">
      <header className="flex h-[47px] shrink-0 items-center justify-between px-4">
        <button
          aria-label="뒤로가기"
          className="flex size-[38px] items-center justify-center rounded-[14px] text-[28px] leading-none text-color-gray-850"
          onClick={onBack}
          type="button"
        >
          ‹
        </button>
        <h1 className="text-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
          후보 공모전 리스트
        </h1>
        <button
          aria-label="후보 공모전 추가"
          className="flex size-[38px] items-center justify-center rounded-[14px] text-[28px] leading-none text-color-gray-850 disabled:text-color-gray-350"
          disabled={isAddDisabled}
          onClick={onOpenAdd}
          type="button"
        >
          +
        </button>
      </header>

      <section className="mx-4 mt-2 flex shrink-0 flex-col items-center gap-2 rounded-[16px] bg-color-khaki-50 p-4">
        <span className="rounded-[10px] bg-color-coral-900 px-2 py-[5px] text-[13px] leading-[1.25] font-semibold text-white">
          후보 마감까지
        </span>
        <LargeCountdown remainingSeconds={remainingSeconds} />
      </section>

      <section className="mt-4 flex-1 overflow-y-auto">
        {contests.length > 0 ? (
          contests.map((contest) => (
            <FullContestListItem
              contest={contest}
              disabled={deletingContestId === contest.id || contest.isRecommended}
              key={contest.id}
              onRemove={contest.isRecommended ? undefined : onRemove}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-[13px] leading-[1.5] text-color-gray-650">
              등록된 후보 공모전이 없습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export function ContestCandidateAddListPage({
  addedContestIds,
  contests,
  isAdding = false,
  isLoading = false,
  onAdd,
  onBack,
}: {
  addedContestIds: string[];
  contests: ContestSummary[];
  isAdding?: boolean;
  isLoading?: boolean;
  onAdd: (contest: ContestSummary) => void;
  onBack: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const returnTo = pathname.startsWith("/chat/") ? pathname : null;
  const addedContestIdSet = new Set(addedContestIds);

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white pt-[env(safe-area-inset-top)] text-color-gray-850">
      <header className="flex h-[47px] shrink-0 items-center justify-between px-4">
        <button
          aria-label="뒤로가기"
          className="flex size-[38px] items-center justify-center rounded-[14px] text-[28px] leading-none text-color-gray-850"
          onClick={onBack}
          type="button"
        >
          ‹
        </button>
        <h1 className="text-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
          후보 공모전 추가
        </h1>
        <span className="size-[38px]" />
      </header>

      <section className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-[13px] leading-[1.5] text-color-gray-650">
              공모전 목록을 불러오는 중입니다.
            </p>
          </div>
        ) : contests.length > 0 ? (
          contests.map((contest) => {
            const isAdded = addedContestIdSet.has(contest.id);

            return (
              <article
                className="flex w-full cursor-pointer border-b border-color-gray-250 bg-white py-2 pr-2 pl-4"
                key={contest.id}
                onClick={() => router.push(createContestDetailHref(contest.id, returnTo))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(createContestDetailHref(contest.id, returnTo));
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex min-w-0 flex-1 items-center gap-[14px]">
                  <LargeContestPosterImage src={contest.posterImageUrl} />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] leading-[1.35] font-semibold text-color-coral-700">
                      {contest.category}
                    </span>
                    <strong className="mt-1 block max-w-full overflow-hidden whitespace-nowrap text-ellipsis text-[17px] leading-[1.35] font-bold text-color-gray-850">
                      {contest.title}
                    </strong>
                    <span className="mt-1 block truncate text-[13px] leading-[1.25] font-medium text-color-gray-650">
                      {contest.organizer}
                    </span>
                    <div className="mt-2 flex items-center gap-2 text-[12px] leading-[1.35] font-semibold text-color-gray-350">
                      <span className="rounded-[85px] bg-color-coral-500 px-2 py-1 text-white">
                        {contest.dDay}
                      </span>
                      <ViewCount value={contest.viewCount.toLocaleString("ko-KR")} />
                    </div>
                  </div>
                </div>
                <button
                  aria-label={`${contest.title} 후보 추가`}
                  className="flex size-[38px] shrink-0 items-center justify-center rounded-[14px] text-[24px] leading-none text-color-gray-650 disabled:text-color-gray-350"
                  disabled={isAdded || isAdding}
                  onClick={(event) => {
                    event.stopPropagation();
                    onAdd(contest);
                  }}
                  onKeyDown={stopCardActionKeyDownPropagation}
                  type="button"
                >
                  {isAdded ? "✓" : "+"}
                </button>
              </article>
            );
          })
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-[13px] leading-[1.5] text-color-gray-650">
              추가할 수 있는 공모전이 없습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export function ContestSharedMessage({
  avatarSrc,
  avatarTone = "green",
  contest,
  direction,
  isAdded,
  onAdd,
  onOpenProfile,
  senderName,
  sentAt,
  unreadLabel,
}: {
  avatarSrc?: string;
  avatarTone?: ChatMessage["avatarTone"];
  contest: RecommendedContest;
  direction: ChatMessage["direction"];
  isAdded: boolean;
  onAdd: () => void;
  onOpenProfile?: () => void;
  senderName: string;
  sentAt?: string;
  unreadLabel?: string;
}) {
  if (direction === "incoming") {
    return (
      <article className="flex w-full items-start gap-2">
        <button
          type="button"
          className="shrink-0 text-left disabled:cursor-default"
          disabled={!onOpenProfile}
          onClick={onOpenProfile}
          aria-label={`${senderName} 프로필 보기`}
        >
          <ChatAvatar name={senderName} tone={avatarTone} src={avatarSrc} />
        </button>
        <div className="flex w-[304px] shrink-0 flex-col items-start gap-1">
          <button
            type="button"
            className="text-[12px] leading-[1.35] font-medium whitespace-nowrap text-color-gray-750 disabled:cursor-default"
            disabled={!onOpenProfile}
            onClick={onOpenProfile}
          >
            {senderName}
          </button>
          <ContestSharedCard contest={contest} isAdded={isAdded} onAdd={onAdd} />
          <div className="flex items-end gap-2 text-[12px] leading-[1.35] whitespace-nowrap">
            <span className="text-color-gray-650">{sentAt}</span>
            {unreadLabel ? <span className="text-color-coral-500">{unreadLabel}</span> : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex w-full justify-end">
      <div className="flex max-w-[304px] flex-col items-end gap-1">
        <ContestSharedCard contest={contest} isAdded={isAdded} onAdd={onAdd} />
        <div className="flex items-end gap-2 text-[12px] leading-[1.35]">
          <span className="text-color-gray-650">{sentAt ?? "오후 8:28"}</span>
          {unreadLabel ? <span className="text-color-coral-500">{unreadLabel}</span> : null}
        </div>
      </div>
    </article>
  );
}

export function ContestCandidateAddDialog({
  contest,
  onCancel,
  onConfirm,
}: {
  contest: RecommendedContest;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <section
      className={`flex max-h-[400px] w-[350px] flex-col items-center rounded-[16px] bg-white px-4 pt-2 pb-4 ${popoverShadow}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full px-1 py-4">
        <p className="text-[20px] leading-[1.35] font-medium text-color-gray-850">
          해당 공모전을 후보로 추가하겠습니까?
        </p>
      </div>
      <div className="flex h-[60px] w-full gap-2 px-2 py-1">
        <button
          className="flex flex-1 items-center justify-center rounded-[12px] border border-[rgba(97,97,97,0.5)] text-[15px] leading-[1.25] font-semibold text-color-gray-650"
          onClick={onConfirm}
          type="button"
        >
          예
        </button>
        <button
          className="flex flex-1 items-center justify-center rounded-[14px] bg-color-coral-500 text-[17px] leading-[1.25] font-semibold text-white"
          onClick={onCancel}
          type="button"
        >
          아니오
        </button>
      </div>
      <span className="sr-only">{contest.title}</span>
    </section>
  );
}

export function ContestCandidateUnavailableDialog({ onClose }: { onClose: () => void }) {
  return (
    <section
      className={`flex max-h-[400px] w-[350px] flex-col items-center rounded-[16px] bg-white px-4 pt-2 pb-4 ${popoverShadow}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full px-1 py-4">
        <p className="text-center text-[20px] leading-[1.35] font-medium text-color-gray-850">
          지금은 공모전 후보를
          <br />
          추가할 수 있는 단계가 아니예요.
        </p>
      </div>
      <div className="flex h-[60px] w-full px-2 py-1">
        <button
          className="flex flex-1 items-center justify-center rounded-[14px] bg-color-coral-500 text-[17px] leading-[1.25] font-semibold text-white"
          onClick={onClose}
          type="button"
        >
          확인
        </button>
      </div>
    </section>
  );
}

export function ContestAddedToast({ onShortcut }: { onShortcut: () => void }) {
  return (
    <div className="pointer-events-auto absolute bottom-[108px] left-1/2 z-50 flex w-[340px] -translate-x-1/2 items-baseline gap-4 rounded-full bg-[rgba(17,17,17,0.6)] py-2 pr-4 pl-5">
      <p className="min-w-0 flex-1 text-[15px] leading-[1.25] font-medium text-white">
        해당 공모전이 후보로 추가되었습니다.
      </p>
      <button
        className="flex h-7 items-center justify-center px-0.5 text-[13px] leading-[1.25] font-semibold text-white underline underline-offset-2"
        onClick={onShortcut}
        type="button"
      >
        바로가기
      </button>
    </div>
  );
}

export function ContestVoteNoticeBanner({
  body,
  isActionDisabled = false,
  isVoteSubmitted,
  onAction,
}: {
  body?: string;
  isActionDisabled?: boolean;
  isVoteSubmitted: boolean;
  onAction: () => void;
}) {
  const isButtonDisabled = isActionDisabled;

  return (
    <section className="flex w-full items-center gap-2 bg-color-gray-100 p-4 shadow-[0_5px_1px_rgba(0,0,0,0),0_3px_1px_rgba(0,0,0,0.01),0_2px_1px_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.09)]">
      <div className="relative shrink-0">
        <span className="relative flex size-[46px] overflow-hidden rounded-full bg-color-blue-50">
          <Image src="/icons/chat/chat_bot.svg" alt="" fill sizes="46px" className="object-cover" />
        </span>
        <span
          aria-hidden="true"
          className="absolute top-[-2px] right-[-6px] flex size-5 items-center justify-center"
        >
          <Image src="/icons/chat/chat_bot_2.svg" alt="" width={20} height={20} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-line text-center text-[15px] leading-[1.35] text-color-gray-750">
          {body ??
            `공모전 투표 완료하셨나요? 투표마감까지 10분
남았어요!`}
        </p>
        <button
          className={`mt-2 flex h-9 w-full items-center justify-center rounded-[10px] text-[13px] leading-[1.25] font-semibold ${
            isButtonDisabled
              ? "border border-[rgba(97,97,97,0.10)] bg-[rgba(97,97,97,0.06)] text-color-gray-350 shadow-none"
              : isVoteSubmitted
                ? "bg-[rgba(97,97,97,0.10)] text-color-gray-650"
                : "bg-color-gray-650 text-white"
          }`}
          disabled={isButtonDisabled}
          onClick={onAction}
          type="button"
        >
          {isVoteSubmitted ? "다시 투표하기" : "투표하기"}
        </button>
      </div>
    </section>
  );
}

export function ProjectSubmissionReminderBanner({
  onComplete,
  onIncomplete,
}: {
  onComplete: () => void;
  onIncomplete: () => void;
}) {
  return (
    <section className="flex w-full items-center gap-2 bg-color-gray-100 p-4 shadow-[0_5px_1px_rgba(0,0,0,0),0_3px_1px_rgba(0,0,0,0.01),0_2px_1px_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.09)]">
      <div className="relative shrink-0">
        <span className="relative flex size-[46px] overflow-hidden rounded-full bg-color-blue-50">
          <Image src="/icons/chat/chat_bot.svg" alt="" fill sizes="46px" className="object-cover" />
        </span>
        <span
          aria-hidden="true"
          className="absolute top-[-2px] right-[-6px] flex size-5 items-center justify-center"
        >
          <Image src="/icons/chat/chat_bot_2.svg" alt="" width={20} height={20} />
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-center text-[15px] leading-[1.35] text-color-gray-750">
          프로젝트가 진행완료되었으면, 진행완료 버튼을 눌러주세요.
        </p>
        <div className="flex h-9 w-full gap-2">
          <button
            className="flex h-full min-w-0 flex-1 items-center justify-center rounded-[10px] bg-[rgba(97,97,97,0.10)] px-3 text-[13px] leading-[1.25] font-semibold text-color-gray-650"
            onClick={onIncomplete}
            type="button"
          >
            미완료
          </button>
          <button
            className="flex h-full min-w-0 flex-1 items-center justify-center rounded-[10px] bg-color-gray-650 px-3 text-[13px] leading-[1.25] font-semibold text-white"
            onClick={onComplete}
            type="button"
          >
            진행 완료
          </button>
        </div>
      </div>
    </section>
  );
}

export function ProgressCheckBanner({
  disabled = false,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit: (progressPercent: number) => void | Promise<void>;
}) {
  const [progress, setProgress] = useState(0);
  const [isTouched, setIsTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSaving = disabled || isSubmitting;
  const canSubmit = isTouched && progress > 0 && !isSaving;

  const submitProgress = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(progress);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex w-full items-center gap-2 bg-color-gray-100 p-4 shadow-[0_5px_1px_rgba(0,0,0,0),0_3px_1px_rgba(0,0,0,0.01),0_2px_1px_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.09)]">
      <div className="relative shrink-0">
        <span className="relative flex size-[46px] overflow-hidden rounded-full bg-color-blue-50">
          <Image src="/icons/chat/chat_bot.svg" alt="" fill sizes="46px" className="object-cover" />
        </span>
        <span
          aria-hidden="true"
          className="absolute top-[-2px] right-[-6px] flex size-5 items-center justify-center"
        >
          <Image src="/icons/chat/chat_bot_2.svg" alt="" width={20} height={20} />
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-4">
        <p className="text-center text-[15px] leading-[1.35] text-color-gray-750">
          팀장님, 공모전 제출일까지 벌써 절반 왔어요 !
          <br />
          현재까지의 진행률을 체크해주세요.
        </p>
        <div className="relative h-[23px] w-full max-w-[230px] overflow-hidden rounded-[40px] bg-color-gray-200">
          <div
            className="absolute inset-y-0 left-0 rounded-[40px] bg-[linear-gradient(45deg,#FF7658_0%,#FFAD62_100%)]"
            style={{ width: isTouched ? `${progress}%` : "26px" }}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[12px] leading-[1.35] font-semibold text-color-gray-500">
            드래그 해주세요
          </span>
          <input
            aria-label="중간점검 진행률"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            disabled={isSaving}
            max={100}
            min={0}
            onChange={(event) => {
              setProgress(Number(event.target.value));
              setIsTouched(true);
            }}
            type="range"
            value={progress}
          />
        </div>
        <button
          className={`flex h-9 w-full items-center justify-center rounded-[10px] px-3 text-[13px] leading-[1.25] font-semibold ${
            canSubmit
              ? "bg-color-gray-650 text-white"
              : "bg-[rgba(97,97,97,0.10)] text-color-gray-650"
          }`}
          disabled={!canSubmit}
          onClick={() => {
            void submitProgress();
          }}
          type="button"
        >
          {isSaving ? "저장 중" : "진행률 저장"}
        </button>
      </div>
    </section>
  );
}

export function ContestVoteResultMessage({
  contest,
  sentAt,
}: {
  contest: RecommendedContest;
  sentAt?: string;
}) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {`여러분들이 나가게 될 공모전은 “${contest.title}” 입니다. 팀장님의 주도 하에 공모전 준비를 잘 해나가길 바라겠습니다.`}
          </p>
          <MessageMeta sentAt={sentAt} />
        </div>
        <div className="mt-1 w-[290px]">
          <CompactContestListItem contest={contest} highlight />
        </div>
      </div>
    </article>
  );
}
export function ContestVoteSheet({
  contests,
  disabled = false,
  isRevote = false,
  onBack,
  onOpenAdd,
  onSubmit,
  onToggle,
  participantCount,
  remainingSeconds = fallbackVoteRemainingSeconds,
  selectedContestIds,
}: {
  contests: RecommendedContest[];
  disabled?: boolean;
  isRevote?: boolean;
  onBack: () => void;
  onOpenAdd: () => void;
  onSubmit: () => void;
  onToggle: (contestId: string) => void;
  participantCount?: number;
  remainingSeconds?: number;
  selectedContestIds: string[];
}) {
  const isVoteEnded = remainingSeconds <= 0 || disabled;
  const timerLabel = isVoteEnded ? "투표 종료" : "투표 마감까지";
  const participantLabel =
    participantCount === undefined
      ? "0명 참여"
      : `${participantCount.toLocaleString("ko-KR")}명 참여`;

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-850">
      <header className="flex h-[47px] shrink-0 items-center justify-between px-4">
        <button
          aria-label="뒤로가기"
          className="flex size-[38px] items-center justify-center rounded-[14px] text-[28px] leading-none text-color-gray-850"
          onClick={onBack}
          type="button"
        >
          ‹
        </button>
        <h1 className="text-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
          투표하기
        </h1>
        <button
          aria-label="후보 공모전 추가"
          className="flex size-[38px] items-center justify-center rounded-[14px] text-[28px] leading-none text-color-gray-850"
          onClick={onOpenAdd}
          type="button"
        >
          +
        </button>
      </header>

      <VoteTimerPanel
        isEnded={isVoteEnded}
        label={timerLabel}
        remainingSeconds={remainingSeconds}
      />

      <section className="mt-6 shrink-0 px-4 text-center">
        <h2 className="text-[17px] leading-[1.35] font-semibold text-color-gray-850">
          참여하고 싶은 공모전에 투표해주세요!
        </h2>
        <p className="mt-1 text-[13px] leading-[1.35] font-medium text-color-coral-500">
          투표는 최대 2개까지 가능합니다.
        </p>
      </section>

      <section className="mx-4 mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-color-gray-250 bg-white px-5 py-5">
        <p className="text-center text-[13px] leading-[1.25] font-semibold text-color-gray-500">
          {participantLabel}
        </p>

        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {contests.length > 0 ? (
            contests.map((contest) => (
              <VotePageContestRow
                contest={contest}
                isSelected={selectedContestIds.includes(contest.id)}
                key={contest.id}
                onClick={() => onToggle(contest.id)}
              />
            ))
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-[13px] leading-[1.5] text-color-gray-650">
                투표할 후보 공모전이 없습니다.
              </p>
            </div>
          )}
        </div>

        <button
          className="mx-auto mt-5 flex h-8 items-center justify-center gap-1 px-2 text-[15px] leading-[1.25] font-medium text-color-gray-650"
          onClick={onOpenAdd}
          type="button"
        >
          <Image src="/icons/chat/leader-plus.svg" alt="" width={20} height={20} />
          후보 추가
        </button>
      </section>

      <div className="shrink-0 bg-white px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <button
          className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-color-coral-500 px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white outline-none disabled:bg-color-gray-200 disabled:text-color-gray-350 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isVoteEnded || contests.length === 0 || selectedContestIds.length === 0}
          onClick={onSubmit}
          type="button"
        >
          {isVoteEnded ? "투표 종료" : isRevote ? "다시 투표하기" : "투표하기"}
        </button>
      </div>
    </main>
  );
}

export function ContestVoteCompleteSheet({
  contests,
  onBack,
  onOpenAdd,
  onRevote,
  participantCount,
  remainingSeconds = fallbackVoteRemainingSeconds,
  selectedContestIds,
  voteResults,
}: {
  contests: RecommendedContest[];
  onBack: () => void;
  onOpenAdd: () => void;
  onRevote: () => void;
  participantCount?: number;
  remainingSeconds?: number;
  selectedContestIds: string[];
  voteResults?: ContestVoteResultItem[];
}) {
  const isVoteEnded = remainingSeconds <= 0;
  const timerLabel = isVoteEnded ? "투표 종료" : "투표 마감까지";
  const selectedContestIdSet = new Set(selectedContestIds);
  const hasSuppliedVoteResults = voteResults !== undefined;
  const voteResultByContestId = createVoteResultMap(voteResults);
  const participantLabel =
    participantCount === undefined
      ? "0명 참여"
      : `${participantCount.toLocaleString("ko-KR")}명 참여`;

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-850">
      <header className="flex h-[47px] shrink-0 items-center justify-between px-4">
        <button
          aria-label="뒤로가기"
          className="flex size-[38px] items-center justify-center rounded-[14px] text-[28px] leading-none text-color-gray-850"
          onClick={onBack}
          type="button"
        >
          ‹
        </button>
        <h1 className="text-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
          투표하기
        </h1>
        <button
          aria-label="후보 공모전 추가"
          className="flex size-[38px] items-center justify-center rounded-[14px] text-[28px] leading-none text-color-gray-850"
          onClick={onOpenAdd}
          type="button"
        >
          +
        </button>
      </header>

      <VoteTimerPanel
        isEnded={isVoteEnded}
        label={timerLabel}
        remainingSeconds={remainingSeconds}
      />

      <section className="mt-6 shrink-0 px-4 text-center">
        <h2 className="text-[17px] leading-[1.35] font-semibold text-color-gray-850">
          참여하고 싶은 공모전에 투표해주세요!
        </h2>
        <p className="mt-1 text-[13px] leading-[1.35] font-medium text-color-coral-500">
          투표는 최대 2개까지 가능합니다.
        </p>
      </section>

      <section className="mx-4 mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-color-gray-250 bg-white px-5 py-5">
        <p className="text-center text-[13px] leading-[1.25] font-semibold text-color-gray-500">
          {participantLabel}
        </p>

        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {contests.map((contest) => {
            const isSelected = selectedContestIdSet.has(contest.id);
            const voteResult = getVoteResultForContest(voteResultByContestId, contest);

            return (
              <CompleteVoteContestRow
                contest={contest}
                countLabel={getVoteResultCountLabel(
                  voteResult,
                  isSelected ? 0 : contests.length,
                  hasSuppliedVoteResults,
                )}
                isSelected={isSelected}
                key={contest.id}
                percent={getVoteResultPercent(
                  voteResult,
                  participantCount,
                  !hasSuppliedVoteResults && isSelected ? 28 : 0,
                )}
              />
            );
          })}
        </div>
      </section>

      <div className="shrink-0 bg-white px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <button
          className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[rgba(97,97,97,0.10)] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-color-gray-650 outline-none disabled:bg-color-gray-200 disabled:text-color-gray-350 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isVoteEnded}
          onClick={onRevote}
          type="button"
        >
          {isVoteEnded ? "투표 종료" : "다시 투표하기"}
        </button>
      </div>
    </main>
  );
}

export function ContestVoteResultSheet({
  hasVotes = true,
  onShowDetail,
  participantCount,
}: {
  hasVotes?: boolean;
  onShowDetail: () => void;
  participantCount?: number;
}) {
  const participantLabel =
    participantCount === undefined
      ? undefined
      : `${participantCount.toLocaleString("ko-KR")}명 참여`;

  if (!hasVotes) {
    return (
      <ContestStatePopup
        buttonDisabled
        buttonLabel="결과 확인하기"
        description={`투표에 참여한 인원이 없어, 여러분이
더 좋은 결과를 낼 수 있을 것 같은
공모전을 대신 골라드렸습니다.`}
        iconSrc="/icons/chat/vote_2.svg"
        onButtonClick={onShowDetail}
        participantLabel={participantLabel ?? "0명 참여"}
        title="투표 결과"
      />
    );
  }

  return (
    <ContestStatePopup
      buttonLabel="결과 확인하기"
      description="투표 결과를 확인해보세요."
      iconSrc="/icons/chat/vote_2.svg"
      onButtonClick={onShowDetail}
      participantLabel={participantLabel ?? "0명 참여"}
      title="투표 결과"
    />
  );
}

export function ContestVoteDetailSheet({
  contests,
  onClose,
  participantCount,
  voteResults,
}: {
  contests: RecommendedContest[];
  onClose: () => void;
  participantCount?: number;
  voteResults?: ContestVoteResultItem[];
}) {
  const rows = contests.slice(0, 3);
  const hasSuppliedVoteResults = voteResults !== undefined;
  const voteResultByContestId = createVoteResultMap(voteResults);
  const participantLabel =
    participantCount === undefined
      ? "0명 참여"
      : `${participantCount.toLocaleString("ko-KR")}명 참여`;

  return (
    <ContestPopup className="items-center justify-center px-4 pt-4 pb-6">
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-0.5 text-[17px] leading-[1.35] font-semibold text-color-coral-500">
            <Image src="/icons/chat/vote_2.svg" alt="" width={24} height={24} />
            <h2>투표 결과</h2>
          </div>
          <span className="h-[14px] w-px bg-color-gray-300" />
          <span className="text-[13px] leading-[1.25] font-medium text-color-gray-500">
            {participantLabel}
          </span>
          <SmallTimer compact label="투표 종료" remainingSeconds={0} />
        </div>

        <div className="flex w-[338px] flex-col items-center">
          <div className="flex w-[328px] flex-col items-end gap-4">
            {rows.map((contest, index) => {
              const voteResult = getVoteResultForContest(voteResultByContestId, contest);

              return (
                <ResultContestRow
                  countLabel={getVoteResultCountLabel(voteResult, index, hasSuppliedVoteResults)}
                  contest={contest}
                  isWinner={voteResult?.isWinner ?? (!hasSuppliedVoteResults && index === 0)}
                  key={contest.id}
                  percent={getVoteResultPercent(
                    voteResult,
                    participantCount,
                    !hasSuppliedVoteResults && index < 2 ? 28 : 0,
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>

      <button className="sr-only" onClick={onClose} type="button">
        닫기
      </button>
    </ContestPopup>
  );
}

function ContestListCard({
  contests,
  disabled = false,
  onAction,
  onRemove,
  remainingSeconds,
  timerLabel,
  title,
}: {
  contests: RecommendedContest[];
  disabled?: boolean;
  onAction: () => void;
  onRemove?: (contest: RecommendedContest) => void;
  remainingSeconds: number;
  timerLabel: string;
  title: string;
}) {
  return (
    <div className="mt-1 w-[304px] rounded-[16px] bg-color-gray-200 px-3 py-4">
      <ContestCardHeader
        isEnded={disabled}
        remainingSeconds={remainingSeconds}
        timerLabel={timerLabel}
        title={title}
      />
      <p className="mt-1 text-[12px] leading-[1.35] font-semibold text-color-coral-500">
        *공모집이 추천한 공모전입니다.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {contests.slice(0, 3).map((contest) => (
          <CompactContestListItem
            contest={contest}
            key={contest.id}
            onRemove={onRemove}
            removable={false}
          />
        ))}
      </div>

      <button className="hidden" onClick={() => undefined} type="button">
        전체보기
      </button>
      <button
        className={`mt-4 flex h-9 w-full items-center justify-center gap-1 rounded-[10px] px-3 text-[13px] leading-[1.25] font-semibold ${
          disabled
            ? "bg-[rgba(97,97,97,0.10)] text-color-gray-650"
            : "bg-color-coral-500 text-white"
        }`}
        disabled={disabled}
        onClick={onAction}
        type="button"
      >
        {disabled ? (
          "투표 종료"
        ) : (
          <>
            <Image src="/icons/chat/vote_2_1.svg" alt="" width={18} height={18} />
            원하는 공모전 투표하러 가기
          </>
        )}
      </button>
    </div>
  );
}

function ContestCardHeader({
  isEnded,
  remainingSeconds,
  timerLabel,
  title,
}: {
  isEnded: boolean;
  remainingSeconds: number;
  timerLabel: string;
  title: string;
}) {
  const displayLabel = isEnded ? "투표 종료" : timerLabel;
  const displayRemainingSeconds = isEnded ? 0 : remainingSeconds;

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="sr-only">
        {title} {displayLabel}
      </span>
      <div className="flex min-w-0 shrink-0 items-center gap-[7px] text-[13px] leading-[1.25] font-semibold text-color-coral-900">
        <Image src="/icons/chat/tabler_list.svg" alt="" width={24} height={24} />
        <span className="whitespace-nowrap">추천 공모전 리스트</span>
      </div>
      <span
        className={`flex shrink-0 items-center rounded-[16px] px-2 py-1 text-[12px] leading-[1.35] font-semibold ${
          isEnded ? "bg-white/80 text-color-gray-650" : "bg-color-coral-50 text-color-coral-700"
        }`}
      >
        {displayLabel} {formatCandidateTimer(displayRemainingSeconds)}
      </span>
    </div>
  );
}

function CompactContestListItem({
  contest,
  highlight = false,
  muted = false,
  onRemove,
  openDetailOnClick = true,
  removable = false,
}: {
  contest: RecommendedContest;
  highlight?: boolean;
  muted?: boolean;
  onRemove?: (contest: RecommendedContest) => void;
  openDetailOnClick?: boolean;
  removable?: boolean;
}) {
  const { isClickable, openContestDetail, openContestDetailByKeyboard } =
    useContestDetailNavigation(contest, openDetailOnClick);

  return (
    <article
      aria-label={isClickable ? `${contest.title} 상세정보 보기` : undefined}
      className={`relative flex h-[97px] w-full items-center gap-[6px] rounded-[10px] p-2 text-left ${
        muted ? "bg-color-gray-350 opacity-70" : highlight ? "bg-color-orange-50" : "bg-white"
      } ${isClickable ? "cursor-pointer" : ""}`}
      onClick={isClickable ? openContestDetail : undefined}
      onKeyDown={isClickable ? openContestDetailByKeyboard : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <ContestPoster contest={contest} />
      <ContestSummary contest={contest} reserveActionSpace={removable} />
      {removable && onRemove ? (
        <button
          aria-label={`${contest.title} 후보 삭제`}
          className="absolute top-1/2 right-2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(97,97,97,0.10)] text-[20px] leading-none text-color-gray-850"
          onClick={(event) => {
            stopCardActionPropagation(event);
            onRemove(contest);
          }}
          onKeyDown={stopCardActionKeyDownPropagation}
          type="button"
        >
          횞
        </button>
      ) : null}
      {removable ? (
        <span className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(97,97,97,0.10)] text-[20px] leading-none text-color-gray-850">
          ×
        </span>
      ) : null}
    </article>
  );
}

function VotePageContestRow({
  contest,
  isSelected,
  onClick,
}: {
  contest: RecommendedContest;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="flex w-full items-center justify-between outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      onClick={onClick}
      type="button"
    >
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          isSelected
            ? "border-color-coral-500 bg-color-coral-500"
            : "border-[rgba(97,97,97,0.22)] bg-white"
        }`}
      >
        {isSelected ? <span className="size-2 rounded-full bg-white" /> : null}
      </span>
      <div className="w-[290px]">
        <CompactContestListItem
          contest={contest}
          highlight={isSelected}
          openDetailOnClick={false}
        />
      </div>
    </button>
  );
}

function CompleteVoteContestRow({
  contest,
  countLabel,
  isSelected,
  percent,
}: {
  contest: RecommendedContest;
  countLabel: string;
  isSelected: boolean;
  percent: number;
}) {
  return (
    <div className="flex min-w-0 w-full flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <span
          className={`flex size-6 shrink-0 items-center justify-center text-[24px] leading-none text-color-coral-500 ${
            isSelected ? "" : "invisible"
          }`}
        >
          ✓
        </span>
        <div className="w-[290px]">
          <CompactContestListItem contest={contest} highlight={isSelected} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6 text-center text-[12px] leading-[1.35] font-semibold text-color-gray-650">
          {countLabel}
        </span>
        <div className="h-1.5 min-w-0 flex-1 rounded-[90px] bg-[#d9d9d9]">
          <div
            className="h-full rounded-[90px] bg-color-orange-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ResultContestRow({
  contest,
  countLabel,
  isWinner,
  percent,
}: {
  contest: RecommendedContest;
  countLabel: string;
  isWinner: boolean;
  percent: number;
}) {
  return (
    <>
      <div className="flex w-full items-center justify-between">
        <span className="flex size-6 items-center justify-center text-[24px] leading-none text-color-gray-650">
          {isWinner ? "✓" : ""}
        </span>
        <div className="w-[290px]">
          <CompactContestListItem contest={contest} highlight={isWinner} muted={!isWinner} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6 text-center text-[12px] leading-[1.35] font-semibold text-color-gray-650">
          {countLabel}
        </span>
        <div className="h-1.5 w-[288px] rounded-[90px] bg-[#d9d9d9]">
          <div
            className="h-full rounded-[90px] bg-color-orange-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </>
  );
}

function ContestSharedCard({
  contest,
  isAdded,
  onAdd,
}: {
  contest: RecommendedContest;
  isAdded: boolean;
  onAdd: () => void;
}) {
  const { isClickable, openContestDetail, openContestDetailByKeyboard } =
    useContestDetailNavigation(contest);

  return (
    <div
      aria-label={isClickable ? `${contest.title} 상세정보 보기` : undefined}
      className={`relative h-[97px] w-[304px] overflow-hidden rounded-[10px] bg-color-gray-200 p-2 text-left ${
        isClickable ? "cursor-pointer" : ""
      }`}
      onClick={isClickable ? openContestDetail : undefined}
      onKeyDown={isClickable ? openContestDetailByKeyboard : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex h-[77px] w-full min-w-0 items-center gap-[6px] pr-[38px]">
        <ContestPoster contest={contest} />
        <div
          className="flex min-w-0 flex-1 flex-col gap-1"
          style={{ width: "100%", maxWidth: "100%" }}
        >
          <span className="block min-w-0 truncate text-[12px] leading-[1.35] font-semibold text-color-coral-700">
            {contest.category}
          </span>
          <strong
            className="block min-w-0 text-[12px] leading-[1.35] font-semibold text-color-gray-850"
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {truncateSharedCardText(contest.title, 20)}
          </strong>
          <span className="block min-w-0 truncate text-[12px] leading-[1.35] font-normal text-color-gray-650">
            {contest.organizer}
          </span>
          <div className="flex min-w-0 items-center gap-2 text-[12px] leading-[1.35] font-semibold text-color-gray-350">
            {contest.dday ? (
              <span className="shrink-0 rounded-[85px] bg-color-coral-500 px-2 py-1 text-[8px] leading-[1.35] text-white">
                {contest.dday}
              </span>
            ) : null}
            <ViewCount value={contest.viewCount} />
          </div>
        </div>
      </div>
      <button
        aria-label={`${contest.title} 후보 추가`}
        className="absolute top-2 right-2 flex size-8 items-center justify-center overflow-hidden rounded-[12px] bg-color-coral-900"
        disabled={isAdded}
        onClick={(event) => {
          stopCardActionPropagation(event);
          onAdd();
        }}
        onKeyDown={stopCardActionKeyDownPropagation}
        type="button"
      >
        <Image
          src="/icons/chat/contest_plus.svg"
          alt=""
          aria-hidden="true"
          width={16}
          height={16}
          className="size-4"
        />
      </button>
    </div>
  );
}

function FullContestListItem({
  contest,
  disabled = false,
  onRemove,
}: {
  contest: RecommendedContest;
  disabled?: boolean;
  onRemove?: (contest: RecommendedContest) => void;
}) {
  const { isClickable, openContestDetail, openContestDetailByKeyboard } =
    useContestDetailNavigation(contest);

  return (
    <article
      aria-label={isClickable ? `${contest.title} 상세정보 보기` : undefined}
      className={`flex w-full border-b border-color-gray-250 bg-white py-2 pr-2 pl-4 ${
        isClickable ? "cursor-pointer" : ""
      }`}
      onClick={isClickable ? openContestDetail : undefined}
      onKeyDown={isClickable ? openContestDetailByKeyboard : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex min-w-0 flex-1 items-center gap-[14px]">
        <LargeContestPosterImage src={contest.imageSrc} />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[12px] leading-[1.35] font-semibold text-color-coral-700">
            {contest.category}
          </span>
          <strong className="mt-1 block max-w-full truncate text-[17px] leading-[1.35] font-bold text-color-gray-850">
            {contest.title}
          </strong>
          <span className="mt-1 block truncate text-[13px] leading-[1.25] font-medium text-color-gray-650">
            {contest.organizer}
          </span>
          <div className="mt-2 flex items-center gap-2 text-[12px] leading-[1.35] font-semibold text-color-gray-350">
            <span className="rounded-[85px] bg-color-coral-500 px-2 py-1 text-white">
              {contest.dday}
            </span>
            <ViewCount value={contest.viewCount} />
          </div>
        </div>
      </div>
      <button
        aria-label={`${contest.title} 후보 삭제`}
        className="flex size-[38px] shrink-0 items-center justify-center rounded-[14px] text-[24px] leading-none text-color-gray-650 disabled:opacity-50"
        disabled={disabled || !onRemove}
        onClick={(event) => {
          stopCardActionPropagation(event);
          onRemove?.(contest);
        }}
        onKeyDown={stopCardActionKeyDownPropagation}
        type="button"
      >
        ×
      </button>
    </article>
  );
}

function ContestSummary({
  contest,
  titleClassName,
  titleMaxWidthClassName = "",
  reserveActionSpace = false,
}: {
  contest: RecommendedContest;
  titleClassName?: string;
  titleMaxWidthClassName?: string;
  reserveActionSpace?: boolean;
}) {
  return (
    <div
      className={`flex h-[75px] min-w-0 w-[162px] max-w-[162px] flex-1 flex-col items-start justify-center gap-1 ${
        reserveActionSpace ? "pr-8" : ""
      }`}
    >
      <span className="block truncate text-[12px] leading-[1.35] font-semibold text-color-coral-700">
        {contest.category}
      </span>
      <strong
        className={`block w-full min-w-0 overflow-hidden text-ellipsis text-[12px] leading-[1.35] font-semibold text-color-gray-850 ${
          titleClassName ?? "whitespace-nowrap"
        } ${titleMaxWidthClassName}`}
      >
        {contest.title}
      </strong>
      <span className="block truncate text-[12px] leading-[1.35] text-color-gray-650">
        {contest.organizer}
      </span>
      <div className="flex items-center gap-2 text-[12px] leading-[1.35] font-semibold text-color-gray-350">
        {contest.dday ? (
          <span className="rounded-[85px] bg-color-coral-500 px-2 py-1 text-[8px] leading-[1.35] text-white">
            {contest.dday}
          </span>
        ) : null}
        <ViewCount value={contest.viewCount} />
      </div>
    </div>
  );
}

function ContestPoster({ contest }: { contest: RecommendedContest }) {
  const [hasError, setHasError] = useState(false);

  if (!contest.imageSrc || hasError) {
    return <div aria-hidden="true" className="h-[77px] w-[58px] shrink-0 bg-white" />;
  }

  return (
    <div className="relative h-[77px] w-[58px] shrink-0 overflow-hidden bg-white">
      <Image
        src={contest.imageSrc}
        alt=""
        fill
        sizes="58px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function LargeContestPosterImage({ src }: { src?: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <div aria-hidden="true" className="h-[113px] w-[85px] shrink-0 bg-white" />;
  }

  return (
    <div className="relative h-[113px] w-[85px] shrink-0 overflow-hidden bg-white">
      <Image
        src={src}
        alt=""
        fill
        sizes="85px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function ViewCount({ value }: { value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-0.5">
      <Image src="/icons/chat/tabler_eye-filled.svg" alt="" width={16} height={16} />
      <span className="truncate">{value}</span>
    </span>
  );
}

function truncateSharedCardText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

function SmallTimer({
  compact = false,
  label,
  remainingSeconds = fallbackVoteRemainingSeconds,
}: {
  compact?: boolean;
  label: string;
  remainingSeconds?: number;
}) {
  if (compact) {
    return (
      <span className="flex w-[125px] shrink-0 items-center justify-center rounded-[16px] bg-color-mauve-brown-10 px-2 py-1 text-[8px] leading-[1.35] font-semibold text-color-coral-700">
        {label} {formatCandidateTimer(remainingSeconds)}
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center rounded-[16px] bg-color-coral-50 px-2 py-1 text-[12px] leading-[1.35] font-semibold text-color-coral-700">
      {label} {formatCandidateTimer(remainingSeconds)}
    </span>
  );
}

function VoteTimerPanel({
  isEnded,
  label,
  remainingSeconds,
}: {
  isEnded: boolean;
  label: string;
  remainingSeconds: number;
}) {
  return (
    <section className="relative mx-4 mt-2 flex shrink-0 flex-col items-center gap-2 overflow-hidden rounded-[16px] bg-color-khaki-50 p-4">
      <span className="rounded-[10px] bg-color-coral-900 px-2 py-[5px] text-[13px] leading-[1.25] font-semibold text-white">
        {label}
      </span>
      <LargeCountdown remainingSeconds={isEnded ? 0 : remainingSeconds} />
      {isEnded ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[16px] bg-[rgba(217,217,217,0.55)] backdrop-blur-[0.25px]"
        />
      ) : null}
    </section>
  );
}

function LargeCountdown({ remainingSeconds }: { remainingSeconds: number }) {
  const values = formatCandidateTimer(remainingSeconds).split("");

  return (
    <div className="flex h-[49px] items-center justify-center gap-1">
      {values.map((value, index) =>
        value === " " ? null : value === ":" ? (
          <span
            className="text-[22px] leading-[1.35] font-bold text-[rgba(97,97,97,0.6)]"
            key={`${value}-${index}`}
          >
            :
          </span>
        ) : (
          <span
            className="flex min-w-[43px] items-center justify-center rounded-[5px] bg-white px-3 py-1 text-[30px] leading-[1.35] font-bold text-color-coral-900 shadow-[0_5px_1px_rgba(0,0,0,0),0_3px_1px_rgba(0,0,0,0.01),0_2px_1px_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.09)]"
            key={`${value}-${index}`}
          >
            {value}
          </span>
        ),
      )}
    </div>
  );
}

function createVoteResultMap(voteResults: ContestVoteResultItem[] | undefined) {
  const voteResultByContestId = new Map<string, ContestVoteResultItem>();

  voteResults?.forEach((result) => {
    if (result.contestCandidateId !== undefined) {
      voteResultByContestId.set(`candidate:${result.contestCandidateId}`, result);
    }

    if (result.contestId !== undefined) {
      voteResultByContestId.set(`contest:${result.contestId}`, result);
    }
  });

  return voteResultByContestId;
}

function getVoteResultForContest(
  voteResultByContestId: Map<string, ContestVoteResultItem>,
  contest: RecommendedContest,
) {
  if (contest.contestCandidateId !== undefined) {
    const candidateResult = voteResultByContestId.get(`candidate:${contest.contestCandidateId}`);

    if (candidateResult) {
      return candidateResult;
    }
  }

  if (contest.contestId !== undefined) {
    return voteResultByContestId.get(`contest:${contest.contestId}`);
  }

  return undefined;
}

function getVoteResultCountLabel(
  result: ContestVoteResultItem | undefined,
  fallbackIndex: number,
  hasSuppliedVoteResults: boolean,
) {
  if (result) {
    return `${result.voteCount.toLocaleString("ko-KR")}명`;
  }

  if (hasSuppliedVoteResults) {
    return "0명";
  }

  return fallbackIndex < 2 ? "1명" : "0명";
}

function getVoteResultPercent(
  result: ContestVoteResultItem | undefined,
  participantCount: number | undefined,
  fallbackPercent: number,
) {
  if (!result) {
    return fallbackPercent;
  }

  if (result.percent > 0) {
    return Math.min(100, result.percent);
  }

  if (participantCount && participantCount > 0) {
    return Math.min(100, Math.round((result.voteCount / participantCount) * 100));
  }

  return result.voteCount > 0 ? 100 : 0;
}

function ContestPopup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex w-[358px] rounded-[16px] bg-white ${popoverShadow} ${className}`}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </section>
  );
}

function ContestStatePopup({
  buttonDisabled = false,
  buttonLabel,
  description,
  iconSrc,
  onButtonClick,
  participantLabel,
  remainingSeconds = fallbackVoteRemainingSeconds,
  timer = false,
  title,
}: {
  buttonDisabled?: boolean;
  buttonLabel: string;
  description: string;
  iconSrc: string;
  onButtonClick: () => void;
  participantLabel?: string;
  remainingSeconds?: number;
  timer?: boolean;
  title: string;
}) {
  return (
    <ContestPopup className="h-[546px] flex-col items-center justify-center gap-4 p-4">
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Image src={iconSrc} alt="" width={48} height={48} />
          <h2 className="text-center text-[26px] leading-[1.35] font-bold text-color-coral-500">
            {title}
          </h2>
          <p className="whitespace-pre-line text-center text-[13px] leading-[1.25] font-medium text-color-coral-500">
            {description}
          </p>
          {participantLabel ? (
            <span className="text-center text-[13px] leading-[1.25] font-medium text-color-gray-500">
              {participantLabel}
            </span>
          ) : null}
          {timer ? (
            <span className="rounded-[16px] bg-color-gray-150 px-3 py-2 text-[15px] leading-[1.25] font-semibold text-color-gray-650">
              투표 마감까지 {formatCandidateTimer(remainingSeconds)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex h-[60px] w-full px-2 py-1">
        <button
          className="flex flex-1 items-center justify-center rounded-[12px] bg-color-coral-500 text-[15px] leading-[1.25] font-semibold text-white disabled:bg-color-gray-200 disabled:text-color-gray-350"
          disabled={buttonDisabled}
          onClick={onButtonClick}
          type="button"
        >
          {buttonLabel}
        </button>
      </div>
    </ContestPopup>
  );
}
