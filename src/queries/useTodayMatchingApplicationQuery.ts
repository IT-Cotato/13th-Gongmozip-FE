import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";

export type MatchingApplicationStatus =
  | "NONE"
  | "WAITING"
  | "MATCHING"
  | "PROPOSED"
  | "MATCHED"
  | "CANCELED"
  | "PASSED"
  | "REASSIGN_PENDING"
  | "FAILED"
  | "EXPIRED";

export type MatchingLeaderPreference = "WANTS" | "NEUTRAL" | "DOES_NOT_WANT";

export type MatchingContestCategory =
  | "IT_AI_TECH"
  | "MARKETING_AD_BRANDING"
  | "IDEA_PLANNING"
  | "ART_DESIGN"
  | "PHOTO_VIDEO"
  | "DATA_ANALYSIS";

export type MatchingResultStatus =
  | "NOT_APPLIED"
  | "NOT_PUBLISHED"
  | "PROCESSING"
  | "MATCHED"
  | "UNMATCHED"
  | "WITHDRAWN";

export type MatchingGroupStatus =
  | "PROPOSED"
  | "CONFIRMED"
  | "CANCELED"
  | "EXPIRED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type MatchingGroupMemberStatus = "PENDING" | "ACCEPTED" | "PASSED" | "EXPIRED" | "REJECTED";

export type MatchingAiStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type MatchingWithdrawalType = "FREE_CANCEL" | "PENALIZED_PASS";

export type MatchingWithdrawal = {
  withdrawable: boolean;
  type: MatchingWithdrawalType | null;
  expectedPenalty: number;
  deadlineAt: string | null;
};

export type TodayMatchingApplication = {
  appliedToday: boolean;
  applicationId: number | null;
  status: MatchingApplicationStatus;
  applicationDate: string | null;
  contestCategory: MatchingContestCategory | null;
  leaderPreference: MatchingLeaderPreference | null;
  skillScore: number | null;
  skillGroup: number | null;
  collaborationDistance: number | null;
  withdrawal: MatchingWithdrawal;
};

export const todayMatchingApplicationQueryKey = [
  "matching",
  "applications",
  "me",
  "today",
] as const;

export function fetchTodayMatchingApplication() {
  return apiFetch<TodayMatchingApplication>("/api/matching/applications/me/today");
}

export function useTodayMatchingApplicationQuery(
  options: { enabled?: boolean; refetchOnMount?: boolean | "always" } = {},
) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryFn: fetchTodayMatchingApplication,
    queryKey: todayMatchingApplicationQueryKey,
    refetchOnMount: options.refetchOnMount,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
