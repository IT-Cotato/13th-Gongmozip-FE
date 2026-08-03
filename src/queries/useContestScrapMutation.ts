import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ContestDetail } from "@/app/contests/_types";
import { ApiError, apiFetch } from "@/lib/http";
import { useContestScrapStore } from "@/stores/contestScrapStore";
import { contestDetailQueryKey } from "./useContestDetailQuery";
import type { ContestsResponse } from "./useContestsQuery";
import { mypageSummaryQueryKey } from "./useMypageSummaryQuery";
import {
  contestScrapStatusQueryKey,
  type ContestScrapStatus,
} from "./useContestScrapStatusQuery";

type UpdateContestScrapStatusRequest = {
  contestId: string;
  isScrapped: boolean;
};

type ContestScrapResponse = {
  contestId: string | number;
  isScrapped: boolean;
  scrappedAt: string | null;
};

async function updateContestScrapStatus({
  contestId,
  isScrapped,
}: UpdateContestScrapStatusRequest) {
  const path = `/api/contests/${encodeURIComponent(contestId)}/scraps`;

  if (!isScrapped) {
    try {
      const data = await apiFetch<unknown>(path, {
        method: "DELETE",
      });

      return mapContestScrapResponse(data, {
        contestId,
        isScrapped: false,
        scrappedAt: null,
      });
    } catch (error) {
      if (!isAlreadyUnscrappedError(error)) {
        throw error;
      }
    }

    return {
      contestId,
      isScrapped: false,
      scrappedAt: null,
    } satisfies ContestScrapStatus;
  }

  try {
    const data = await apiFetch<unknown>(path, {
      method: "POST",
    });

    return mapContestScrapResponse(data, {
      contestId,
      isScrapped: true,
      scrappedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (!isAlreadyScrappedError(error)) {
      throw error;
    }
  }

  return {
    contestId,
    isScrapped: true,
    scrappedAt: new Date().toISOString(),
  } satisfies ContestScrapStatus;
}

function mapContestScrapResponse(
  data: unknown,
  fallback: ContestScrapStatus,
) {
  if (!isContestScrapResponse(data)) {
    return fallback;
  }

  return {
    contestId: String(data.contestId),
    isScrapped: data.isScrapped,
    scrappedAt: data.scrappedAt,
  } satisfies ContestScrapStatus;
}

function isContestScrapResponse(data: unknown): data is ContestScrapResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "contestId" in data &&
    (typeof (data as { contestId: unknown }).contestId === "string" ||
      typeof (data as { contestId: unknown }).contestId === "number") &&
    "isScrapped" in data &&
    typeof (data as { isScrapped: unknown }).isScrapped === "boolean" &&
    "scrappedAt" in data &&
    ((data as { scrappedAt: unknown }).scrappedAt === null ||
      typeof (data as { scrappedAt: unknown }).scrappedAt === "string")
  );
}

function isAlreadyScrappedError(error: unknown) {
  return error instanceof ApiError && error.status === 409;
}

function isAlreadyUnscrappedError(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export function useContestScrapMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContestScrapStatus,
    onMutate: async ({ contestId, isScrapped }) => {
      const queryKey = contestScrapStatusQueryKey(contestId);

      await queryClient.cancelQueries({ queryKey });

      const previousScrapStatus = queryClient.getQueryData<ContestScrapStatus>(queryKey);
      const previousScrappedContestIds = useContestScrapStore.getState().scrappedContestIds;
      const previousIsScrapped =
        previousScrapStatus?.isScrapped ?? previousScrappedContestIds.includes(contestId);

      const optimisticScrapStatus = {
        contestId,
        isScrapped,
        scrappedAt: isScrapped ? new Date().toISOString() : null,
      } satisfies ContestScrapStatus;

      queryClient.setQueryData(queryKey, optimisticScrapStatus);
      queryClient.setQueryData<ContestDetail>(contestDetailQueryKey(contestId), (current) =>
        current ? { ...current, isScrapped } : current,
      );
      queryClient.setQueriesData<ContestsResponse>({ queryKey: ["contests"] }, (current) =>
        updateContestListScrapStatus(current, contestId, isScrapped),
      );
      useContestScrapStore.getState().setScrapStatus(contestId, isScrapped);

      return {
        contestId,
        previousIsScrapped,
        previousScrapStatus,
        previousScrappedContestIds,
      };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(
        contestScrapStatusQueryKey(context.contestId),
        context.previousScrapStatus,
      );
      queryClient.setQueryData<ContestDetail>(contestDetailQueryKey(context.contestId), (current) =>
        current ? { ...current, isScrapped: context.previousIsScrapped } : current,
      );
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      useContestScrapStore.setState({
        scrappedContestIds: context.previousScrappedContestIds,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(contestScrapStatusQueryKey(data.contestId), data);
      queryClient.setQueryData<ContestDetail>(contestDetailQueryKey(data.contestId), (current) =>
        current ? { ...current, isScrapped: data.isScrapped } : current,
      );
      queryClient.setQueriesData<ContestsResponse>({ queryKey: ["contests"] }, (current) =>
        updateContestListScrapStatus(current, data.contestId, data.isScrapped),
      );
      useContestScrapStore.getState().setScrapStatus(data.contestId, data.isScrapped);
      void queryClient.invalidateQueries({ queryKey: mypageSummaryQueryKey });
    },
  });
}

function updateContestListScrapStatus(
  current: ContestsResponse | undefined,
  contestId: string,
  isScrapped: boolean,
) {
  if (!current) {
    return current;
  }

  return {
    ...current,
    contests: current.contests.map((contest) =>
      contest.id === contestId ? { ...contest, isScrapped } : contest,
    ),
  };
}
