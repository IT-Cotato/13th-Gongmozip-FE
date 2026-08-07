import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

import {
  matchingGroupResponsesQueryKey,
  type MatchingGroupResponses,
} from "./useMatchingGroupResponsesQuery";
import {
  todayMatchingResultQueryKey,
  type TodayMatchingResult,
} from "./useTodayMatchingResultQuery";
import { todayMatchingApplicationQueryKey } from "./useTodayMatchingApplicationQuery";
import type {
  MatchingGroupMemberStatus,
  MatchingGroupStatus,
} from "./useTodayMatchingApplicationQuery";

export type AcceptMatchingGroupResponse = {
  matchingGroupId: number;
  groupStatus: Extract<MatchingGroupStatus, "PROPOSED" | "CONFIRMED">;
  myResponseStatus: Extract<MatchingGroupMemberStatus, "ACCEPTED">;
  confirmedTeamSize: 3 | 4 | null;
  teamId: number | null;
};

export function acceptMatchingGroup(matchingGroupId: number) {
  return apiFetch<AcceptMatchingGroupResponse>(
    `/api/matching/groups/${encodeURIComponent(String(matchingGroupId))}/accept`,
    {
      method: "POST",
    },
  );
}

export function useAcceptMatchingGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptMatchingGroup,
    onSuccess: (data) => {
      queryClient.setQueryData<TodayMatchingResult>(todayMatchingResultQueryKey, (current) =>
        current
          ? {
              ...current,
              matchingGroupId: data.matchingGroupId,
              groupStatus: data.groupStatus,
              myResponseStatus: data.myResponseStatus,
              confirmedTeamSize: data.confirmedTeamSize,
              teamId: data.teamId,
              members: current.members.map((member) =>
                member.me ? { ...member, responseStatus: data.myResponseStatus } : member,
              ),
            }
          : current,
      );

      queryClient.setQueryData<MatchingGroupResponses>(
        matchingGroupResponsesQueryKey(data.matchingGroupId),
        (current) =>
          current
            ? {
                ...current,
                groupStatus: data.groupStatus,
                confirmedTeamSize: data.confirmedTeamSize,
                teamId: data.teamId,
                members: current.members.map((member) =>
                  member.me
                    ? {
                        ...member,
                        responseStatus: data.myResponseStatus,
                        respondedAt: member.respondedAt ?? new Date().toISOString(),
                      }
                    : member,
                ),
              }
            : current,
      );

      void queryClient.invalidateQueries({ queryKey: todayMatchingResultQueryKey });
      void queryClient.invalidateQueries({ queryKey: todayMatchingApplicationQueryKey });
      void queryClient.invalidateQueries({
        queryKey: matchingGroupResponsesQueryKey(data.matchingGroupId),
      });
    },
  });
}
