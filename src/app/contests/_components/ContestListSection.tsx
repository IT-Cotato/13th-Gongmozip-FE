"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { ContestSummary } from "../_types";
import { ContestList } from "./ContestList";

type SortOption = "최신순" | "조회순" | "마감순";

type ContestListSectionProps = {
  contests: ContestSummary[];
};

const SORT_OPTIONS: SortOption[] = ["최신순", "조회순", "마감순"];

export function ContestListSection({ contests }: ContestListSectionProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSort, setSelectedSort] = useState<SortOption>("최신순");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filteredAndSortedContests = useMemo(() => {
    const trimmedKeyword = searchKeyword.trim().toLowerCase();
    const filteredContests =
      trimmedKeyword.length > 0
        ? contests.filter((contest) => contest.title.toLowerCase().includes(trimmedKeyword))
        : contests;
    const copiedContests = [...filteredContests];

    if (selectedSort === "조회순") {
      return copiedContests.sort((a, b) => b.viewCount - a.viewCount);
    }

    if (selectedSort === "마감순") {
      return copiedContests.sort((a, b) => getRemainingDays(a.dDay) - getRemainingDays(b.dDay));
    }

    return copiedContests;
  }, [contests, searchKeyword, selectedSort]);

  return (
    <>
      <section className="flex w-full flex-col items-center gap-2 px-4 pt-[23px]">
        <label
          className="flex h-[38px] w-full shrink-0 items-center justify-between rounded-[30px] bg-color-gray-150 px-4 py-2"
          htmlFor="contest-search"
        >
          <input
            id="contest-search"
            type="search"
            value={searchKeyword}
            placeholder="원하는 공모전을 검색하세요"
            className="min-w-0 flex-1 bg-transparent text-[15px] leading-[135%] font-normal text-color-gray-650 outline-none placeholder:text-color-gray-650"
            onChange={(event) => setSearchKeyword(event.target.value)}
          />
          <Image
            src="/icons/contests/tabler_search.svg"
            alt=""
            width={24}
            height={24}
            className="size-6 shrink-0"
          />
        </label>
      </section>

      <section className="mt-[15px] flex flex-col items-start self-stretch bg-white px-4 py-1">
        <div className="relative flex w-full items-start justify-between">
          <button
            type="button"
            className="flex h-[30px] items-center gap-1 rounded-[10px] border border-[rgba(97,97,97,0.16)] bg-white py-[3px] pr-[3px] pl-2.5 text-xs leading-[135%] font-semibold text-color-gray-650"
          >
            공모전 분야
            <span className="flex size-[18px] items-center justify-center">
              <Image
                src="/icons/contests/asset-icon.svg"
                alt=""
                width={18}
                height={18}
                className="size-[18px] shrink-0"
              />
            </span>
          </button>

          <div className="relative">
            <button
              type="button"
              aria-expanded={isSortOpen}
              aria-haspopup="menu"
              className="flex items-center bg-white pl-2"
              onClick={() => setIsSortOpen((current) => !current)}
            >
              <span className="text-[15px] leading-[125%] font-medium text-color-gray-850">{selectedSort}</span>
              <span className="-ml-1 flex flex-col items-center rounded-[10px] p-[7px]">
                <Image
                  src="/icons/contests/button-asset-icon.svg"
                  alt=""
                  width={18}
                  height={18}
                  className={`size-[18px] shrink-0 ${isSortOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {isSortOpen && (
              <div
                role="menu"
                className="absolute top-8 right-0 z-10 w-28 rounded-[8px] bg-white py-2 shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
              >
                {SORT_OPTIONS.map((sortOption) => (
                  <button
                    key={sortOption}
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 self-stretch px-2 py-3 text-left text-[15px] leading-[125%] font-medium text-color-gray-850"
                    onClick={() => {
                      setSelectedSort(sortOption);
                      setIsSortOpen(false);
                    }}
                  >
                    {sortOption}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <ContestList contests={filteredAndSortedContests} />
    </>
  );
}

function getRemainingDays(dDay: string) {
  const remainingDays = Number(dDay.replace("D-", ""));

  return Number.isNaN(remainingDays) ? Number.MAX_SAFE_INTEGER : remainingDays;
}
