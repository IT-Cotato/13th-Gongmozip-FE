"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import {
  type MatchingGroupResponses,
  useMatchingGroupResponsesQuery,
} from "@/queries/useMatchingGroupResponsesQuery";
import {
  type TodayMatchingApplication,
  useTodayMatchingApplicationQuery,
} from "@/queries/useTodayMatchingApplicationQuery";
import {
  type TodayMatchingResult,
  todayMatchingResultQueryKey,
  useTodayMatchingResultQuery,
} from "@/queries/useTodayMatchingResultQuery";

type TeamMatchingAcceptWaitingViewProps = {
  showCancelAction?: boolean;
  todayApplication?: TodayMatchingApplication;
  todayMatchingResult?: TodayMatchingResult;
};

const fallbackTotalMemberCount = 4;
const fallbackCompletedResponseCount = 3;

function getCompletedResponseCount(
  groupResponses: MatchingGroupResponses | undefined,
  todayMatchingResult: TodayMatchingResult | undefined,
) {
  const members = groupResponses?.members ?? todayMatchingResult?.members;

  if (!members) {
    return fallbackCompletedResponseCount;
  }

  return members.filter((member) => member.responseStatus !== "PENDING").length;
}

export default function TeamMatchingAcceptWaitingView({
  showCancelAction = true,
  todayApplication,
  todayMatchingResult,
}: TeamMatchingAcceptWaitingViewProps) {
  const queryClient = useQueryClient();
  const { data: fetchedTodayApplication } = useTodayMatchingApplicationQuery({
    enabled: !todayApplication,
  });
  const { data: fetchedTodayMatchingResult } = useTodayMatchingResultQuery({
    enabled: !todayMatchingResult,
  });
  const currentTodayMatchingResult = todayMatchingResult ?? fetchedTodayMatchingResult;
  const matchingGroupId = currentTodayMatchingResult?.matchingGroupId;
  const { data: groupResponses } = useMatchingGroupResponsesQuery(matchingGroupId, {
    enabled: currentTodayMatchingResult?.myResponseStatus === "ACCEPTED",
    refetchInterval: 5000,
  });
  const currentTodayApplication = todayApplication ?? fetchedTodayApplication;
  const canWithdraw = currentTodayApplication?.withdrawal.withdrawable ?? true;
  const totalMemberCount =
    groupResponses?.proposedTeamSize ??
    currentTodayMatchingResult?.teamSize ??
    currentTodayMatchingResult?.members.length ??
    fallbackTotalMemberCount;
  const normalizedTotalMemberCount = Math.max(totalMemberCount, 1);
  const completedResponseCount = getCompletedResponseCount(groupResponses, currentTodayMatchingResult);
  const completionPercent = `${Math.min(
    (completedResponseCount / normalizedTotalMemberCount) * 100,
    100,
  )}%`;

  useEffect(() => {
    if (!groupResponses || groupResponses.groupStatus === "PROPOSED") {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: todayMatchingResultQueryKey });
  }, [groupResponses, queryClient]);

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

      <TeamMatchingHeader
        backHref="/team-matching/status"
        className="relative z-10 bg-white"
        title="나의 매칭현황"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-6">
        <section className="pt-[54px] text-center">
          <h1 className="font-[Pretendard] text-[20px] font-bold leading-[135%] text-[#1F1F1F]">
            다른 팀원들의 응답을 기다리는 중...
          </h1>
          <p className="mt-[17px] font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
            조금만 기다려주세요.
            <br />
            매칭이 완료되면 알림으로 알려드립니다.
          </p>
          {showCancelAction ? (
            canWithdraw ? (
              <Link
                className="mt-2 inline-flex text-center font-[Roboto] text-[13px] font-semibold leading-[125%] text-[#616161] underline"
                href="/team-matching/cancel"
              >
                매칭신청취소
              </Link>
            ) : (
              <span className="mt-2 inline-flex text-center font-[Roboto] text-[13px] font-semibold leading-[125%] text-[#949494]">
                매칭신청취소 불가
              </span>
            )
          ) : null}
        </section>

        <div className="mt-[51px]">
          <Image
            alt="팀원들의 응답을 기다리는 캐릭터들"
            className="mx-auto h-auto w-[313px] max-w-full"
            height={128}
            priority
            src="/icons/team-matching/matching_img.svg"
            width={313}
          />

          <div
            aria-hidden="true"
            className="mx-auto mt-8 flex h-[6px] w-full max-w-[322px] flex-col items-start gap-[10px] overflow-hidden rounded-[90px] bg-[#D9D9D9]"
          >
            <div
              className="h-[6px] shrink-0 rounded-[90px] bg-[#FFAD62]"
              style={{ width: completionPercent }}
            />
          </div>
        </div>

        <p className="mx-auto mt-[54.09px] inline-flex items-center justify-center rounded-[85px] bg-[#FFE4DE] px-4 py-1 text-center font-[Pretendard] text-[12px] font-semibold leading-[135%] text-[#AC4A35]">
          {totalMemberCount}명 중에 {completedResponseCount}명이 응답 완료했습니다.
        </p>

        <div className="flex-1" />

        <Link
          className="flex h-[51px] w-full shrink-0 items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] text-center text-[18px] font-bold leading-none text-white"
          href="/team-matching"
        >
          나가기
        </Link>
      </div>
    </main>
  );
}
