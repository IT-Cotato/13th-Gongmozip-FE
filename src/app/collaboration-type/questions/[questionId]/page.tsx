import Link from "next/link";
import { notFound } from "next/navigation";

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

  return (
    <main>
      <h1>협업 유형 검사 문제</h1>
      <p>
        {currentQuestionId} / {COLLABORATION_TEST_TOTAL_QUESTION_COUNT}
      </p>
      <h2>{question.title}</h2>
      <ul>
        {question.options.map((option) => (
          <li key={option}>{option}</li>
        ))}
      </ul>
      <Link href={nextHref}>다음</Link>
    </main>
  );
}
