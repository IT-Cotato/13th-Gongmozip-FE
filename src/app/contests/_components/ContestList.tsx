"use client";

import Image from "next/image";
import { useState } from "react";

import type { ContestSummary } from "../_types";

type ContestListProps = {
  contests: ContestSummary[];
};

export function ContestList({ contests }: ContestListProps) {
  const [scrappedContestIds, setScrappedContestIds] = useState(() =>
    new Set(contests.filter((contest) => contest.isScrapped).map((contest) => contest.id)),
  );

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
        const isScrapped = scrappedContestIds.has(contest.id);

        return (
          <article
            key={contest.id}
            className="flex flex-col items-start self-stretch border-b border-color-gray-250 bg-white py-2 pr-2 pl-4"
          >
            <div className="grid w-full min-h-[113px] grid-cols-[85px_minmax(0,1fr)_24px] gap-x-[14px]">
              <div className="flex h-[113px] w-[85px] items-center justify-center bg-color-gray-300 text-sm font-semibold text-color-gray-650">
                이미지 {index + 1}
              </div>

              <div className="min-w-0 pt-2">
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
                    {contest.viewCount.toLocaleString("ko-KR")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label={`${contest.title} 스크랩`}
                aria-pressed={isScrapped}
                className="flex justify-center pt-1"
                onClick={() => {
                  setScrappedContestIds((currentIds) => {
                    const nextIds = new Set(currentIds);

                    if (nextIds.has(contest.id)) {
                      nextIds.delete(contest.id);
                    } else {
                      nextIds.add(contest.id);
                    }

                    return nextIds;
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
