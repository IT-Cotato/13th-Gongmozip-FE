"use client";

import { useState } from "react";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";

import CollaborationQuestionForm from "./CollaborationQuestionForm";
import CollaborationTestLeaveModal from "./CollaborationTestLeaveModal";

type CollaborationQuestionPageContentProps = {
  currentQuestionId: number;
  nextHref: string;
  options: string[];
  previousHref: string;
  progressWidth: number;
  title: string;
  totalQuestionCount: number;
};

export default function CollaborationQuestionPageContent({
  currentQuestionId,
  nextHref,
  options,
  previousHref,
  progressWidth,
  title,
  totalQuestionCount,
}: CollaborationQuestionPageContentProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

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
          <span className="text-[#FF7658]">{currentQuestionId}</span>
          <span className="text-[#C8C8C8]">/{totalQuestionCount}</span>
        </p>
      </div>

      <section className="mt-[36px] flex flex-col px-[18px]">
        <CollaborationQuestionForm
          currentQuestionId={currentQuestionId}
          nextHref={nextHref}
          options={options}
          previousHref={previousHref}
          title={title}
        />
      </section>

      <CollaborationTestLeaveModal
        onOpenChange={setIsLeaveModalOpen}
        open={isLeaveModalOpen}
      />
    </>
  );
}
