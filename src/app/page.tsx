"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/layout/BottomNavigation";
import TeamMatchingApplyLink from "@/components/team-matching/TeamMatchingApplyLink";
import Image from "next/image";
import Link from "next/link";
import { ApiError } from "@/lib/http";
import { getTeamMatchingApplyHref } from "@/lib/teamMatchingApply";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHasAuthHydrated } from "@/stores/useHasAuthHydrated";
import { useMemberProfileQuery } from "@/queries/useMemberProfileQuery";
import { useMatchingEligibilityQuery } from "@/queries/useMatchingEligibilityQuery";
import { useTodayMatchingApplicationQuery } from "@/queries/useTodayMatchingApplicationQuery";
import {
  type RecommendedContest,
  useRecommendedContestsQuery,
} from "@/queries/useRecommendedContestsQuery";

function Header() {
  return (
    <header className="relative flex h-[46px] shrink-0 items-center bg-white px-4 py-1">
      <h1 className="pointer-events-none absolute inset-x-4 top-1 flex h-[38px] items-center justify-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
        공모집
      </h1>
      <div className="ml-auto flex items-center">
        <Link
          href="/alarm"
          aria-label="알림"
          className="relative flex size-[38px] items-center justify-center rounded-[14px]"
        >
          <Image
            src="/icons/home/bell.svg"
            alt=""
            width={15}
            height={17}
            className="h-[16.667px] w-[15px]"
          />
          <span className="absolute top-[7px] right-[7px] size-3 rounded-full border-2 border-white bg-color-coral-500" />
        </Link>
        <Link
          href="/contests/scraps"
          aria-label="스크랩한 공모전"
          className="flex size-[38px] items-center justify-center rounded-[14px]"
        >
          <Image
            src="/icons/home/bookmark.svg"
            alt=""
            width={12}
            height={17}
            className="h-[16.667px] w-[11.667px]"
          />
        </Link>
      </div>
    </header>
  );
}

function HeroCard({ contest }: { contest: RecommendedContest }) {
  return (
    <Link
      href={`/contests/${contest.id}`}
      aria-label={`${contest.title} 상세정보 보기`}
      className="relative block h-[268.5px] w-full overflow-hidden rounded-2xl bg-white shadow-[0_16px_4px_0_rgba(0,0,0,0),0_10px_4px_0_rgba(0,0,0,0.01),0_6px_3px_0_rgba(0,0,0,0.05),0_3px_3px_0_rgba(0,0,0,0.09),0_1px_1px_0_rgba(0,0,0,0.10)]"
    >
      <HeroImage src={contest.posterImageUrl} />
      <div className="absolute inset-0 bg-gradient-to-b from-color-gray-850/0 from-[10%] to-color-gray-850/90 to-[70%]" />
      <div className="absolute inset-x-4 bottom-7 flex flex-col gap-3 text-white">
        <h2 className="whitespace-pre-line text-[17px] leading-[1.35] font-bold">
          {contest.title}
        </h2>
        <div className="flex flex-col gap-1 text-xs leading-[1.35] font-semibold text-white/70">
          <p className="truncate">{contest.organizer}</p>
          <p className="truncate">{contest.period}</p>
        </div>
      </div>
    </Link>
  );
}

function HeroIndicator({ activeIndex, count }: { activeIndex: number; count: number }) {
  const indicatorCount = Math.max(1, Math.min(count, 3));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`추천 공모전 ${activeIndex + 1} / ${indicatorCount}`}
    >
      {Array.from({ length: indicatorCount }, (_, index) => (
        <span
          key={index}
          className={`size-1 rounded-full ${index === activeIndex ? "bg-color-gray-850" : "bg-color-gray-400"}`}
        />
      ))}
    </div>
  );
}

function HeroImage({ src }: { src: string }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-color-gray-250 text-[13px] font-semibold text-color-gray-500">
        이미지 준비 중
      </div>
    );
  }

  if (isExternalUrl(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-full w-full object-cover" />;
  }

  return <Image src={src} alt="" fill priority sizes="358px" className="object-cover" />;
}

function HeroStatus({ message }: { message: string }) {
  return (
    <section className="flex h-[268.5px] w-full items-center justify-center rounded-2xl bg-color-gray-150 px-6 text-center text-[13px] leading-[1.35] font-medium text-color-gray-650">
      {message}
    </section>
  );
}

function SearchBar() {
  return (
    <Link
      href="/contests"
      className="flex h-[43px] w-full items-center rounded-full bg-color-gray-150 px-4 py-3"
      aria-label="공모전 검색"
    >
      <span className="text-[15px] leading-[1.25] font-medium text-color-gray-850/40">
        원하는 공모전을 검색하세요
      </span>
      <span className="ml-auto flex size-[38px] items-center justify-center rounded-[14px]">
        <Image src="/icons/home/search.svg" alt="" width={20} height={20} className="size-5" />
      </span>
    </Link>
  );
}

