import { notFound } from "next/navigation";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";

import CollaborationQuestionForm from "../../_components/CollaborationQuestionForm";
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
      ? "/collaboration-type/result-loading"
      : `/collaboration-type/questions/${currentQuestionId + 1}`;
  const previousHref =
    currentQuestionId <= 1
      ? "/collaboration-type"
      : `/collaboration-type/questions/${currentQuestionId - 1}`;
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
        <CollaborationQuestionForm
          currentQuestionId={currentQuestionId}
          nextHref={nextHref}
          options={question.options}
          previousHref={previousHref}
          title={question.title}
        />
      </section>
    </main>
  );
}
