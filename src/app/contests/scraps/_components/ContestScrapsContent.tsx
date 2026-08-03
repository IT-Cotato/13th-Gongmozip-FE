"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { useContestScrapStatusesQuery } from "@/queries/useContestScrapStatusQuery";
import { useContestsQuery } from "@/queries/useContestsQuery";
import { useAuthStore } from "@/stores/useAuthStore";
import { useContestScrapStore } from "@/stores/contestScrapStore";
import { ScrapList } from "../../_components/ScrapList";

const SCRAP_CONTESTS_PAGE_SIZE = 100;

export function ContestScrapsContent() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = Boolean(accessToken);
  const storeScrappedContestIds = useContestScrapStore((state) => state.scrappedContestIds);
  const setScrapStatus = useContestScrapStore((state) => state.setScrapStatus);
  const {
    data,
    error,
    isError,
    isLoading: isContestsLoading,
  } = useContestsQuery(
    {
      page: 0,
      size: SCRAP_CONTESTS_PAGE_SIZE,
      sort: "newest",
    },
    {
      enabled: isAuthenticated,
    },
  );
  const contests = useMemo(() => data?.contests ?? [], [data?.contests]);
  const contestIds = useMemo(() => contests.map((contest) => contest.id), [contests]);
  const scrapStatusQueries = useContestScrapStatusesQuery(contestIds, {
    enabled: isAuthenticated && contestIds.length > 0,
  });
  const isScrapStatusLoading = scrapStatusQueries.some((query) => query.isLoading);
  const scrapStatusError = scrapStatusQueries.find((query) => query.isError)?.error;
  const scrappedContestIds = useMemo(
    () => {
      const scrappedIds = new Set(storeScrappedContestIds);

      contests.forEach((contest) => {
        if (contest.isScrapped) {
          scrappedIds.add(contest.id);
        }
      });

      scrapStatusQueries.forEach((query) => {
        if (!query.data) {
          return;
        }

        if (query.data.isScrapped) {
          scrappedIds.add(query.data.contestId);
        } else {
          scrappedIds.delete(query.data.contestId);
        }
      });

      return Array.from(scrappedIds);
    },
    [contests, scrapStatusQueries, storeScrappedContestIds],
  );

  useEffect(() => {
    scrapStatusQueries.forEach((query) => {
      if (!query.data) {
        return;
      }

      setScrapStatus(query.data.contestId, query.data.isScrapped);
    });
  }, [scrapStatusQueries, setScrapStatus]);

  if (!isAuthenticated) {
    return (
      <ContestScrapsStatus
        actionLabel="로그인하기"
        href="/login/email"
        message="로그인 후 스크랩한 공모전을 확인할 수 있습니다."
      />
    );
  }

  if (isContestsLoading || isScrapStatusLoading) {
    return <ContestScrapsStatus message="스크랩한 공모전을 불러오는 중입니다" />;
  }

  if (isError || scrapStatusError) {
    return (
      <ContestScrapsStatus
        message={
          error instanceof Error
            ? error.message
            : scrapStatusError instanceof Error
              ? scrapStatusError.message
              : "스크랩 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        }
      />
    );
  }

  return <ScrapList contests={contests} scrappedContestIds={scrappedContestIds} />;
}

function ContestScrapsStatus({
  actionLabel,
  href,
  message,
}: {
  actionLabel?: string;
  href?: string;
  message: string;
}) {
  return (
    <section className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm leading-[150%] font-medium text-color-gray-500">{message}</p>
      {href && actionLabel ? (
        <Link
          href={href}
          className="mt-3 rounded-full bg-color-gray-900 px-5 py-3 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
