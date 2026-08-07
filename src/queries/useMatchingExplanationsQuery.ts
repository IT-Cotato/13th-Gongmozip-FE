import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";

export type MatchingExplanationItem = {
  title: string;
  description: string;
};

export type MatchingExplanationSection = {
  type: string;
  title: string;
  description: string;
  items: MatchingExplanationItem[];
};

export type MatchingExplanations = {
  title: string;
  summary: string;
  sections: MatchingExplanationSection[];
  disclaimer: string;
  updatedAt: string;
};

export const matchingExplanationsQueryKey = ["matching", "explanations"] as const;

export function fetchMatchingExplanations() {
  return apiFetch<MatchingExplanations>("/api/matching-explanations");
}

export function useMatchingExplanationsQuery() {
  return useQuery({
    queryFn: fetchMatchingExplanations,
    queryKey: matchingExplanationsQueryKey,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
