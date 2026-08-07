import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";

export type MatchingEligibilityReason =
  | "PROFILE_REQUIRED"
  | "SURVEY_REQUIRED"
  | "APPLICATION_DEADLINE_PASSED"
  | "ALREADY_APPLIED_TODAY"
  | "MATCHING_RESTRICTED"
  | "PROJECT_EVALUATION_NOT_READY"
  | "REASSIGNMENT_PENDING";

export type MatchingEligibility = {
  eligible: boolean;
  reasons: MatchingEligibilityReason[];
  hasProfile: boolean;
  surveyCompleted: boolean;
  appliedToday: boolean;
  matchingBlockedUntil: string | null;
  applicationDeadlineAt: string;
  participantCount: number;
};

export const matchingEligibilityQueryKey = ["matching", "applications", "eligibility"] as const;

function fetchMatchingEligibility() {
  return apiFetch<MatchingEligibility>("/api/matching/applications/eligibility");
}

export function useMatchingEligibilityQuery() {
  return useQuery({
    queryFn: fetchMatchingEligibility,
    queryKey: matchingEligibilityQueryKey,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
