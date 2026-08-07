import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";

import type {
  MatchingApplicationStatus,
  MatchingContestCategory,
  MatchingGroupMemberStatus,
  MatchingGroupStatus,
  MatchingLeaderPreference,
  MatchingResultStatus,
} from "./useTodayMatchingApplicationQuery";

export type MatchingScoreBreakdown = {
  leaderHarmonyScore: number | null;
  goalSimilarityScore: number | null;
  workStyleSimilarityScore: number | null;
  communicationSimilarityScore: number | null;
  agreeablenessSimilarityScore: number | null;
  conscientiousnessSimilarityScore: number | null;
  honestyHumilitySimilarityScore: number | null;
  extroversionComplementScore: number | null;
};

export type MatchingCharacterType =
  | "LEAD_RUNNER"
  | "TRACK_RUNNER"
  | "BOOST_RUNNER"
  | "FREE_RUNNER";

export type TodayMatchingResultMember = {
  memberId: number;
  profileId: number;
  nickname: string;
  characterType: MatchingCharacterType | null;
  leaderPreference: MatchingLeaderPreference | null;
  responseStatus: MatchingGroupMemberStatus;
  me: boolean;
};

export type TodayMatchingResult = {
  resultStatus: MatchingResultStatus;
  applicationId: number | null;
  applicationDate: string | null;
  applicationStatus: MatchingApplicationStatus | null;
  publishedAt: string | null;
  contestCategory: MatchingContestCategory | null;
  matchingGroupId: number | null;
  teamSize: 3 | 4 | null;
  matchingScore: number | null;
  scoreBreakdown: MatchingScoreBreakdown | null;
  members: TodayMatchingResultMember[];
  responseDeadlineAt: string | null;
  groupStatus: MatchingGroupStatus | null;
  myResponseStatus: MatchingGroupMemberStatus | null;
  confirmedTeamSize: 3 | 4 | null;
  teamId: number | null;
};

export const todayMatchingResultQueryKey = ["matching", "results", "me", "today"] as const;

function fetchTodayMatchingResult() {
  return apiFetch<TodayMatchingResult>("/api/matching/results/me/today");
}

export function useTodayMatchingResultQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryFn: fetchTodayMatchingResult,
    queryKey: todayMatchingResultQueryKey,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
