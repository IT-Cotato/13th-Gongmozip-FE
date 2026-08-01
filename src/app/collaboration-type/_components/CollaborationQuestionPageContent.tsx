"use client";

import Link from "next/link";
import { useState } from "react";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";

import { COLLABORATION_TEST_QUESTIONS } from "../_data/collaborationTest";
import CollaborationQuestionForm from "./CollaborationQuestionForm";
import CollaborationTestLeaveModal from "./CollaborationTestLeaveModal";

type CollaborationQuestionPageContentProps = {
  currentQuestionOrder: number;
};

export default function CollaborationQuestionPageContent({
  currentQuestionOrder,
}: CollaborationQuestionPageContentProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const questions = COLLABORATION_TEST_QUESTIONS;
  const totalQuestionCount = questions.length;
  const question = questions[currentQuestionOrder - 1];
  const nextHref =
    currentQuestionOrder >= totalQuestionCount
      ? "/collaboration-type/result-loading"
      : `/collaboration-type/questions/${currentQuestionOrder + 1}`;
  const previousHref =
    currentQuestionOrder <= 1
      ? "/collaboration-type"
      : `/collaboration-type/questions/${currentQuestionOrder - 1}`;
  const progressWidth =
    totalQuestionCount > 0
      ? Math.min(322, Math.round((currentQuestionOrder / totalQuestionCount) * 322))
      : 0;

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
          <span className="text-[#FF7658]">{currentQuestionOrder}</span>
          <span className="text-[#C8C8C8]">/{totalQuestionCount || 15}</span>
        </p>
      </div>

      <section className="mt-[36px] flex flex-col px-[18px]">
        {question && (
          <CollaborationQuestionForm
            currentQuestionOrder={currentQuestionOrder}
            nextHref={nextHref}
            options={question.options.map((option, index) => ({
              displayOrder: index + 1,
              optionId: question.id * 100 + index + 1,
              optionKey: `Q${question.id}_OPTION_${index + 1}`,
              optionLabel: option,
              optionValue: option,
            }))}
            previousHref={previousHref}
            questionId={question.id}
            title={question.title}
          />
        )}

        {!question && (
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
