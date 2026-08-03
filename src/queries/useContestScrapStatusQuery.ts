import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

export type ContestScrapStatus = {
  contestId: string;
  isScrapped: boolean;
  scrappedAt: string | null;
};

type ContestScrapStatusResponse = {
  contestId: string | number;
  isScrapped: boolean;
  scrappedAt: string | null;
};

export const contestScrapStatusQueryKey = (contestId: string) =>
  ["contest", contestId, "scrap-status"] as const;

export async function fetchContestScrapStatus(contestId: string) {
  const data = await apiFetch<ContestScrapStatusResponse>(
    `/api/contests/${encodeURIComponent(contestId)}/scrap-status`,
  );

  return {
    contestId: String(data.contestId),
    isScrapped: data.isScrapped,
    scrappedAt: data.scrappedAt,
  } satisfies ContestScrapStatus;
}

export function useContestScrapStatusQuery(
  contestId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: contestScrapStatusQueryKey(contestId),
    queryFn: () => fetchContestScrapStatus(contestId),
    enabled: contestId.length > 0 && (options.enabled ?? true),
  });
}
