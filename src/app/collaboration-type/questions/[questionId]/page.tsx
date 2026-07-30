import { notFound } from "next/navigation";

import CollaborationQuestionPageContent from "../../_components/CollaborationQuestionPageContent";
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
      <CollaborationQuestionPageContent
        currentQuestionId={currentQuestionId}
        nextHref={nextHref}
        options={question.options}
        previousHref={previousHref}
        progressWidth={progressWidth}
        title={question.title}
        totalQuestionCount={COLLABORATION_TEST_TOTAL_QUESTION_COUNT}
      />
    </main>
  );
}
