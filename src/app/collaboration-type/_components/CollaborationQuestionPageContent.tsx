"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import { ApiError } from "@/lib/http";
import { useSurveyQuestionsQuery } from "@/queries/useSurveyQuestionsQuery";

import CollaborationQuestionForm from "./CollaborationQuestionForm";
import CollaborationTestLeaveModal from "./CollaborationTestLeaveModal";

type CollaborationQuestionPageContentProps = {
  currentQuestionOrder: number;
};

const DEFAULT_SURVEY_QUESTION_COUNT = 15;

export default function CollaborationQuestionPageContent({
  currentQuestionOrder,
}: CollaborationQuestionPageContentProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const { data: questions = [], error, isError, isPending } = useSurveyQuestionsQuery();
  const totalQuestionCount = questions.length;
  const question = questions[currentQuestionOrder - 1];
  const sortedOptions = useMemo(
    () =>
      question
        ? [...question.options].sort((currentOption, nextOption) => {
            return currentOption.displayOrder - nextOption.displayOrder;
          })
        : [],
    [question],
  );
  const progressTotalQuestionCount = totalQuestionCount || DEFAULT_SURVEY_QUESTION_COUNT;
  const progressCurrentQuestionOrder = Math.min(
    currentQuestionOrder,
    progressTotalQuestionCount,
  );
  const nextHref =
    currentQuestionOrder >= totalQuestionCount
      ? "/collaboration-type/result-loading"
      : `/collaboration-type/questions/${currentQuestionOrder + 1}`;
  const previousHref =
    currentQuestionOrder <= 1
      ? "/collaboration-type"
      : `/collaboration-type/questions/${currentQuestionOrder - 1}`;
  const progressWidth =
    progressTotalQuestionCount > 0
      ? Math.min(
          322,
          Math.round((progressCurrentQuestionOrder / progressTotalQuestionCount) * 322),
        )
      : 0;
  const isUnauthorized = error instanceof ApiError && error.status === 401;

  return (
    <>
      <TeamMatchingHeader
        className="bg-[#F9F8F4]"
        onBackClick={() => setIsLeaveModalOpen(true)}
        title="협업 유형 검사"
      />

      <div className="relative mx-auto mt-[34px] flex h-[6px] w-[322px] max-w-[calc(100%-32px)] flex-col items-start gap-[10px] rounded-[90px] bg-[#D9D9D9]">
        <div
          className="h-[6px] shrink-0 rounded-[90px] bg-[#FFAD62]"
          style={{ width: `${progressWidth}px` }}
        />
        <p className="absolute bottom-[-16px] right-0 text-right font-[Pretendard] text-[12px] font-semibold leading-[135%]">
          <span className="text-[#FF7658]">{progressCurrentQuestionOrder}</span>
          <span className="text-[#C8C8C8]">/{progressTotalQuestionCount}</span>
        </p>
      </div>

      <section className="mt-[36px] flex flex-col px-[18px]">
        {isPending && (
          <div className="flex h-[531px] flex-col items-center justify-center self-stretch rounded-2xl bg-white px-6 text-center font-[Pretendard] text-[15px] font-semibold leading-[150%] text-[#616161]">
            <p>질문을 불러오는 중입니다.</p>
          </div>
        )}

        {isError && (
          <div className="flex h-[531px] flex-col items-center justify-center self-stretch rounded-2xl bg-white px-6 text-center font-[Pretendard] text-[15px] font-semibold leading-[150%] text-[#616161]">
            <p>
              {isUnauthorized
                ? "로그인이 필요한 검사입니다."
                : "질문 목록을 불러오지 못했습니다."}
            </p>
            <Link
              className="mt-5 flex h-10 items-center rounded-[14px] bg-[#FF7658] px-5 text-[15px] font-semibold text-white"
              href={isUnauthorized ? "/login/email" : "/collaboration-type"}
            >
              {isUnauthorized ? "로그인하기" : "처음으로"}
            </Link>
          </div>
        )}

        {question && (
          <CollaborationQuestionForm
            currentQuestionOrder={currentQuestionOrder}
            nextHref={nextHref}
            options={sortedOptions}
            previousHref={previousHref}
            questionId={question.questionId}
            title={question.questionText}
          />
        )}

        {!isPending && !isError && !question && (
          <div className="flex h-[531px] flex-col items-center justify-center self-stretch rounded-2xl bg-white px-6 text-center font-[Pretendard] text-[15px] font-semibold leading-[150%] text-[#616161]">
            <p>질문을 찾을 수 없습니다.</p>
            <Link
              className="mt-5 flex h-10 items-center rounded-[14px] bg-[#FF7658] px-5 text-[15px] font-semibold text-white"
              href="/collaboration-type"
            >
              처음으로
            </Link>
          </div>
        )}
      </section>

      <CollaborationTestLeaveModal
        onOpenChange={setIsLeaveModalOpen}
        open={isLeaveModalOpen}
      />
    </>
  );
}
