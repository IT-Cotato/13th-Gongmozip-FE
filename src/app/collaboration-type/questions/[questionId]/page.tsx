import { notFound } from "next/navigation";

import CollaborationQuestionPageContent from "../../_components/CollaborationQuestionPageContent";

type CollaborationTypeQuestionPageProps = {
  params: Promise<{
    questionId: string;
  }>;
};

export default async function CollaborationTypeQuestionPage({
  params,
}: CollaborationTypeQuestionPageProps) {
  const { questionId } = await params;
  const currentQuestionOrder = Number(questionId);

  if (!Number.isInteger(currentQuestionOrder) || currentQuestionOrder < 1) {
    notFound();
  }

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-[#F9F8F4] text-[#1F1F1F]">
      <CollaborationQuestionPageContent currentQuestionOrder={currentQuestionOrder} />
    </main>
  );
}
