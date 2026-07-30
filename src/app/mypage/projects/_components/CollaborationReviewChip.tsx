import type { CollaborationKeywordReview } from "@/queries/useCollaborationReviewKeywordsQuery";
import { REVIEW_KEYWORD_CONFIG } from "../_lib/reviewKeyword";

export function CollaborationReviewChip({ review }: { review: CollaborationKeywordReview }) {
  const config = REVIEW_KEYWORD_CONFIG[review.type];

  return (
    <div
      className="flex shrink-0 items-center justify-center gap-2 rounded-full px-2 py-1"
      style={{ backgroundColor: config.bg }}
    >
      <p
        className="text-[15px] leading-[1.25] font-semibold whitespace-nowrap"
        style={{ color: config.text }}
      >
        {config.emoji} {config.label}
      </p>
      <div className="flex min-w-[19px] shrink-0 items-center justify-center rounded-full bg-white px-1 py-0.5">
        <span className="text-[15px] leading-[1.25] font-semibold text-[#ac4a35]">
          {review.count}
        </span>
      </div>
    </div>
  );
}
