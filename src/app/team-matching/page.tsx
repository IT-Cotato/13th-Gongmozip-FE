"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import BottomNavigation from "@/components/layout/BottomNavigation";
import { ApiError } from "@/lib/http";
import {
  type MatchingEligibility,
  type MatchingEligibilityReason,
  useMatchingEligibilityQuery,
} from "@/queries/useMatchingEligibilityQuery";
import {
  type MatchingApplicationStatus,
  type TodayMatchingApplication,
  useTodayMatchingApplicationQuery,
} from "@/queries/useTodayMatchingApplicationQuery";

const fallbackCountdownDigits = ["0", "0", "0", "0", "0", "0"];

const reasonPriority: MatchingEligibilityReason[] = [
  "PROFILE_REQUIRED",
  "SURVEY_REQUIRED",
  "ALREADY_APPLIED_TODAY",
  "MATCHING_RESTRICTED",
  "APPLICATION_DEADLINE_PASSED",
  "PROJECT_EVALUATION_NOT_READY",
  "REASSIGNMENT_PENDING",
];

const blockingReasonMessages: Record<MatchingEligibilityReason, string> = {
  PROFILE_REQUIRED: "프로필 작성 후 신청할 수 있어요.",
  SURVEY_REQUIRED: "협업 유형 검사 후 신청할 수 있어요.",
  APPLICATION_DEADLINE_PASSED: "오늘 매칭 신청이 마감됐어요.",
  ALREADY_APPLIED_TODAY: "오늘은 이미 매칭을 신청했어요.",
  MATCHING_RESTRICTED: "매칭 참여 제한 기간이에요.",
  PROJECT_EVALUATION_NOT_READY: "프로젝트 AI 평가 완료 후 신청할 수 있어요.",
  REASSIGNMENT_PENDING: "이전 매칭 응답 완료 후 신청할 수 있어요.",
};

const todayApplicationStatusMessages: Record<MatchingApplicationStatus, string> = {
  NONE: "아직 오늘 신청한 매칭이 없어요.",
  WAITING: "공모집이 팀원을 구성중이에요.",
  MATCHING: "공모집이 팀원을 구성중이에요.",
  PROPOSED: "오늘의 팀원 매칭 제안이 도착했어요.",
  MATCHED: "팀원 매칭이 완료됐어요.",
  CANCELED: "오늘 매칭 신청이 취소됐어요.",
  PASSED: "오늘 매칭을 패스했어요.",
  REASSIGN_PENDING: "다른 팀원들의 응답을 기다리는 중이에요.",
  FAILED: "오늘 매칭이 완료되지 않았어요.",
  EXPIRED: "오늘 매칭 응답 시간이 종료됐어요.",
};

function formatParticipantCount(participantCount?: number) {
  if (typeof participantCount !== "number") {
    return "---";
  }

  return participantCount.toLocaleString("ko-KR");
}

function getRemainingSeconds(deadlineAt?: string, baseTime = Date.now()) {
  if (!deadlineAt) {
    return 0;
  }

  const deadlineTime = new Date(deadlineAt).getTime();

  if (Number.isNaN(deadlineTime)) {
    return 0;
  }

  return Math.max(0, Math.floor((deadlineTime - baseTime) / 1000));
}

