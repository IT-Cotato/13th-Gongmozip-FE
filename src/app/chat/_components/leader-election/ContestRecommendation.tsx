"use client";

import Image from "next/image";
import { useState } from "react";

import type { ContestVoteResultItem } from "@/queries/useChatQueries";
import type { ContestSummary } from "@/app/contests/_types";

import { ChatbotAvatar, ChatbotUsageGuideMessage, MessageMeta } from "./ChatbotMessage";
import type { RecommendedContest } from "./types";

const fallbackVoteRemainingSeconds = 2 * 60 * 60;
const popoverShadow =
  "shadow-[0_53px_15px_rgba(0,0,0,0),0_34px_14px_rgba(0,0,0,0.01),0_19px_12px_rgba(0,0,0,0.05),0_9px_9px_rgba(0,0,0,0.09),0_2px_5px_rgba(0,0,0,0.10)]";

function formatCandidateTimer(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const restSeconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `00 : ${minutes} : ${restSeconds}`;
}

export function ContestRecommendationMessage({
  contests,
  isActionDisabled = false,
  isCandidateClosed,
  onRemove,
  onShowAll,
  onStartVote,
  remainingSeconds,
  sentAt,
}: {
  contests: RecommendedContest[];
  isActionDisabled?: boolean;
  isCandidateClosed: boolean;
  onRemove?: (contest: RecommendedContest) => void;
  onShowAll: () => void;
  onStartVote: () => void;
  remainingSeconds: number;
  sentAt?: string;
}) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex w-[304px] min-w-0 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {isCandidateClosed
              ? "이제 함께 나갈 공모전을 투표해볼게요.\n원하는 공모전 2개를 선택해주세요."
              : `팀장 선출까지 마쳤으면, 팀원들과 함께 나갈 공모전을 선택해보아요. 현재 팀의 카테고리가 기획/아이디어이기 때문에 저는 이러한 공모전을 추천드려요.
더 원하는 공모전이 있으면 오늘 오후 11시 내로 리스트에 추가해주세요.`}
          </p>
          <MessageMeta sentAt={sentAt} />
        </div>
        <ContestListCard
          actionLabel={isCandidateClosed ? "공모전 투표하기" : "다른 공모전 보러가기"}
          contests={contests}
          disabled={isActionDisabled}
          isCandidateClosed={isCandidateClosed}
          onAction={onStartVote}
          onRemove={onRemove}
          onShowAll={onShowAll}
          remainingSeconds={remainingSeconds}
          title={isCandidateClosed ? "공모전 후보 리스트" : "추천 공모전 리스트"}
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
                className="flex w-full border-b border-color-gray-250 bg-white py-2 pr-2 pl-4"
                key={contest.id}
              >
                <div className="flex min-w-0 flex-1 items-center gap-[14px]">
                  <div className="relative h-[113px] w-[85px] shrink-0 overflow-hidden bg-color-gray-250">
                    {contest.posterImageUrl ? (
                      <Image
                        src={contest.posterImageUrl}
                        alt=""
                        fill
                        sizes="85px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] leading-[1.35] font-semibold text-color-coral-700">
                      {contest.category}
                    </span>
                    <strong className="mt-1 block text-[17px] leading-[1.35] font-bold text-color-gray-850 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
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
                  onClick={() => onAdd(contest)}
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
  contest,
  isAdded,
  onAdd,
  sentAt,
}: {
  contest: RecommendedContest;
  isAdded: boolean;
  onAdd: () => void;
  sentAt?: string;
}) {
  return (
    <article className="flex w-full justify-end">
      <div className="flex max-w-[304px] flex-col items-end gap-1">
        <ContestSharedCard contest={contest} isAdded={isAdded} onAdd={onAdd} />
        <div className="flex items-end gap-2 text-[12px] leading-[1.35]">
          <span className="text-color-gray-650">{sentAt ?? "오후 8:28"}</span>
          <span className="text-color-coral-500">1</span>
        </div>
        <p className="rounded-[16px] rounded-tr-none bg-color-coral-50 px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
          이거 어때요?
        </p>
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
  const isButtonDisabled = !isVoteSubmitted && isActionDisabled;

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
              ? "bg-color-gray-200 text-color-gray-350"
              : isVoteSubmitted
              ? "bg-[rgba(97,97,97,0.10)] text-color-gray-650"
              : "bg-color-gray-650 text-white"
          }`}
          disabled={isButtonDisabled}
          onClick={onAction}
          type="button"
        >
          {isVoteSubmitted ? "결과 확인하기" : "투표하기"}
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

export function ContestVoteResultMessage({
  contest,
  onMidtermSubmit,
  onUseChatbot,
  sentAt,
}: {
  contest: RecommendedContest;
  onMidtermSubmit: (progressPercent: number) => void;
  onUseChatbot?: () => void;
  sentAt?: string;
}) {
  const [midtermProgress, setMidtermProgress] = useState(0);

  const submitMidtermCheck = (value: number) => {
    setMidtermProgress(value);

    if (value > 0) {
      onMidtermSubmit(value);
    }
  };

  return (
    <>
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
          <div className="mt-1 w-[290px] rounded-[10px] bg-color-orange-50">
            <CompactContestListItem contest={contest} />
          </div>
        </div>
      </article>

      <article className="flex w-full items-start gap-2">
        <ChatbotAvatar />

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
          <div className="flex w-full items-end gap-2">
            <p className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
              {`언제든 저의 도움이 필요하면
태그해주세요.`}
            </p>
            <MessageMeta sentAt={sentAt} />
          </div>
        </div>
      </article>

      <ChatbotUsageGuideMessage onUseChatbot={onUseChatbot} sentAt={sentAt} />

      <div className="flex w-full items-center gap-1 text-[9px] leading-[1.35] text-color-gray-650">
        <span className="h-px min-w-0 flex-1 bg-color-gray-200" />
        <span className="shrink-0">오늘 오후 2:30</span>
        <span className="h-px min-w-0 flex-1 bg-color-gray-200" />
      </div>

      <article className="flex w-full items-start gap-2">
        <ChatbotAvatar />

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
          <div className="flex w-full items-end gap-2">
            <p className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
              {`팀원들과 회의를 잘 진행하고 있나요?
현재 진행률을 체크해주세요 :)
진행률 체크는 팀장님만 할 수 있습니다.`}
            </p>
            <MessageMeta sentAt={sentAt} />
          </div>
          <div className="relative mt-1 h-[23px] w-[230px] overflow-hidden rounded-[40px] bg-color-gray-200">
            <div
              className="absolute inset-y-0 left-0 rounded-[40px] bg-[linear-gradient(45deg,#FF7658_0%,#FFAD62_100%)]"
              style={{ width: midtermProgress > 0 ? `${midtermProgress}%` : "26px" }}
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] leading-[1.35] font-semibold text-color-gray-500">
              드래그 해주세요
            </span>
            <input
              aria-label="중간점검 진행률"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              max={100}
              min={0}
              onChange={(event) => submitMidtermCheck(Number(event.target.value))}
              type="range"
              value={midtermProgress}
            />
          </div>
        </div>
      </article>

    </>
  );
}

export function ContestVoteSheet({
  contests,
  disabled = false,
  onSubmit,
  onToggle,
  remainingSeconds = fallbackVoteRemainingSeconds,
  selectedContestIds,
}: {
  contests: RecommendedContest[];
  disabled?: boolean;
  onSubmit: () => void;
  onToggle: (contestId: string) => void;
  remainingSeconds?: number;
  selectedContestIds: string[];
}) {
  return (
    <ContestPopup className="min-h-[488px] flex-col items-end gap-4 p-4">
      <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-0.5 text-[17px] leading-[1.35] font-semibold text-color-coral-500">
              <Image src="/icons/chat/vote_1.svg" alt="" width={24} height={24} />
              <h2>공모전 투표</h2>
            </div>
            <span className="px-1 text-[13px] leading-[1.25] font-medium text-color-gray-500">
              2명 참여중..
            </span>
          </div>
          <SmallTimer label="투표 마감까지" remainingSeconds={remainingSeconds} />
        </div>

        {contests.length > 0 ? (
          <div className="flex flex-col gap-4">
            {contests.slice(0, 3).map((contest) => (
              <VoteContestRow
                contest={contest}
                isSelected={selectedContestIds.includes(contest.id)}
                key={contest.id}
                onClick={() => onToggle(contest.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <p className="text-[13px] leading-[1.5] text-color-gray-650">
              투표할 후보 공모전이 없습니다.
            </p>
          </div>
        )}
      </div>

      <div className="flex h-[60px] w-full shrink-0 px-2 py-1">
        <button
          className="flex flex-1 items-center justify-center rounded-[12px] bg-color-coral-500 text-[15px] leading-[1.25] font-semibold text-white disabled:bg-color-gray-200 disabled:text-color-gray-350"
          disabled={disabled || contests.length === 0 || selectedContestIds.length === 0}
          onClick={onSubmit}
          type="button"
        >
          완료
        </button>
      </div>
    </ContestPopup>
  );
}

export function ContestVoteCompleteSheet({
  isResultReady,
  onShowResult,
  remainingSeconds = fallbackVoteRemainingSeconds,
}: {
  isResultReady: boolean;
  onShowResult: () => void;
  remainingSeconds?: number;
}) {
  return (
    <ContestStatePopup
      buttonDisabled={!isResultReady}
      buttonLabel="결과 확인하기"
      description="투표 결과를 확인하고 있습니다."
      iconSrc="/icons/chat/vote_1.svg"
      onButtonClick={onShowResult}
      remainingSeconds={remainingSeconds}
      timer
      title="투표 완료"
    />
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
    participantCount === undefined ? undefined : `${participantCount.toLocaleString("ko-KR")}명 참여`;

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
    participantCount === undefined ? "0명 참여" : `${participantCount.toLocaleString("ko-KR")}명 참여`;

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
          <SmallTimer compact label="투표 마감까지" />
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
                  percent={voteResult?.percent ?? (!hasSuppliedVoteResults && index < 2 ? 28 : 0)}
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
  actionLabel,
  contests,
  disabled = false,
  isCandidateClosed,
  onAction,
  onRemove,
  onShowAll,
  remainingSeconds,
  title,
}: {
  actionLabel: string;
  contests: RecommendedContest[];
  disabled?: boolean;
  isCandidateClosed: boolean;
  onAction: () => void;
  onRemove?: (contest: RecommendedContest) => void;
  onShowAll: () => void;
  remainingSeconds: number;
  title: string;
}) {
  return (
    <div className="mt-1 w-[304px] rounded-[16px] bg-color-gray-200 px-3 py-4">
      <ContestCardHeader remainingSeconds={remainingSeconds} title={title} />

      <div className="mt-4 flex flex-col gap-3">
        {contests.slice(0, 3).map((contest, index) => (
          <CompactContestListItem
            contest={contest}
            key={contest.id}
            onRemove={onRemove}
            removable={index > 0 && !contest.isRecommended}
          />
        ))}
      </div>

      <button
        className="mx-auto mt-4 flex h-7 items-center justify-center px-0.5 text-[13px] leading-[1.25] font-medium text-color-gray-650 underline underline-offset-2"
        onClick={onShowAll}
        type="button"
      >
        전체보기
      </button>
      <button
        className={`mt-4 flex h-9 w-full items-center justify-center gap-1 rounded-[10px] px-3 text-[13px] leading-[1.25] font-semibold ${
          disabled ? "bg-color-gray-200 text-color-gray-350" : "bg-color-coral-500 text-white"
        }`}
        disabled={disabled}
        onClick={onAction}
        type="button"
      >
        <Image
          src={isCandidateClosed ? "/icons/chat/vote_2_1.svg" : "/icons/chat/vote_1_1.svg"}
          alt=""
          width={18}
          height={18}
        />
        {actionLabel}
      </button>
    </div>
  );
}

function ContestCardHeader({
  remainingSeconds,
  title,
}: {
  remainingSeconds: number;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 shrink-0 items-center gap-[7px] text-[13px] leading-[1.25] font-semibold text-color-coral-900">
        <Image src="/icons/chat/tabler_list.svg" alt="" width={24} height={24} />
        <span className="whitespace-nowrap">{title}</span>
      </div>
      <span className="flex shrink-0 items-center rounded-[16px] bg-color-coral-50 px-2 py-1 text-[12px] leading-[1.35] font-semibold text-color-coral-700">
        후보 마감까지 {formatCandidateTimer(remainingSeconds)}
      </span>
    </div>
  );
}

function CompactContestListItem({
  contest,
  highlight = false,
  muted = false,
  onRemove,
  removable = false,
}: {
  contest: RecommendedContest;
  highlight?: boolean;
  muted?: boolean;
  onRemove?: (contest: RecommendedContest) => void;
  removable?: boolean;
}) {
  return (
    <article
      className={`relative flex h-[97px] w-full items-center gap-[6px] rounded-[10px] p-2 text-left ${
        muted
          ? "bg-color-gray-350 opacity-70"
          : highlight
            ? "border-[3px] border-color-coral-500 bg-color-orange-50"
            : "bg-white"
      }`}
    >
      <ContestPoster contest={contest} />
      <ContestSummary contest={contest} reserveActionSpace={removable} />
      {removable && onRemove ? (
        <button
          aria-label={`${contest.title} 후보 삭제`}
          className="absolute top-1/2 right-2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(97,97,97,0.10)] text-[20px] leading-none text-color-gray-850"
          onClick={() => onRemove(contest)}
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

function VoteContestRow({
  contest,
  isSelected,
  onClick,
}: {
  contest: RecommendedContest;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button className="flex w-full items-center justify-between" onClick={onClick} type="button">
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          isSelected
            ? "border-color-coral-500 bg-color-coral-500"
            : "border-[rgba(97,97,97,0.22)] bg-white"
        }`}
      >
        {isSelected ? <span className="size-1.5 rounded-full bg-white" /> : null}
      </span>
      <div className="w-[290px]">
        <CompactContestListItem contest={contest} highlight={isSelected} />
      </div>
    </button>
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
  return (
    <div className="flex min-h-[97px] w-[230px] gap-[6px] rounded-[10px] bg-white p-2 text-left">
      <ContestPoster contest={contest} />
      <ContestSummary contest={contest} />
      <button
        aria-label={`${contest.title} 후보 추가`}
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[18px] leading-none font-semibold ${
          isAdded ? "bg-color-gray-200 text-color-gray-350" : "bg-[#6A2A19] text-white"
        }`}
        disabled={isAdded}
        onClick={onAdd}
        type="button"
      >
        {isAdded ? "✓" : "+"}
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
  return (
    <article className="flex w-full border-b border-color-gray-250 bg-white py-2 pr-2 pl-4">
      <div className="flex min-w-0 flex-1 items-center gap-[14px]">
        <div className="relative h-[113px] w-[85px] shrink-0 overflow-hidden bg-color-gray-250">
          {contest.imageSrc ? (
            <Image src={contest.imageSrc} alt="" fill sizes="85px" className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[12px] leading-[1.35] font-semibold text-color-coral-700">
            {contest.category}
          </span>
          <strong className="mt-1 block text-[17px] leading-[1.35] font-bold text-color-gray-850 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
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
        onClick={() => onRemove?.(contest)}
        type="button"
      >
        ×
      </button>
    </article>
  );
}

function ContestSummary({
  contest,
  reserveActionSpace = false,
}: {
  contest: RecommendedContest;
  reserveActionSpace?: boolean;
}) {
  return (
    <div className={`min-w-0 flex-1 ${reserveActionSpace ? "pr-8" : ""}`}>
      <span className="block truncate text-[8px] leading-[1.35] font-semibold text-color-coral-700">
        {contest.category}
      </span>
      <strong className="mt-1 block text-[12px] leading-[1.35] font-semibold text-color-gray-850 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
        {contest.title}
      </strong>
      <span className="mt-1 block truncate text-[12px] leading-[1.35] text-color-gray-650">
        {contest.organizer}
      </span>
      <div className="mt-2 flex items-center gap-2 text-[12px] leading-[1.35] font-semibold text-color-gray-350">
        <span className="rounded-[85px] bg-color-coral-500 px-2 py-1 text-[8px] leading-[1.35] text-white">
          {contest.dday}
        </span>
        <ViewCount value={contest.viewCount} />
      </div>
    </div>
  );
}

function ContestPoster({ contest }: { contest: RecommendedContest }) {
  return (
    <div className="relative h-[77px] w-[58px] shrink-0 overflow-hidden bg-color-gray-200">
      {contest.imageSrc ? (
        <Image src={contest.imageSrc} alt="" fill sizes="58px" className="object-cover" />
      ) : null}
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
