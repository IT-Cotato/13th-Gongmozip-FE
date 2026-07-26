import Link from "next/link";
import { notFound } from "next/navigation";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";

import {
  COLLABORATION_TEST_QUESTIONS,
  COLLABORATION_TEST_TOTAL_QUESTION_COUNT,
} from "../../_data/collaborationTest";

type CollaborationTypeQuestionPageProps = {
  params: Promise<{
    questionId: string;
  }>;
};

export default async function CollaborationTypeQuestionPage({
  params,
}: CollaborationTypeQuestionPageProps) {
  const { questionId } = await params;
  const currentQuestionId = Number(questionId);
  const question = COLLABORATION_TEST_QUESTIONS.find((item) => item.id === currentQuestionId);

  if (!question) {
    notFound();
  }

  const nextHref =
    currentQuestionId >= COLLABORATION_TEST_TOTAL_QUESTION_COUNT
      ? "/collaboration-type/complete"
      : `/collaboration-type/questions/${currentQuestionId + 1}`;
  const progressWidth =
    currentQuestionId >= COLLABORATION_TEST_TOTAL_QUESTION_COUNT ? 322 : currentQuestionId * 21;

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-[#F9F8F4] text-[#1F1F1F]">
      <TeamMatchingHeader
        backHref="/collaboration-type"
        className="bg-[#F9F8F4]"
        title="협업 유형 검사"
      />

      <div className="relative mx-auto mt-[34px] flex h-[6px] w-[322px] max-w-[calc(100%-32px)] flex-col items-start gap-[10px] rounded-[90px] bg-[#D9D9D9]">
        <div
          className="h-[6px] shrink-0 rounded-[90px] bg-[#FFAD62]"
          style={{ width: `${progressWidth}px` }}
        />
        <p className="absolute bottom-[-16px] right-0 text-right font-[Pretendard] text-[12px] font-semibold leading-[135%]">
          <span className="text-[#FF7658]">{currentQuestionId}</span>
          <span className="text-[#C8C8C8]">/{COLLABORATION_TEST_TOTAL_QUESTION_COUNT}</span>
        </p>
      </div>

      <section className="mt-[36px] flex flex-col px-[18px]">
        <div className="flex h-[531px] self-stretch rounded-2xl bg-white px-11 pb-[14px] pt-[22px]">
          <div className="flex flex-1 items-start justify-center gap-[10px]" />
        </div>
        <Link
          className="mt-5 flex h-[38px] items-center justify-center gap-[5px] self-end rounded-[14px] bg-[#FF7658] px-[11px] py-2 font-[Roboto] text-[17px] font-semibold leading-[125%] text-white"
          href={nextHref}
        >
          <span className="relative h-4 w-[17px]" aria-hidden="true">
            <span className="absolute left-[2px] top-[3px] h-[9px] w-[9px] rotate-[-45deg] border-b-2 border-r-2 border-white" />
            <span className="absolute left-[8px] top-[3px] h-[9px] w-[9px] rotate-[-45deg] border-b-2 border-r-2 border-white" />
          </span>
          다음
        </Link>
      </section>
    </main>
  );
}
