"use client";

import Image from "next/image";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import {
  contestListDetailQueryKey,
  fetchContestDetailForList,
} from "@/queries/useContestDetailQuery";
import { useContestScrapMutation } from "@/queries/useContestScrapMutation";
import { useContestScrapStatusesQuery } from "@/queries/useContestScrapStatusQuery";
import { useContestScrapStore } from "@/stores/contestScrapStore";
import type { ContestSummary } from "../_types";

type ContestListProps = {
  contests: ContestSummary[];
};

export function ContestList({ contests }: ContestListProps) {
  const scrappedContestIds = useContestScrapStore((state) => state.scrappedContestIds);
  const setScrapStatus = useContestScrapStore((state) => state.setScrapStatus);
  const contestScrapMutation = useContestScrapMutation();
  const contestIds = useMemo(() => contests.map((contest) => contest.id), [contests]);
  const scrapStatusQueries = useContestScrapStatusesQuery(contestIds, {
    enabled: contestIds.length > 0,
  });
  const contestDetailQueries = useQueries({
    queries: contestIds.map((contestId) => ({
      queryKey: contestListDetailQueryKey(contestId),
      queryFn: () => fetchContestDetailForList(contestId),
      enabled: contestId.length > 0,
      staleTime: 1000 * 60,
    })),
  });
  const scrapStatusByContestId = useMemo(
    () =>
      new Map(
        scrapStatusQueries.flatMap((query) =>
          query.data ? [[query.data.contestId, query.data.isScrapped] as const] : [],
        ),
      ),
    [scrapStatusQueries],
  );
  const detailViewCountByContestId = useMemo(
    () =>
      new Map(
        contestDetailQueries.flatMap((query) =>
          query.data ? [[query.data.id, query.data.viewCount] as const] : [],
        ),
      ),
    [contestDetailQueries],
  );

  useEffect(() => {
    scrapStatusQueries.forEach((query) => {
      if (!query.data) {
        return;
      }

      setScrapStatus(query.data.contestId, query.data.isScrapped);
    });
  }, [scrapStatusQueries, setScrapStatus]);

  if (contests.length === 0) {
    return (
      <section
        aria-label="공모전 목록"
        className="-mt-0.5 flex min-h-[240px] items-center justify-center px-4 text-sm font-medium text-color-gray-500"
      >
        검색 결과가 없습니다
      </section>
    );
  }

  return (
    <section aria-label="공모전 목록" className="-mt-0.5">
      {contests.map((contest, index) => {
        const isScrapped =
          scrapStatusByContestId.get(contest.id) ??
          (scrappedContestIds.includes(contest.id) || contest.isScrapped);
        const viewCount = detailViewCountByContestId.get(contest.id) ?? contest.viewCount;

        return (
          <article
            key={contest.id}
            className="flex flex-col items-start self-stretch border-b border-color-gray-250 bg-white py-2 pr-2 pl-4"
          >
            <div className="grid w-full min-h-[113px] grid-cols-[85px_minmax(0,1fr)_24px] gap-x-[14px]">
              <Link
                href={`/contests/${contest.id}`}
                aria-label={`${contest.title} 상세정보 보기`}
                className="contents"
              >
                {contest.posterImageUrl ? (
                  <ContestPosterImage
                    src={contest.posterImageUrl}
                    alt={`${contest.title} 포스터`}
                  />
                ) : (
                  <div className="flex h-[113px] w-[85px] items-center justify-center bg-color-gray-300 text-sm font-semibold text-color-gray-650">
                    이미지 {index + 1}
                  </div>
                )}

                <div className="min-w-0">
                  <span className="flex w-fit items-center justify-center rounded-[85px] bg-color-coral-100 px-2 py-1 text-center text-[8px] leading-[135%] font-semibold text-semantic-line-brand">
                    {contest.category}
                  </span>
                  <h2 className="mt-1 line-clamp-2 text-[17px] leading-[135%] font-bold text-color-gray-850">
                    {contest.title}
                  </h2>
                  <p className="mt-1 truncate text-[13px] leading-[125%] font-medium text-color-gray-650">
                    {contest.organizer}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-[85px] bg-color-coral-500 px-2 py-1 text-[10px] leading-none font-semibold text-white">
                      {contest.dDay}
                    </span>
                    <span className="flex items-center gap-1 text-xs leading-[135%] font-semibold text-color-gray-350">
                      <Image src="/icons/contests/tabler-eye.svg" alt="" width={16} height={16} />
                      {viewCount.toLocaleString("ko-KR")}
                    </span>
                  </div>
                </div>
              </Link>

              <button
                type="button"
                aria-label={`${contest.title} 스크랩`}
                aria-pressed={isScrapped}
                className="flex justify-center pt-1"
                disabled={
                  contestScrapMutation.isPending &&
                  contestScrapMutation.variables?.contestId === contest.id
                }
                onClick={() => {
                  contestScrapMutation.mutate({
                    contestId: contest.id,
                    isScrapped: !isScrapped,
                  });
                }}
              >
                <Image
                  src={
                    isScrapped
                      ? "/icons/contests/Button/_Asset/tabler_bookmark-filled.svg"
                      : "/icons/contests/bookmark_gray.svg"
                  }
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 shrink-0"
                />
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ContestPosterImage({ alt, src }: { alt: string; src: string }) {
  if (isExternalUrl(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className="h-[113px] w-[85px] object-cover" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={85}
      height={113}
      className="h-[113px] w-[85px] object-cover"
    />
  );
}

function isExternalUrl(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}
