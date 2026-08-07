import { useMutation, useQuery, useQueryClient, type Query } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";

export type MatchingReasonStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | string;

export type MatchingReasonTextBlock = {
  title: string;
  description: string;
};

export type MatchingReason = {
  reasonId: number;
  matchingResultId: number;
  status: MatchingReasonStatus;
  headline?: string | null;
  summary?: string | null;
  strengths?: MatchingReasonTextBlock[];
  commonPoints?: string[];
  complementaryPoints?: MatchingReasonTextBlock[];
  cautions?: string[];
  totalCompatibilityScore?: number | null;
  teamGoalScore?: number | null;
  personalityScore?: number | null;
  extraversionComplementScore?: number | null;
  failureMessage?: string | null;
  generatedAt?: string | null;
  createdAt: string;
};

export const matchingReasonQueryKey = (matchingGroupId: number | null | undefined) =>
  ["ai", "matching-results", matchingGroupId, "reason"] as const;

type MatchingReasonRefetchInterval =
  | number
  | false
  | ((
      query: Query<
        MatchingReason,
        Error,
        MatchingReason,
        ReturnType<typeof matchingReasonQueryKey>
      >,
    ) => number | false | undefined);

function fetchMatchingReason(matchingGroupId: number) {
  return apiFetch<MatchingReason>(
    `/api/ai/matching-results/${encodeURIComponent(String(matchingGroupId))}/reason`,
  );
}

function createMatchingReason(matchingGroupId: number) {
  return apiFetch<MatchingReason>(
    `/api/ai/matching-results/${encodeURIComponent(String(matchingGroupId))}/reason`,
    {
      method: "POST",
    },
  );
}

export function useMatchingReasonQuery(
  matchingGroupId: number | null | undefined,
  options: { enabled?: boolean; refetchInterval?: MatchingReasonRefetchInterval } = {},
) {
  return useQuery({
    enabled: (options.enabled ?? true) && typeof matchingGroupId === "number",
    queryFn: () => fetchMatchingReason(matchingGroupId as number),
    queryKey: matchingReasonQueryKey(matchingGroupId),
    refetchInterval: options.refetchInterval,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
        return false;
      }

      return failureCount < 1;
    },
  });
}

export function useCreateMatchingReasonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMatchingReason,
    onSuccess: (data, matchingGroupId) => {
      queryClient.setQueryData(matchingReasonQueryKey(matchingGroupId), data);
      void queryClient.invalidateQueries({ queryKey: matchingReasonQueryKey(matchingGroupId) });
    },
  });
}
