"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import CancelConfirmationModal from "@/components/team-matching/CancelConfirmationModal";
import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import { getMatchingResultPublishAt } from "@/lib/matchingSchedule";
import { useMatchingEligibilityQuery } from "@/queries/useMatchingEligibilityQuery";
import { useMemberProfileQuery } from "@/queries/useMemberProfileQuery";
import {
  type TodayMatchingApplication,
  useTodayMatchingApplicationQuery,
} from "@/queries/useTodayMatchingApplicationQuery";

const fallbackCountdownDigits = ["0", "0", "0", "0", "0", "0"];

type TeamMatchingPoolViewProps = {
  showCancelAction?: boolean;
  showCancelModal?: boolean;
  todayApplication?: TodayMatchingApplication;
};

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

function getTimestamp(dateTime?: string | null) {
  if (!dateTime) {
    return undefined;
  }

  const timestamp = new Date(dateTime).getTime();

  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function getMatchingProgress(
  startAt?: string | null,
  endAt?: string | null,
  baseTime = Date.now(),
) {
  const startTime = getTimestamp(startAt);
  const endTime = getTimestamp(endAt);

  if (!startTime || !endTime || endTime <= startTime) {
    return 0;
  }

  const progress = ((baseTime - startTime) / (endTime - startTime)) * 100;

  return Math.min(100, Math.max(0, progress));
}

function isInMatchingResultCountdown(
  startAt?: string | null,
  endAt?: string | null,
  baseTime = Date.now(),
) {
  const startTime = getTimestamp(startAt);
  const endTime = getTimestamp(endAt);

  if (!startTime || !endTime) {
    return false;
  }

  return baseTime >= startTime && baseTime < endTime;
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

function useCurrentTime(shouldTick: boolean) {
  const [baseTime, setBaseTime] = useState(Date.now);

  useEffect(() => {
    if (!shouldTick) {
      return;
    }

    const timerId = window.setInterval(() => {
      setBaseTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [shouldTick]);

  return baseTime;
}

function useCountdownDigits(deadlineAt?: string, baseTime?: number) {
  return deadlineAt ? getCountdownDigits(deadlineAt, baseTime) : fallbackCountdownDigits;
}

function useCountdownGroups(deadlineAt?: string, baseTime?: number) {
  const countdownDigits = useCountdownDigits(deadlineAt, baseTime);

  return [
    { digits: countdownDigits.slice(0, 2), label: "시간" },
    { digits: countdownDigits.slice(2, 4), label: "분" },
    { digits: countdownDigits.slice(4, 6), label: "초" },
  ];
}

function MatchingCountdown({
  deadlineAt,
  memberName,
  now,
}: {
  deadlineAt?: string;
  memberName: string;
  now: number;
}) {
  const countdownGroups = useCountdownGroups(deadlineAt, now);

  return (
    <section className="relative mx-auto mt-9 flex w-full max-w-[358px] flex-col items-start gap-4 overflow-hidden rounded-2xl bg-[#F9F8F4] px-5 py-4 shadow-[0_16px_4px_0_rgba(0,0,0,0),0_10px_4px_0_rgba(0,0,0,0.01),0_6px_3px_0_rgba(0,0,0,0.05),0_3px_3px_0_rgba(0,0,0,0.09),0_1px_1px_0_rgba(0,0,0,0.10)]">
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-[58px] -top-[6px] h-[180px] w-[157px]"
        height={180}
        src="/images/team-matching/shape.svg"
        width={157}
      />

      <div className="relative z-10 flex w-full flex-col items-start gap-4">
        <h2 className="font-[Roboto] text-[17px] font-semibold leading-[135%] text-[#1F1F1F]">
          공모집이 {memberName}님을 위한
          <br />
          팀원을 아직 구성중이에요.
        </h2>

        <p className="text-center font-[Roboto] text-[12px] font-normal leading-[135%] text-[#949494]">
          매칭결과까지
        </p>

        <div className="mt-[-8px] w-full">
          <div className="flex h-[49px] w-full items-center justify-center gap-1">
            {countdownGroups.map(({ digits, label }, groupIndex) => (
              <div className="contents" key={label}>
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  {digits.map((digit, digitIndex) => (
                    <span
                      className="flex flex-[1_0_0] flex-col items-center justify-center gap-[10px] rounded-[5px] bg-white p-2 text-center font-[Roboto] text-[30px] font-bold leading-[135%] text-[#AC4A35] shadow-[0_5px_1px_0_rgba(0,0,0,0),0_3px_1px_0_rgba(0,0,0,0.01),0_2px_1px_0_rgba(0,0,0,0.05),0_1px_1px_0_rgba(0,0,0,0.09)]"
                      key={`${label}-${digitIndex}`}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                {groupIndex < countdownGroups.length - 1 ? (
                  <span className="font-[Roboto] text-[28px] font-bold leading-none text-[#DFAFA4]">
                    :
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-1.5 flex w-full items-start gap-1 text-center font-[Roboto] text-[12px] font-normal leading-[135%] text-[#949494]">
            {countdownGroups.map(({ label }, groupIndex) => (
              <div className="contents" key={label}>
                <div className="flex min-w-0 flex-1 gap-1">
                  <span className="flex-1" aria-hidden="true" />
                  <span className="flex-1 text-right">{label}</span>
                </div>
                {groupIndex < countdownGroups.length - 1 ? <span aria-hidden="true" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MatchingProgressBar({
  deadlineAt,
  matchingStartedAt,
  now,
}: {
  deadlineAt?: string;
  matchingStartedAt?: string | null;
  now: number;
}) {
  const progress = getMatchingProgress(matchingStartedAt, deadlineAt, now);

  return (
    <div
      aria-hidden="true"
      className="mx-auto mt-8 h-[6px] w-full max-w-[322px] overflow-hidden rounded-[90px] bg-[#D9D9D9]"
    >
      <div
        className="h-full rounded-[90px] bg-[#FFAD62] transition-[width] duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function TeamMatchingPoolView({
  showCancelAction = true,
  showCancelModal = false,
  todayApplication,
}: TeamMatchingPoolViewProps) {
  const { data: fetchedTodayApplication } = useTodayMatchingApplicationQuery({
    enabled: !todayApplication,
  });
  const { data: eligibility } = useMatchingEligibilityQuery();
  const { data: memberProfile } = useMemberProfileQuery();
  const currentTodayApplication = todayApplication ?? fetchedTodayApplication;
  const withdrawal = currentTodayApplication?.withdrawal;
  const canWithdraw = withdrawal?.withdrawable ?? true;
  const applicationDeadlineAt = eligibility?.applicationDeadlineAt ?? withdrawal?.deadlineAt;
  const deadlineAt = getMatchingResultPublishAt(applicationDeadlineAt);
  const now = useCurrentTime(Boolean(deadlineAt));
  const isMatchingResultCountdownActive = isInMatchingResultCountdown(
    applicationDeadlineAt,
    deadlineAt,
    now,
  );
  const memberName = memberProfile?.name?.trim() || "회원";

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[42px] z-0 h-auto w-full max-w-[390px] -translate-x-1/2"
        height={751}
        priority
        src="/icons/contests/Frame.svg"
        width={390}
      />

      <TeamMatchingHeader backHref="/team-matching" className="relative z-10 bg-white" />

      <div className="scrollbar-hidden relative min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <section className="relative z-10 pt-[51px] text-center">
          <h1 className="text-center font-[Roboto] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
            팀원 매칭중...
          </h1>
          <p className="mt-4 font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
            조금만 기다려주세요.
            <br />
            앱을 종료하거나 다른 화면으로 이동해도
            <br />
            매칭은 계속 진행됩니다.
            <br />
            매칭이 완료되면 알림으로 알려드립니다.
          </p>
          {showCancelAction && !isMatchingResultCountdownActive && canWithdraw ? (
            <Link
              className="mt-2 inline-flex text-center font-[Roboto] text-[13px] font-semibold leading-[125%] text-[#616161] underline"
              href="/team-matching/cancel"
            >
              매칭신청취소
            </Link>
          ) : null}
        </section>

        <div className="relative z-10 mt-[7px]">
          <Image
            alt="팀원 매칭을 기다리는 캐릭터들"
            className="mx-auto h-auto w-[313px] max-w-full"
            height={128}
            priority
            src="/icons/team-matching/matching_img.svg"
            width={313}
          />

          <MatchingProgressBar
            deadlineAt={deadlineAt}
            matchingStartedAt={applicationDeadlineAt}
            now={now}
          />
        </div>

        <MatchingCountdown deadlineAt={deadlineAt} memberName={memberName} now={now} />
      </div>

      <div className="relative z-10 shrink-0 bg-white px-4 pb-3 pt-2">
        <Link
          className="flex h-[51px] w-full shrink-0 items-center justify-center self-stretch rounded-[14px] border border-[rgba(97,97,97,0.50)] bg-white px-[10px] py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-[#616161]"
          href="/team-matching"
        >
          홈으로
        </Link>
      </div>

      {showCancelModal ? <CancelConfirmationModal /> : null}
    </main>
  );
}
