import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

import { matchingEligibilityQueryKey } from "./useMatchingEligibilityQuery";
import { MYPAGE_SUMMARY_QUERY_KEY_PREFIX } from "./useMypageSummaryQuery";
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
      queryClient.setQueryData<TodayMatchingApplication>(
        todayMatchingApplicationQueryKey,
        (current) =>
          current
            ? {
                ...current,
                appliedToday: true,
                applicationId: data.applicationId,
                status: data.status,
                collaborationDistance: data.currentCollaborationDistance,
                withdrawal: {
                  withdrawable: false,
                  type: data.withdrawalType,
                  expectedPenalty: data.collaborationPenalty,
                  deadlineAt: null,
                },
              }
            : current,
      );

      void queryClient.invalidateQueries({ queryKey: matchingEligibilityQueryKey });
      void queryClient.invalidateQueries({ queryKey: todayMatchingApplicationQueryKey });
      void queryClient.invalidateQueries({ queryKey: todayMatchingResultQueryKey });
      // 취소/패스는 협업거리를 깎는다 - 마이페이지 요약(협업거리 게이지)도 함께
      // 갱신해야 마이페이지에서 감소분이 바로 보인다.
      void queryClient.invalidateQueries({ queryKey: MYPAGE_SUMMARY_QUERY_KEY_PREFIX });
    },
  });
}
