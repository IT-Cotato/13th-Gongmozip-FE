"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ChatTopBar } from "../ChatTopBar";
import {
  MemberReviewAvatar,
  MemberReviewStartDialog,
  MemberReviewStopDialog,
} from "./MemberReviewDialog";
import { memberReviewQuestions, memberReviewStrengths, mockReviewMembers } from "./mock";
import type { MemberReviewAnswer, ReviewMember, ReviewScore } from "./types";

type MemberReviewFlowProps = {
  initialMembers?: ReviewMember[];
  onComplete?: (answers: MemberReviewAnswer[]) => void;
  onLeave?: (answers: MemberReviewAnswer[]) => void;
  reviewerName?: string;
  roomId: string;
};

export function MemberReviewFlow({
  initialMembers = mockReviewMembers,
  onComplete,
  onLeave,
  reviewerName = "김철수",
  roomId,
}: MemberReviewFlowProps) {
  const router = useRouter();
  const reviewMembers = useMemo(
    () => initialMembers.filter((member) => !member.isMe),
    [initialMembers],
  );
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isStopOpen, setIsStopOpen] = useState(false);
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<MemberReviewAnswer[]>([]);
  const [completedMemberIds, setCompletedMemberIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<"reviewing" | "complete">("reviewing");

  const currentMember = currentMemberIndex === null ? undefined : reviewMembers[currentMemberIndex];
  const currentAnswer = answers.find((answer) => answer.memberId === currentMember?.id);
  const isCurrentMemberReviewed = Boolean(
    currentMember && completedMemberIds.includes(currentMember.id),
  );
  const isCurrentComplete =
    Boolean(currentAnswer) &&
    memberReviewQuestions.every((question) => currentAnswer?.scores[question.id]) &&
    Boolean(currentAnswer?.strengths.length);
  const canSubmit = Boolean(currentMember && !isCurrentMemberReviewed && isCurrentComplete);

  const updateCurrentAnswer = (updater: (answer: MemberReviewAnswer) => MemberReviewAnswer) => {
    if (!currentMember) {
      return;
    }

    setAnswers((currentAnswers) => {
      const fallbackAnswer: MemberReviewAnswer = {
        memberId: currentMember.id,
        scores: {},
        strengths: [],
      };
      const existingAnswer =
        currentAnswers.find((answer) => answer.memberId === currentMember.id) ?? fallbackAnswer;
      const nextAnswer = updater(existingAnswer);
      const otherAnswers = currentAnswers.filter((answer) => answer.memberId !== currentMember.id);

      return [...otherAnswers, nextAnswer];
    });
  };

  const selectScore = (questionId: string, score: ReviewScore) => {
    updateCurrentAnswer((answer) => ({
      ...answer,
      scores: {
        ...answer.scores,
        [questionId]: score,
      },
    }));
  };

  const toggleStrength = (strength: string) => {
    updateCurrentAnswer((answer) => {
      const hasStrength = answer.strengths.includes(strength);

      return {
        ...answer,
        strengths: hasStrength
          ? answer.strengths.filter((item) => item !== strength)
          : [...answer.strengths, strength],
      };
    });
  };

  const submitCurrentReview = () => {
    if (!canSubmit || !currentMember) {
      return;
    }

    const nextCompletedMemberIds = completedMemberIds.includes(currentMember.id)
      ? completedMemberIds
      : [...completedMemberIds, currentMember.id];

    setCompletedMemberIds(nextCompletedMemberIds);

    if (nextCompletedMemberIds.length >= reviewMembers.length) {
      setPhase("complete");
      onComplete?.(answers);
    }
  };

  const selectMember = (index: number) => {
    setCurrentMemberIndex(index);
  };

  const leaveReview = () => {
    setIsStopOpen(false);
    onLeave?.(answers);
  };

  const goHome = () => {
    router.push("/");
  };

  if (!reviewMembers.length) {
    return null;
  }

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white pt-[env(safe-area-inset-top)] text-color-gray-850">
      {phase === "complete" ? (
        <MemberReviewCompleteScreen onGoHome={goHome} onLeave={() => onLeave?.(answers)} />
      ) : (
        <>
          <ChatTopBar roomId={roomId} title="팀원 리뷰" />

          <section
            aria-label="팀원 리뷰"
            className="scrollbar-hidden flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-5"
          >
            <p className="text-[12px] leading-[1.35] font-normal text-color-coral-500">
              리뷰할 팀원을 선택해보세요.
            </p>

            <div className="mt-1 flex w-full items-center justify-between">
              {reviewMembers.map((member, index) => {
                const isSelected = index === currentMemberIndex;
                const isReviewed = completedMemberIds.includes(member.id);
                const isFilled = isSelected || isReviewed;

                return (
                  <button
                    className={`relative flex size-[100px] shrink-0 flex-col items-center justify-center gap-2.5 rounded-[16px] px-[22px] pt-3 pb-1.5 ${
                      isFilled
                        ? "bg-[linear-gradient(45deg,#ff7658_0%,#ffad62_100%)] text-white"
                        : "bg-color-gray-150 text-color-gray-400"
                    }`}
                    key={member.id}
                    onClick={() => selectMember(index)}
                    type="button"
                  >
                    <MemberReviewAvatar member={member} size="small" />
                    <span className="w-14 truncate text-center text-[20px] leading-[1.35] font-bold">
                      {member.name}
                    </span>
                    {member.isLeader ? (
                      <Image
                        src="/icons/chat/medal.svg"
                        alt=""
                        aria-hidden="true"
                        width={29}
                        height={29}
                        className="pointer-events-none absolute top-2 left-[69px] size-[29px]"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {currentMember && isCurrentMemberReviewed ? (
              <MemberReviewMemberCompleteScreen member={currentMember} />
            ) : currentMember ? (
              <MemberReviewForm
                currentAnswer={currentAnswer}
                onSelectScore={selectScore}
                onToggleStrength={toggleStrength}
              />
            ) : (
              <MemberReviewEmptyScreen />
            )}
          </section>
        </>
      )}

      {phase === "reviewing" ? (
        <div className="flex gap-2 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2">
          <button
            className="flex h-[51px] flex-1 items-center justify-center rounded-[10px] border border-color-gray-250 bg-white text-[13px] leading-[1.25] font-semibold text-color-gray-650"
            onClick={() => setIsStopOpen(true)}
            type="button"
          >
            나가기
          </button>
          <button
            className={`flex h-[51px] flex-1 items-center justify-center rounded-[10px] text-[13px] leading-[1.25] font-semibold ${
              canSubmit
                ? "bg-color-coral-500 text-white"
                : "bg-color-gray-200 text-color-gray-350"
            }`}
            disabled={!canSubmit}
            onClick={submitCurrentReview}
            type="button"
          >
            제출하기
          </button>
        </div>
      ) : null}

      {phase === "reviewing" && currentMember ? (
        <MemberReviewStartDialog
          member={currentMember}
          onClose={() => setIsStartOpen(false)}
          onStart={() => setIsStartOpen(false)}
          open={isStartOpen}
          reviewerName={reviewerName}
        />
      ) : null}
      <MemberReviewStopDialog
        onCancel={() => setIsStopOpen(false)}
        onLeave={leaveReview}
        open={isStopOpen}
      />
    </main>
  );
}

function MemberReviewForm({
  currentAnswer,
  onSelectScore,
  onToggleStrength,
}: {
  currentAnswer?: MemberReviewAnswer;
  onSelectScore: (questionId: string, score: ReviewScore) => void;
  onToggleStrength: (strength: string) => void;
}) {
  return (
    <div className="mt-6 -mx-4 flex flex-1 flex-col items-center border-t border-[rgba(97,97,97,0.16)] px-[26px] pt-[21px] pb-[14px]">
      <div className="flex w-full flex-col items-center gap-[26px]">
        {memberReviewQuestions.map((question) => (
          <ReviewQuestionField
            key={question.id}
            onSelect={(score) => onSelectScore(question.id, score)}
            question={question}
            selectedScore={currentAnswer?.scores[question.id]}
          />
        ))}

        <div className="flex w-full flex-col items-start gap-1">
          <p className="w-full text-center text-[13px] leading-[1.25] font-semibold text-color-gray-850">
            다음 중 이 팀원을 가장 잘 표현하는 키워드를 선택해주세요.
          </p>
          <p className="w-full text-[12px] leading-[1.35] font-normal text-color-coral-500">
            중복으로 선택가능합니다.
          </p>
        </div>

        <div className="grid w-full grid-cols-[155px_166px] justify-center gap-x-4 gap-y-4">
          {memberReviewStrengths.map((strength, index) => {
            const isSelected = Boolean(currentAnswer?.strengths.includes(strength));

            return (
              <button
                className={`flex h-7 items-center justify-center rounded-[10px] p-2 text-center text-[13px] leading-[1.25] font-semibold ${
                  isSelected
                    ? "bg-color-gray-650 text-white"
                    : "bg-color-gray-200 text-color-gray-350"
                }`}
                key={`${strength}-${index}`}
                onClick={() => onToggleStrength(strength)}
                type="button"
              >
                <Image
                  src={isSelected ? "/icons/chat/check.svg" : "/icons/chat/tabler_plus.svg"}
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className="mr-0.5 size-5 shrink-0"
                />
                {strength}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MemberReviewEmptyScreen() {
  return (
    <div className="mt-6 -mx-4 flex flex-1 flex-col items-center justify-start border-t border-color-gray-250 text-center">
      <div className="relative flex min-h-[486px] w-full flex-1 flex-col items-center overflow-hidden px-5 py-9">
        <Image
          src="/icons/chat/Vector_1.svg"
          alt=""
          aria-hidden="true"
          width={110}
          height={212}
          className="pointer-events-none absolute left-0 top-11"
        />
        <Image
          src="/icons/chat/Vector_2.svg"
          alt=""
          aria-hidden="true"
          width={83}
          height={116}
          className="pointer-events-none absolute left-0 top-[379px]"
        />
        <Image
          src="/icons/chat/Vector_3.svg"
          alt=""
          aria-hidden="true"
          width={235}
          height={279}
          className="pointer-events-none absolute left-[155px] top-[159px]"
        />
        <div className="relative z-10 flex w-full flex-col items-center gap-5">
          <div className="flex w-full flex-col items-center gap-1">
            <p className="text-[17px] leading-[1.5] font-normal text-color-gray-850">
              아직 작성한 팀원 리뷰가 없어요
            </p>
            <p className="text-[13px] leading-[1.5] font-medium text-color-gray-650">
              리뷰할 팀원을 선택해보세요.
            </p>
          </div>
          <Image
            src="/icons/chat/review_1.svg"
            alt=""
            aria-hidden="true"
            width={200}
            height={200}
            className="pointer-events-none size-[200px]"
          />
        </div>
      </div>
    </div>
  );
}

function MemberReviewMemberCompleteScreen({ member }: { member: ReviewMember }) {
  return (
    <div className="mt-6 -mx-4 flex flex-1 flex-col items-center justify-start border-t border-color-gray-250 text-center">
      <div className="relative flex min-h-[486px] w-full flex-1 flex-col items-center overflow-hidden px-5 py-9">
        <Image
          src="/icons/chat/Vector_1.svg"
          alt=""
          aria-hidden="true"
          width={110}
          height={212}
          className="pointer-events-none absolute left-0 top-11"
        />
        <Image
          src="/icons/chat/Vector_2.svg"
          alt=""
          aria-hidden="true"
          width={83}
          height={116}
          className="pointer-events-none absolute left-0 top-[379px]"
        />
        <Image
          src="/icons/chat/Vector_3.svg"
          alt=""
          aria-hidden="true"
          width={235}
          height={279}
          className="pointer-events-none absolute left-[155px] top-[159px]"
        />
        <div className="relative z-10 flex w-full flex-col items-center gap-5">
          <div className="flex w-full flex-col items-center gap-1">
            <p className="text-[17px] leading-[1.5] font-normal text-color-gray-850">
              {member.name} 팀원의 리뷰가 완료되었습니다!
            </p>
            <p className="text-[13px] leading-[1.5] font-medium text-color-gray-650">
              리뷰할 다른 팀원을 선택해보세요.
            </p>
          </div>
          <Image
            src="/icons/chat/review_2.svg"
            alt=""
            aria-hidden="true"
            width={200}
            height={200}
            className="pointer-events-none size-[200px]"
          />
        </div>
      </div>
    </div>
  );
}

function ReviewQuestionField({
  onSelect,
  question,
  selectedScore,
}: {
  onSelect: (score: ReviewScore) => void;
  question: (typeof memberReviewQuestions)[number];
  selectedScore?: ReviewScore;
}) {
  return (
    <fieldset className="w-full">
      <legend className="mb-6 w-full text-center text-[13px] leading-[1.25] font-semibold text-color-gray-850">
        {question.label}
      </legend>
      <div className="flex w-full justify-center">
        <div className="flex w-[229px] items-center gap-[58px]">
          {question.options.map((option) => {
            const isSelected = option.value === selectedScore;

            return (
              <button
                aria-pressed={isSelected}
                className="flex flex-col items-center justify-center gap-2 text-[12px] leading-[1.35] font-normal text-color-gray-500"
                key={option.value}
                onClick={() => onSelect(option.value)}
                type="button"
              >
                <span className="flex size-6 items-center justify-center p-0.5">
                  <span
                    className={`flex size-5 items-center justify-center rounded-full border-[1.5px] ${
                      isSelected
                        ? "border-color-coral-500 bg-color-coral-500"
                        : "border-[rgba(97,97,97,0.22)] bg-white"
                    }`}
                  >
                    {isSelected ? <span className="size-2 rounded-full bg-white" /> : null}
                  </span>
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}

function MemberReviewCompleteScreen({
  onGoHome,
  onLeave,
}: {
  onGoHome: () => void;
  onLeave: () => void;
}) {
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden text-center">
      <div className="pointer-events-none absolute -left-32 top-20 h-[321px] w-[364px] -rotate-[76.82deg] rounded-[48%] bg-[#fffce7]" />
      <div className="pointer-events-none absolute left-[calc(40%+48px)] top-[368px] h-[321px] w-[364px] -rotate-[76.82deg] rounded-[48%] bg-[#fff6f1]" />

      <div className="relative z-10 mt-[163px] flex w-full flex-col items-center px-[30px]">
        <Image
          src="/icons/chat/review_3.svg"
          alt=""
          aria-hidden="true"
          width={330}
          height={228}
          className="pointer-events-none h-[228px] w-[330px]"
          priority
        />
        <div className="mt-4 flex w-full flex-col items-center gap-4">
          <h2 className="w-full text-[22px] leading-[1.35] font-bold text-color-gray-850">
            팀원 리뷰를 완료하여
            <br />
            협업거리가 10m 더 늘었어요 !
          </h2>
          <p className="text-[17px] leading-[1.35] font-medium text-color-gray-650">
            프로젝트 완주하느라 고생했어요.
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex w-full flex-col gap-2.5 bg-gradient-to-t from-white from-[38.46%] to-white/0 px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <button
          className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[rgba(97,97,97,0.1)] text-[17px] leading-[1.25] font-semibold text-color-gray-650"
          onClick={onLeave}
          type="button"
        >
          나가기
        </button>
        <button
          className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-color-coral-500 text-[17px] leading-[1.25] font-semibold text-white"
          onClick={onGoHome}
          type="button"
        >
          홈화면 바로가기
        </button>
      </div>
    </section>
  );
}
