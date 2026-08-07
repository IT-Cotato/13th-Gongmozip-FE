import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";
import { useTeamMatchingApplicationStore } from "@/stores/teamMatchingApplicationStore";

import { matchingEligibilityQueryKey } from "./useMatchingEligibilityQuery";
import { todayMatchingResultQueryKey } from "./useTodayMatchingResultQuery";
import {
  todayMatchingApplicationQueryKey,
  type MatchingContestCategory,
  type MatchingLeaderPreference,
  type TodayMatchingApplication,
} from "./useTodayMatchingApplicationQuery";

export type CreateMatchingApplicationRequest = {
  profileId: number;
  contestCategory: MatchingContestCategory;
  leaderPreference: MatchingLeaderPreference;
  noticeConfirmed: true;
};

export type CreateMatchingApplicationResponse = {
  applicationId: number;
  status: "WAITING";
  applicationDate: string;
  contestCategory: MatchingContestCategory;
  leaderPreference: MatchingLeaderPreference;
  skillScore: number | null;
  skillGroup: number | null;
  collaborationDistance: number;
  applicationDeadlineAt: string;
};

export function createMatchingApplication(payload: CreateMatchingApplicationRequest) {
  return apiFetch<CreateMatchingApplicationResponse>("/api/matching/applications", {
    method: "POST",
    body: payload,
  });
}

export function useCreateMatchingApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMatchingApplication,
    onSuccess: (data) => {
      queryClient.setQueryData<TodayMatchingApplication>(todayMatchingApplicationQueryKey, {
        appliedToday: true,
        applicationId: data.applicationId,
        status: data.status,
        applicationDate: data.applicationDate,
        contestCategory: data.contestCategory,
        leaderPreference: data.leaderPreference,
        skillScore: data.skillScore,
        skillGroup: data.skillGroup,
        collaborationDistance: data.collaborationDistance,
        withdrawal: {
          withdrawable: true,
          type: "FREE_CANCEL",
          expectedPenalty: 0,
          deadlineAt: data.applicationDeadlineAt,
        },
      });
      void queryClient.invalidateQueries({ queryKey: matchingEligibilityQueryKey });
      void queryClient.invalidateQueries({ queryKey: todayMatchingApplicationQueryKey });
      void queryClient.invalidateQueries({ queryKey: todayMatchingResultQueryKey });
      useTeamMatchingApplicationStore.getState().reset();
    },
  });
}
