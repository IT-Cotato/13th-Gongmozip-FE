"use client";

import { useCollaborationReviewKeywordsQuery } from "@/queries/useCollaborationReviewKeywordsQuery";
import { CollaborationReviewChip } from "./CollaborationReviewChip";
import { EmptyState } from "./EmptyState";

export function CollaborationReviewList() {
  const { data, isLoading, isError, refetch } = useCollaborationReviewKeywordsQuery();

  if (isLoading) {
    return (
      <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
        협업 후기를 불러오는 중이에요...
      </p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16">
        <p className="text-[13px] text-[#949494]">협업 후기를 불러오지 못했어요.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const keywords = (data?.keywords ?? []).filter((review) => review.count > 0);

  if (keywords.length === 0) {
    return (
      <EmptyState
        icon="📬"
        title="아직 받은 협업 후기가 없어요."
        description="프로젝트가 완료되면 함께한 사람들의 후기를 확인할 수 있어요"
      />
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-2 px-4">
      {keywords.map((review) => (
        <CollaborationReviewChip key={review.keyword} review={review} />
      ))}
    </div>
  );
}
