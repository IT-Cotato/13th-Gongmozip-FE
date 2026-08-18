import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

import {
  COLLABORATION_DISTANCE_QUERY_KEY,
  type CollaborationDistance,
} from "./useCollaborationDistanceQuery";
import { matchingEligibilityQueryKey } from "./useMatchingEligibilityQuery";
import { MYPAGE_SUMMARY_QUERY_KEY_PREFIX, type MypageSummary } from "./useMypageSummaryQuery";
import { todayMatchingResultQueryKey } from "./useTodayMatchingResultQuery";
import {
  todayMatchingApplicationQueryKey,
  type MatchingApplicationStatus,
  type MatchingWithdrawalType,
  type TodayMatchingApplication,
} from "./useTodayMatchingApplicationQuery";

export type WithdrawMatchingApplicationResponse = {
  applicationId: number;
  status: Extract<MatchingApplicationStatus, "CANCELED" | "PASSED">;
  withdrawalType: MatchingWithdrawalType;
  collaborationPenalty: number;
  currentCollaborationDistance: number;
};

export function withdrawMatchingApplication(applicationId: number) {
  return apiFetch<WithdrawMatchingApplicationResponse>(
    `/api/matching/applications/${encodeURIComponent(String(applicationId))}/withdraw`,
    {
      method: "POST",
    },
  );
}

export function useWithdrawMatchingApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawMatchingApplication,
    onSuccess: (data) => {
      const currentCollaborationDistance = data.currentCollaborationDistance;
      const shouldUpdateCollaborationDistance = Number.isFinite(currentCollaborationDistance);

      queryClient.setQueryData<TodayMatchingApplication>(
        todayMatchingApplicationQueryKey,
        (current) =>
          current
            ? {
                ...current,
                appliedToday: true,
                applicationId: data.applicationId,
                status: data.status,
                collaborationDistance: currentCollaborationDistance,
                withdrawal: {
                  withdrawable: false,
                  type: data.withdrawalType,
                  expectedPenalty: data.collaborationPenalty,
                  deadlineAt: null,
                },
              }
            : current,
      );

      if (shouldUpdateCollaborationDistance) {
        queryClient.setQueryData<CollaborationDistance>(
          COLLABORATION_DISTANCE_QUERY_KEY,
          (current) =>
            current
              ? {
                  ...current,
                  collaborationPoint: currentCollaborationDistance,
                  gaugePercent:
                    current.maxCollaborationPoint > 0
                      ? (currentCollaborationDistance / current.maxCollaborationPoint) * 100
                      : 0,
                }
              : current,
        );
        queryClient.setQueriesData<MypageSummary>(
          { queryKey: MYPAGE_SUMMARY_QUERY_KEY_PREFIX },
          (current) =>
            current
              ? {
                  ...current,
                  collaborationDistance: {
                    ...current.collaborationDistance,
                    current: currentCollaborationDistance,
                    // progress는 0~1 비율이 아니라 0~100 백분율(서버 응답 기준)이다.
                    progress:
                      current.collaborationDistance.max > 0
                        ? (currentCollaborationDistance / current.collaborationDistance.max) * 100
                        : 0,
                  },
                }
              : current,
        );
        void queryClient.invalidateQueries({
          queryKey: COLLABORATION_DISTANCE_QUERY_KEY,
          refetchType: "all",
        });
        void queryClient.invalidateQueries({
          queryKey: MYPAGE_SUMMARY_QUERY_KEY_PREFIX,
          refetchType: "all",
        });
      }

      void queryClient.invalidateQueries({ queryKey: matchingEligibilityQueryKey });
      void queryClient.invalidateQueries({ queryKey: todayMatchingApplicationQueryKey });
      void queryClient.invalidateQueries({ queryKey: todayMatchingResultQueryKey });
    },
  });
}
