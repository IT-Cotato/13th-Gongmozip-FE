import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";

import type {
  MatchingGroupMemberStatus,
  MatchingGroupStatus,
} from "./useTodayMatchingApplicationQuery";

export type MatchingGroupResponseMember = {
  memberId: number;
  profileId: number;
  nickname: string;
  responseStatus: MatchingGroupMemberStatus;
  respondedAt: string | null;
  me: boolean;
};

export type MatchingGroupResponses = {
  matchingGroupId: number;
  groupStatus: MatchingGroupStatus;
  proposedTeamSize: 3 | 4;
  activeMemberCount: number;
  confirmedTeamSize: 3 | 4 | null;
  publishedAt: string;
  responseDeadlineAt: string | null;
  teamId: number | null;
  members: MatchingGroupResponseMember[];
};

export const matchingGroupResponsesQueryKey = (matchingGroupId: number | null | undefined) =>
  ["matching", "groups", matchingGroupId, "responses"] as const;

function fetchMatchingGroupResponses(matchingGroupId: number) {
  return apiFetch<MatchingGroupResponses>(
    `/api/matching/groups/${encodeURIComponent(String(matchingGroupId))}/responses`,
  );
}

export function useMatchingGroupResponsesQuery(
  matchingGroupId: number | null | undefined,
  options: { enabled?: boolean; refetchInterval?: number | false } = {},
) {
  return useQuery({
    enabled: (options.enabled ?? true) && typeof matchingGroupId === "number",
    queryFn: () => fetchMatchingGroupResponses(matchingGroupId as number),
    queryKey: matchingGroupResponsesQueryKey(matchingGroupId),
    refetchInterval: options.refetchInterval,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
