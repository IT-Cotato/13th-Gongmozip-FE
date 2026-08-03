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

async function updateContestScrapStatus({
  contestId,
  isScrapped,
}: UpdateContestScrapStatusRequest) {
  const path = `/api/contests/${encodeURIComponent(contestId)}/scraps`;

  if (!isScrapped) {
    try {
      await apiFetch<void>(path, {
        method: "DELETE",
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
    await apiFetch<void>(path, {
      method: "POST",
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

function isAlreadyScrappedError(error: unknown) {
  return error instanceof ApiError && error.status === 409 && error.code === "CONTEST_409_1";
}

function isAlreadyUnscrappedError(error: unknown) {
  return error instanceof ApiError && error.status === 404 && error.code === "CONTEST_404_2";
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
        current
          ? { ...current, isScrapped: Boolean(context.previousScrapStatus?.isScrapped) }
          : current,
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
