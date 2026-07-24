"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import type { ContestSummary } from "../_types";

type ScrapListProps = {
  contests: ContestSummary[];
};

export function ScrapList({ contests }: ScrapListProps) {
  const [scrappedContests, setScrappedContests] = useState(contests);

  if (scrappedContests.length === 0) {
    return (
      <section aria-label="스크랩한 공모전" className="relative -mx-4 min-h-full overflow-hidden px-4 pt-4">
        <Image
          src="/icons/contests/Frame.svg"
          alt=""
          width={390}
          height={751}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          priority
        />

        <ScrapListHeader />

        <div className="absolute top-[88px] left-1/2 z-10 flex w-full -translate-x-1/2 flex-col items-center text-center">
          <p className="text-center font-[Roboto] text-[17px] leading-[150%] font-normal text-semantic-label-normal">
            아직 스크랩한 항목이 없어요.
          </p>
          <p className="mt-[4px] text-center font-[Pretendard] text-[13px] leading-[150%] font-normal text-semantic-label-neutral">
            관심 있는 공모전을 저장하고 공유해보세요.
          </p>
          <Image
            src="/icons/contests/Button/_Asset/tabler_bookmark-filled.svg"
            alt=""
            width={80}
            height={80}
            className="mt-[20px] flex aspect-square size-20 shrink-0 items-center justify-center opacity-10 grayscale"
          />
        </div>
      </section>
    );
  }

  return (
    <section aria-label="스크랩한 공모전" className="relative min-h-full bg-white pt-4">
      <ScrapListHeader>
        <span className="flex h-[22px] min-w-[22px] items-center justify-center bg-color-coral-500 px-[7px] text-[15px] leading-none font-bold text-white">
          {scrappedContests.length}
        </span>
      </ScrapListHeader>

      <div className="-mx-4 mt-[25px] flex flex-col">
        {scrappedContests.map((contest, index) => (
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
                <div className="flex h-[113px] w-[85px] items-center justify-center bg-color-gray-300 text-sm font-semibold text-color-gray-650">
                  이미지 {index + 1}
                </div>

                <div className="min-w-0">
                  <span className="flex w-fit items-center justify-center rounded-[85px] bg-color-coral-100 px-2 py-1 text-center text-[8px] leading-[135%] font-semibold text-semantic-line-brand">
                    {contest.category}
                  </span>
                  <h3 className="mt-1 line-clamp-2 text-[17px] leading-[135%] font-bold text-color-gray-850">
                    {contest.title}
                  </h3>
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
              </Link>

              <button
                type="button"
                aria-label={`${contest.title} 스크랩 해제`}
                className="flex justify-center pt-[11px]"
                onClick={() => {
                  setScrappedContests((currentContests) =>
                    currentContests.filter((currentContest) => currentContest.id !== contest.id),
                  );
                }}
              >
                <Image src="/icons/contests/x.svg" alt="" width={24} height={24} className="size-6 shrink-0" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScrapListHeader({ children }: { children?: ReactNode }) {
  return (
    <div className="relative z-10 flex items-center gap-3">
      <h2 className="text-[15px] leading-[125%] font-bold text-color-gray-850">스크랩한 공모전</h2>
      {children}
    </div>
  );
}
