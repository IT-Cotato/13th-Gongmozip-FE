"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import {
  contestCategoryApiValues,
  type ContestSort,
  useInfiniteContestsQuery,
} from "@/queries/useContestsQuery";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ContestCategory } from "../_types";
import { ContestCategorySheet } from "./ContestCategorySheet";
import { ContestList } from "./ContestList";

type SortOption = "최신순" | "조회순" | "마감순";

const SORT_OPTIONS: SortOption[] = ["최신순", "조회순", "마감순"];

const sortApiValues: Record<SortOption, ContestSort> = {
  최신순: "newest",
  조회순: "popular",
  마감순: "deadlineAsc",
};

export function ContestListSection() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const deferredSearchKeyword = useDeferredValue(searchKeyword);
  const [selectedCategory, setSelectedCategory] = useState<ContestCategory>("전체");
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>("최신순");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = Boolean(accessToken);

  const contestQueryParams = useMemo(
    () => ({
      keyword: deferredSearchKeyword.trim() || undefined,
      category: contestCategoryApiValues[selectedCategory],
      sort: sortApiValues[selectedSort],
      page: 0,
      size: 20,
    }),
    [deferredSearchKeyword, selectedCategory, selectedSort],
  );
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteContestsQuery(contestQueryParams, {
    enabled: isAuthenticated,
  });
  const contests = useMemo(
    () => data?.pages.flatMap((pageData) => pageData.contests) ?? [],
    [data?.pages],
  );
  const totalElements = data?.pages.at(-1)?.totalElements ?? 0;
  const hasMoreContests = contests.length < totalElements;

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
            disabled={!isAuthenticated}
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
            disabled={!isAuthenticated}
            aria-expanded={isCategorySheetOpen}
            aria-haspopup="dialog"
            className="flex h-[30px] items-center gap-1 rounded-[10px] border border-[rgba(97,97,97,0.16)] bg-white py-[3px] pr-[3px] pl-2.5 text-xs leading-[135%] font-semibold text-color-gray-650"
            onClick={() => setIsCategorySheetOpen(true)}
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
              disabled={!isAuthenticated}
              aria-expanded={isSortOpen}
              aria-haspopup="menu"
              className="flex items-center bg-white pl-2"
              onClick={() => setIsSortOpen((current) => !current)}
            >
              <span className="text-[15px] leading-[125%] font-medium text-color-gray-850">
                {selectedSort}
              </span>
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
                    disabled={!isAuthenticated}
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

        {selectedCategory !== "전체" && (
          <button
            type="button"
            disabled={!isAuthenticated}
            aria-label={`${selectedCategory} 분야 필터 삭제`}
            className="mt-2 flex h-7 items-center justify-center rounded-full bg-[rgba(97,97,97,0.10)] p-2 text-center text-[13px] leading-[125%] font-medium text-color-gray-650"
            onClick={() => setSelectedCategory("전체")}
          >
            {selectedCategory}
            <span className="flex size-5 aspect-square items-center justify-center">
              <Image
                src="/icons/contests/x.svg"
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0"
              />
            </span>
          </button>
        )}
      </section>

      {!isAuthenticated ? (
        <ContestListStatus
          actionLabel="로그인하기"
          href="/login"
          message="로그인 후 공모전 정보를 확인할 수 있습니다."
        />
      ) : null}

      {isAuthenticated && isLoading ? (
        <ContestListStatus message="공모전 목록을 불러오는 중입니다" />
      ) : null}

      {isAuthenticated && isError ? (
        <ContestListStatus
          message={
            error instanceof Error
              ? error.message
              : "공모전 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
          }
        />
      ) : null}

      {isCategorySheetOpen && (
        <ContestCategorySheet
          selectedCategory={selectedCategory}
          onSelect={(category) => {
            setSelectedCategory(category);
            setIsCategorySheetOpen(false);
          }}
          onClose={() => setIsCategorySheetOpen(false)}
        />
      )}

      {isAuthenticated && !isLoading && !isError ? (
        <>
          {isFetching ? (
            <p className="px-4 pb-2 text-xs font-medium text-color-gray-500">
              최신 공모전 목록으로 업데이트 중입니다
            </p>
          ) : null}
          <ContestList contests={contests} />
          {hasMoreContests ? (
            <div className="flex justify-center px-4 py-5">
              <button
                type="button"
                disabled={!hasNextPage || isFetchingNextPage}
                className="h-11 rounded-full bg-color-gray-900 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-color-gray-350"
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? "불러오는 중" : "더보기"}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}

function ContestListStatus({
  actionLabel,
  href,
  message,
}: {
  actionLabel?: string;
  href?: string;
  message: string;
}) {
  return (
    <section
      aria-label="공모전 목록 상태"
      className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-4 text-center text-sm font-medium text-color-gray-500"
    >
      <p>{message}</p>
      {href && actionLabel ? (
        <Link
          href={href}
          className="rounded-full bg-color-gray-900 px-5 py-3 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