function getCountdownDigits(deadlineAt?: string, baseTime?: number) {
  const remainingSeconds = getRemainingSeconds(deadlineAt, baseTime);
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}${String(
    seconds,
  ).padStart(2, "0")}`.split("");
}

function getPrimaryReason(reasons: MatchingEligibilityReason[]) {
  return reasonPriority.find((reason) => reasons.includes(reason));
}

function getApplyHref(eligibility?: MatchingEligibility) {
  if (!eligibility) {
    return "/team-matching/profile";
  }

  const reasons = eligibility.reasons;

  if (eligibility.eligible || reasons.length === 0) {
    return "/team-matching/profile";
  }

  if (reasons.includes("PROFILE_REQUIRED") && reasons.includes("SURVEY_REQUIRED")) {
    return "/team-matching/modal-preview/all-required";
  }

  if (reasons.includes("PROFILE_REQUIRED")) {
    return "/team-matching/modal-preview/profile-required";
  }

  if (reasons.includes("SURVEY_REQUIRED")) {
    return "/team-matching/modal-preview/collaboration-test-required";
  }

  if (reasons.includes("ALREADY_APPLIED_TODAY")) {
    return "/team-matching/modal-preview/already-applied";
  }

  if (reasons.includes("MATCHING_RESTRICTED")) {
    return "/team-matching/modal-preview/weekly-limit";
  }

  return "/team-matching";
}

function hasActionableBlockingReason(eligibility?: MatchingEligibility) {
  if (!eligibility || eligibility.eligible) {
    return true;
  }

  return eligibility.reasons.some((reason) =>
    [
      "PROFILE_REQUIRED",
      "SURVEY_REQUIRED",
      "ALREADY_APPLIED_TODAY",
      "MATCHING_RESTRICTED",
    ].includes(reason),
  );
}

function getTodayApplicationStatusMessage(todayApplication?: TodayMatchingApplication) {
  if (!todayApplication) {
    return null;
  }

  if (!todayApplication.appliedToday) {
    return todayApplicationStatusMessages.NONE;
  }

  return todayApplicationStatusMessages[todayApplication.status];
}

function useCountdownDigits(deadlineAt?: string) {
  const [baseTime, setBaseTime] = useState(Date.now);

  useEffect(() => {
    if (!deadlineAt) {
      return;
    }

    const timerId = window.setInterval(() => {
      setBaseTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [deadlineAt]);

  return deadlineAt ? getCountdownDigits(deadlineAt, baseTime) : fallbackCountdownDigits;
}

function CountdownCard({ deadlineAt }: { deadlineAt?: string }) {
  const countdownDigits = useCountdownDigits(deadlineAt);

  return (
    <section className="mx-auto mt-4 flex h-[143px] w-[358px] max-w-[calc(100%-32px)] flex-col items-center gap-2 rounded-2xl bg-[#F9F8F4] p-4 text-center">
      <div className="flex items-start justify-center gap-[10px] rounded-[10px] bg-[#1F1F1F] px-2 py-[5px] text-[14px] font-bold leading-none text-white">
        팀원 매칭 마감까지
      </div>

      <div className="flex h-[49px] items-center justify-center gap-1 self-stretch">
        {countdownDigits.map((digit, index) => (
          <div className="contents" key={`${digit}-${index}`}>
            <span className="flex h-[49px] w-[42px] flex-col items-center justify-center gap-[10px] rounded-[5px] bg-white px-3 py-1 text-[36px] font-bold leading-none text-[#2A2A2A] shadow-[0_5px_1px_0_rgba(0,0,0,0),0_3px_1px_0_rgba(0,0,0,0.01),0_2px_1px_0_rgba(0,0,0,0.05),0_1px_1px_0_rgba(0,0,0,0.09)]">
              {digit}
            </span>
            {index === 1 || index === 3 ? (
              <span className="text-[28px] font-bold leading-none text-[#DFDFDF]">:</span>
            ) : null}
          </div>
        ))}
      </div>

      <p className="h-5 self-stretch text-center font-[Roboto] text-[13px] font-normal not-italic leading-[150%] text-[rgba(97,97,97,0.60)]">
        매일 오후 4시 매칭 결과 발표
      </p>
    </section>
  );
}

type InfoCardBaseProps = {
  title: string;
  description: string;
  descriptionValue?: string;
  tone: "coral" | "gray";
};

type InfoCardProps = InfoCardBaseProps & ({ href: string } | { href?: never });

function InfoCard({ href, title, description, descriptionValue, tone }: InfoCardProps) {
  const className = `mx-auto flex w-[358px] max-w-[calc(100%-32px)] items-center justify-between rounded-2xl px-5 py-4 ${
    tone === "coral" ? "bg-[#FFF1EE]" : "bg-[#F5F5F5]"
  } ${tone === "coral" ? "h-[74px]" : "h-[89px]"}`;

  const content = (
    <>
      <span className="min-w-0 text-left">
        <strong className="block text-left font-[Pretendard] text-[17px] font-medium not-italic leading-[135%] text-black">
          {title}
        </strong>
        <span className="mt-[3px] flex items-center gap-1 text-left font-[Pretendard] text-[13px] font-medium not-italic leading-[125%] text-[#949494]">
          <span className="whitespace-pre-line">{description}</span>
          {descriptionValue ? (
            <span className="font-[Roboto] text-[13px] font-semibold not-italic leading-[125%] text-[#616161]">
              {descriptionValue}
            </span>
          ) : null}
        </span>
      </span>

      {href ? <Image src="/icons/team-matching/icon-1.svg" alt="" width={20} height={20} /> : null}
    </>
  );

  if (href) {
    return (
      <Link className={className} href={href}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function FixedApplyButton({
  disabled,
  href,
  label,
}: {
  disabled?: boolean;
  href: string;
  label: string;
}) {
  const className = disabled
    ? "flex h-12 w-full items-center justify-center rounded-[14px] bg-[#DFDFDF] px-8 py-[9px] text-[18px] font-bold leading-none text-white"
    : "flex h-12 w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] text-[18px] font-bold leading-none text-white";

  if (disabled) {
    return (
      <button className={className} disabled type="button">
        {label}
      </button>
    );
  }

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

export default function TeamMatchingPage() {
  const { data: eligibility, error, isError, isLoading } = useMatchingEligibilityQuery();
  const {
    data: todayApplication,
    error: todayApplicationError,
    isError: isTodayApplicationError,
    isLoading: isTodayApplicationLoading,
  } = useTodayMatchingApplicationQuery();
  const participantCount = formatParticipantCount(eligibility?.participantCount);
  const alreadyAppliedToday = eligibility?.appliedToday || todayApplication?.appliedToday;
  const applyHref = alreadyAppliedToday
    ? "/team-matching/modal-preview/already-applied"
    : getApplyHref(eligibility);
  const primaryReason = eligibility ? getPrimaryReason(eligibility.reasons) : undefined;
  const canOpenApplyDestination = hasActionableBlockingReason(eligibility);
  const applyLabel = isLoading
    ? "확인 중..."
    : alreadyAppliedToday
      ? "신청 조건 확인하기"
      : primaryReason && !eligibility?.eligible
        ? "신청 조건 확인하기"
        : "매칭 신청하기";
  const isUnauthorized = error instanceof ApiError && error.status === 401;
  const isTodayApplicationUnauthorized =
    todayApplicationError instanceof ApiError && todayApplicationError.status === 401;
  const helperMessage = useMemo(() => {
    if (isTodayApplicationLoading) {
      return "매칭 신청 상태를 확인하고 있어요.";
    }

    if (!isTodayApplicationError && todayApplication) {
      return (
        getTodayApplicationStatusMessage(todayApplication) ?? "매칭 신청 상태를 확인해 주세요."
      );
    }

    if (isTodayApplicationError && !isTodayApplicationUnauthorized) {
      return "매칭 신청 상태를 불러오지 못했어요.";
    }

    if (isLoading) {
      return "신청 가능 여부를 확인하고 있어요.";
    }

    if (isError) {
      return isUnauthorized
        ? "로그인 후 매칭 신청 자격을 확인할 수 있어요."
        : "매칭 신청 자격을 불러오지 못했어요.";
    }

    if (eligibility?.eligible) {
      return "오늘 매칭 신청이 가능해요.";
    }

    return primaryReason
      ? blockingReasonMessages[primaryReason]
      : "매칭 신청 상태를 확인해 주세요.";
  }, [
    eligibility?.eligible,
    isError,
    isLoading,
    isTodayApplicationError,
    isTodayApplicationLoading,
    isTodayApplicationUnauthorized,
    isUnauthorized,
    primaryReason,
    todayApplication,
  ]);

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <header className="z-10 flex h-[46px] shrink-0 items-center justify-between self-stretch bg-white px-4 py-1">
          <span className="h-6 w-6" aria-hidden="true" />
          <h1 className="flex h-[38px] flex-col justify-center self-stretch text-center font-[Roboto] text-[17px] font-semibold not-italic leading-[135%] text-[#111111]">
            팀원 매칭
          </h1>
          <span className="h-6 w-6" aria-hidden="true" />
        </header>

        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto pb-6">
          <section className="pt-6 text-center">
            <div
              aria-label="팀원 매칭 캐릭터"
              className="mx-auto aspect-[357/139] h-[139px] w-[357px] max-w-[calc(100%-32px)]"
              role="img"
              style={{
                backgroundImage: 'url("/images/team-matching/teammatching.png")',
                backgroundPosition: "0px -110.006px",
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 257.669%",
              }}
            />

            <h2 className="mt-4 flex flex-col items-center gap-1 self-stretch text-center font-[Roboto] text-[22px] font-bold not-italic leading-[135%] text-[#1F1F1F]">
              <span className="flex h-[30px] items-center justify-center">
                지금{" "}
                <span className="mx-[4px] inline-flex h-[30px] items-center rounded-[6px] bg-[#EFEFEF] px-[5px]">
                  {participantCount}
                </span>{" "}
                명이
              </span>
              <span className="flex h-[30px] items-center justify-center">
                함께할 팀을 찾고 있어요!
              </span>
            </h2>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="flex items-center justify-center gap-[10px] rounded-full bg-[#F5F5F5] px-2 py-1 text-center font-[Pretendard] text-[13px] font-medium not-italic leading-[135%] text-[#616161]">
                # 개인별 협업 유형 분석
              </span>
              <span className="flex items-center justify-center gap-[10px] rounded-full bg-[#F5F5F5] px-2 py-1 text-center font-[Pretendard] text-[13px] font-medium not-italic leading-[135%] text-[#616161]">
                #개인 역량별 최적 조합
              </span>
            </div>
          </section>

          <CountdownCard deadlineAt={eligibility?.applicationDeadlineAt} />

          <div className="mt-6 h-[6px] w-[390px] max-w-full bg-[rgba(97,97,97,0.08)]" />

          <section className="mt-6 space-y-4">
            <InfoCard
              href="/team-matching/status"
              title="나의 매칭현황"
              description={helperMessage}
              tone="coral"
            />
            <InfoCard
              href="/team-matching/ai-notice"
              title="AI 분석 매칭 안내"
              description={`공모집의 AI 기반 팀매칭은\n어떻게 이루어지는지 알아보세요.`}
              tone="gray"
            />
          </section>
        </div>

        <div className="shrink-0 bg-white px-4 pb-3 pt-2">
          <FixedApplyButton
            disabled={isLoading || (isError && !isUnauthorized) || !canOpenApplyDestination}
            href={isUnauthorized ? "/login/email" : applyHref}
            label={isUnauthorized ? "로그인하기" : applyLabel}
          />
        </div>
      </div>
      <BottomNavigation />
    </main>
  );
}
