import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type ReviewKeywordItem = {
  keyword: string;
  count: number;
};

type ReviewStatisticsResponse = {
  totalReviewCount: number;
  keywords: ReviewKeywordItem[];
};

function fetchCollaborationReviewKeywords() {
  return apiFetch<ReviewStatisticsResponse>("/api/mypage/reviews");
}

export function useCollaborationReviewKeywordsQuery() {
  return useQuery({
    queryKey: ["member", "reviews", "keywords"],
    queryFn: fetchCollaborationReviewKeywords,
  });
}
