import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";

export type MatchingParticipantCount = {
  participantCount: number;
  applicationDeadlineAt: string;
  resultPublishAt: string;
  serverTime: string;
};

export const matchingParticipantCountQueryKey = [
  "matching",
  "applications",
  "participant-count",
] as const;

function fetchMatchingParticipantCount() {
  return apiFetch<MatchingParticipantCount>("/api/matching/applications/participant-count");
}

export function useMatchingParticipantCountQuery() {
  return useQuery({
    queryFn: fetchMatchingParticipantCount,
    queryKey: matchingParticipantCountQueryKey,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
