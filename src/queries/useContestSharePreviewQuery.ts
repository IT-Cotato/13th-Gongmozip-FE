import { useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/http";
import { contestCategoryLabels } from "./useContestsQuery";

type ContestSharePreviewResponse = {
  contestId: string | number;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  hostName: string;
  applyEndAt: string;
  daysRemaining: number;
  detailUrl: string;
};

export type ContestSharePreview = {
  contestId: string;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  hostName: string;
  applyEndAt: string;
  dDay: string;
  detailUrl: string;
};

export const contestSharePreviewQueryKey = (contestId: string) =>
  ["contest", contestId, "share-preview"] as const;

export async function fetchContestSharePreview(contestId: string) {
  const data = await apiFetch<ContestSharePreviewResponse>(
    `/api/contests/${encodeURIComponent(contestId)}/share-preview`,
  );

  return {
    contestId: String(data.contestId),
    title: data.title,
    thumbnailUrl: data.thumbnailUrl,
    category: contestCategoryLabels[data.category] ?? data.category,
    hostName: data.hostName,
    applyEndAt: data.applyEndAt,
    dDay: formatDday(data.daysRemaining),
    detailUrl: data.detailUrl,
  } satisfies ContestSharePreview;
}

export function useContestSharePreviewQuery(
  contestId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    enabled: contestId.length > 0 && (options.enabled ?? true),
    queryFn: () => fetchContestSharePreview(contestId),
    queryKey: contestSharePreviewQueryKey(contestId),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [400, 401, 403, 404].includes(error.status)) {
        return false;
      }

      return failureCount < 1;
    },
    staleTime: 1000 * 60,
  });
}

function formatDday(daysRemaining: number) {
  if (daysRemaining <= 0) {
    return "D-Day";
  }

  return `D-${daysRemaining}`;
}