function MatchingCard({
  applyDisabled,
  applyHref,
}: {
  applyDisabled: boolean;
  applyHref?: string;
}) {
  const applyButtonClassName =
    "flex min-w-0 flex-1 items-center justify-center rounded-[14px] bg-color-coral-500 px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold text-white disabled:opacity-60";

  return (
    <section className="flex flex-col gap-[10px] px-4 py-2">
      <h2 className="px-2 text-[20px] leading-[1.35] font-medium text-black">
        오늘의 AI 팀원 매칭
      </h2>

      <div className="relative h-[177px] overflow-hidden rounded-[14px] bg-color-khaki-50 px-[18px] py-4">
        <Image
          src="/images/home/matching-flag-shape.svg"
          alt=""
          width={234}
          height={265}
          className="pointer-events-none absolute top-[-72px] right-[-82px] h-[265px] w-[234px] rotate-[30.51deg]"
        />
        <Image
          src="/images/home/matching-character.png"
          alt=""
          width={180}
          height={182}
          className="pointer-events-none absolute right-[-23px] bottom-[-24px] h-[182px] w-[180px] rotate-[-12.72deg] object-cover"
        />

        <div className="relative z-10 flex h-full w-[190px] flex-col justify-between">
          <div className="flex flex-col gap-1">
            <span className="w-fit rounded-[10px] bg-color-coral-500 px-2 py-[5px] text-[13px] leading-[1.25] font-semibold text-white">
              팀원 매칭 마감까지
            </span>
            <p className="flex items-center gap-[3px] px-1 text-center text-color-coral-700">
              <span className="text-[30px] leading-[1.35] font-bold">01</span>
              <span className="text-[17px] leading-[1.35] font-semibold text-color-coral-600/50">
                :
              </span>
              <span className="text-[30px] leading-[1.35] font-bold">24</span>
              <span className="text-[17px] leading-[1.35] font-semibold text-color-coral-600/50">
                :
              </span>
              <span className="text-[30px] leading-[1.35] font-bold">30</span>
            </p>
          </div>

          <div className="flex w-[179px] flex-wrap gap-y-1 rounded-[10px] px-0.5 py-1 text-[15px] leading-[1.25] font-medium text-color-khaki-900">
            <span>지금&nbsp;</span>
            <span className="rounded-[10px] bg-color-gray-650/10 px-1">000</span>
            <span>명이</span>
            <span className="w-full">함께할 팀을 찾고 있어요!</span>
          </div>
        </div>
      </div>

      <div className="flex h-[50px] gap-[7px]">
        {applyDisabled || !applyHref ? (
          <button className={applyButtonClassName} disabled type="button">
            매칭 신청하기
          </button>
        ) : (
          <TeamMatchingApplyLink href={applyHref} className={applyButtonClassName}>
            매칭 신청하기
          </TeamMatchingApplyLink>
        )}
        <Link
          href="/team-matching"
          className="flex w-[102px] shrink-0 items-center justify-center rounded-[14px] border border-color-gray-650/50 px-2 py-[9px] text-[15px] leading-[1.25] font-semibold text-color-gray-650"
        >
          나의 매칭현황
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const hasHydrated = useHasAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const memberProfileQuery = useMemberProfileQuery();
  const recommendedContestsQuery = useRecommendedContestsQuery();
  const matchingEligibilityQuery = useMatchingEligibilityQuery();
  const todayMatchingApplicationQuery = useTodayMatchingApplicationQuery();
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const isUnauthorized =
    memberProfileQuery.error instanceof ApiError && memberProfileQuery.error.status === 401;
  const heroContests = useMemo(() => {
    return recommendedContestsQuery.data?.slice(0, 3) ?? [];
  }, [recommendedContestsQuery.data]);
  const safeActiveHeroIndex = heroContests.length > 0 ? activeHeroIndex % heroContests.length : 0;
  const heroContest = heroContests[safeActiveHeroIndex];
  const matchingApplyHref = getTeamMatchingApplyHref(
    matchingEligibilityQuery.data,
    todayMatchingApplicationQuery.data,
  );
  const isMatchingApplyDisabled =
    matchingEligibilityQuery.isLoading ||
    matchingEligibilityQuery.isError ||
    todayMatchingApplicationQuery.isLoading ||
    todayMatchingApplicationQuery.isError ||
    !matchingApplyHref;

  // 홈화면은 "1. 회원가입/로그인"을 마친 사용자가 도착하는 화면이라
  // (기능명세서 1.7 앱 시작하기 참고), 토큰이 없거나 만료된 경우 로그인
  // 화면으로 보낸다. hasHydrated 체크 없이 accessToken만 보면 localStorage
  // 복원 전 순간에 로그인된 사용자를 잘못 튕겨낼 수 있다.
  useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.replace("/login");
    }
  }, [hasHydrated, accessToken, router]);

  useEffect(() => {
    if (isUnauthorized) {
      router.replace("/login");
    }
  }, [isUnauthorized, router]);

  useEffect(() => {
    if (heroContests.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((currentIndex) => (currentIndex + 1) % heroContests.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [heroContests.length]);

  if (!hasHydrated || !accessToken || isUnauthorized) {
    return (
      <p className="px-4 py-16 text-center text-[13px] text-[#949494]">
        로그인이 필요해요. 로그인 페이지로 이동할게요...
      </p>
    );
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-850">
      <Header />

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto pb-4">
        <div className="flex flex-col items-center gap-2 px-4 pt-[14px]">
          {recommendedContestsQuery.isLoading ? (
            <HeroStatus message="추천 공모전을 불러오는 중이에요." />
          ) : recommendedContestsQuery.isError ? (
            <HeroStatus message="추천 공모전을 불러오지 못했어요." />
          ) : heroContest ? (
            <>
              <HeroCard contest={heroContest} />
              <HeroIndicator activeIndex={safeActiveHeroIndex} count={heroContests.length} />
            </>
          ) : (
            <HeroStatus message="추천 공모전이 아직 없어요." />
          )}
        </div>

        <div className="px-4 py-3">
          <SearchBar />
        </div>

        <MatchingCard applyDisabled={isMatchingApplyDisabled} applyHref={matchingApplyHref} />
      </div>

      <BottomNavigation />
    </main>
  );
}

function isExternalUrl(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}
