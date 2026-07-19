import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type CollaborationKeywordType = "DEPENDABLE" | "CARING" | "SINCERE";

export type CollaborationKeywordReview = {
  type: CollaborationKeywordType;
  count: number;
};

function fetchCollaborationReviewKeywords() {
  return apiFetch<CollaborationKeywordReview[]>("/api/members/me/reviews/keywords");
}

export function useCollaborationReviewKeywordsQuery() {
  return useQuery({
    queryKey: ["member", "reviews", "keywords"],
    queryFn: fetchCollaborationReviewKeywords,
  });
}
