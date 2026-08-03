"use client";

import Link from "next/link";

import { ApiError } from "@/lib/http";
import { useContestDetailQuery } from "@/queries/useContestDetailQuery";
import { useAuthStore } from "@/stores/useAuthStore";
import { ContestInfo } from "../../_components/ContestInfo";

type ContestDetailContentProps = {
  contestId: string;
};

export function ContestDetailContent({ contestId }: ContestDetailContentProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = Boolean(accessToken);
  const { data: contest, error, isError, isLoading } = useContestDetailQuery(contestId, {
    enabled: isAuthenticated,
  });
  const isNotFound = error instanceof ApiError && error.status === 404;

  return (
    <main className="flex h-full w-full flex-col bg-white text-color-gray-850">
      <header className="flex w-full max-w-[390px] shrink-0 items-center justify-between bg-white px-4 py-1">
        <Link
          href="/contests"
          aria-label="공모전 목록으로 돌아가기"
          className="flex size-8 items-center justify-center"
        >
          <span className="block h-2.5 w-2.5 rotate-45 border-b-2 border-l-2 border-color-gray-850" />
        </Link>
        <h1 className="flex h-[38px] items-center justify-center text-center text-[17px] leading-[135%] font-semibold text-color-gray-900">
          상세정보
        </h1>
        <div aria-hidden="true" className="size-8" />
      </header>

      <div className="scrollbar-hidden flex-1 overflow-y-auto">
        {!isAuthenticated ? (
          <ContestDetailStatus
            actionLabel="로그인하기"
            href="/login/email"
            message="로그인 후 공모전 상세 정보를 확인할 수 있습니다."
            title="인증이 필요합니다"
          />
        ) : null}

        {isAuthenticated && isLoading ? (
          <ContestDetailStatus message="공모전 정보를 불러오는 중입니다" />
        ) : null}

        {isAuthenticated && isError ? (
          <ContestDetailStatus
            actionLabel={error instanceof ApiError && error.status === 401 ? "로그인하기" : "목록으로 돌아가기"}
            href={error instanceof ApiError && error.status === 401 ? "/login/email" : "/contests"}
            message={
              isNotFound
                ? "삭제되었거나 존재하지 않는 공모전입니다."
                : error instanceof ApiError && error.status === 401
                  ? "로그인 후 공모전 상세 정보를 확인할 수 있습니다."
                : error instanceof Error
                  ? error.message
                  : "공모전 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
            }
            title={
              isNotFound
                ? "공모전을 찾을 수 없어요"
                : error instanceof ApiError && error.status === 401
                  ? "인증이 필요합니다"
                  : "공모전 정보를 불러오지 못했어요"
            }
          />
        ) : null}

        {isAuthenticated && contest ? <ContestInfo contest={contest} posterIndex={1} /> : null}
      </div>
    </main>
  );
}

function ContestDetailStatus({
  actionLabel,
  href,
  message,
  title,
}: {
  actionLabel?: string;
  href?: string;
  message: string;
  title?: string;
}) {
  return (
    <section className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
      {title ? (
        <h2 className="text-xl leading-[135%] font-semibold text-color-gray-900">{title}</h2>
      ) : null}
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
