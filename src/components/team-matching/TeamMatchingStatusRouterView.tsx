"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import TeamMatchingAcceptWaitingView from "@/components/team-matching/TeamMatchingAcceptWaitingView";
import TeamMatchingCompleteView from "@/components/team-matching/TeamMatchingCompleteView";
import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import TeamMatchingPassView from "@/components/team-matching/TeamMatchingPassView";
import TeamMatchingPoolView from "@/components/team-matching/TeamMatchingPoolView";
import TeamMatchingStatusEmptyView from "@/components/team-matching/TeamMatchingStatusEmptyView";
import TeamMatchingStatusResultView from "@/components/team-matching/TeamMatchingStatusResultView";
import TeamMatchingUnmatchedView from "@/components/team-matching/TeamMatchingUnmatchedView";
import { ApiError } from "@/lib/http";
import {
  type TodayMatchingApplication,
  useTodayMatchingApplicationQuery,
} from "@/queries/useTodayMatchingApplicationQuery";
import {
  type TodayMatchingResult,
  useTodayMatchingResultQuery,
} from "@/queries/useTodayMatchingResultQuery";
import { useTeamMatchingCompletionStore } from "@/stores/teamMatchingCompletionStore";

function StatusFeedbackView({
  actionHref,
  actionLabel,
  message,
  preferHistoryBack = false,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  message: string;
  preferHistoryBack?: boolean;
  title: string;
}) {
  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader
        backHref="/team-matching"
        preferHistoryBack={preferHistoryBack}
        title="나의 매칭현황"
      />

      <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
        <h1 className="font-[Pretendard] text-[20px] font-bold leading-[135%] text-[#1F1F1F]">
          {title}
        </h1>
        <p className="mt-3 whitespace-pre-line font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
          {message}
        </p>
        {actionHref && actionLabel ? (
          <Link
            className="mt-8 flex h-12 w-full max-w-[358px] items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] text-[18px] font-bold leading-none text-white"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </section>
    </main>
  );
}

function getMatchingCompletionId(todayMatchingResult: TodayMatchingResult) {
  if (typeof todayMatchingResult.matchingGroupId === "number") {
    return `group-${todayMatchingResult.matchingGroupId}`;
  }

  if (typeof todayMatchingResult.teamId === "number") {
    return `team-${todayMatchingResult.teamId}`;
  }

  if (typeof todayMatchingResult.applicationId === "number") {
    return `application-${todayMatchingResult.applicationId}`;
  }

  return null;
}

function isConfirmedMatching(todayMatchingResult: TodayMatchingResult) {
  return (
    todayMatchingResult.resultStatus === "MATCHED" &&
    (Boolean(todayMatchingResult.teamId) || todayMatchingResult.groupStatus === "CONFIRMED")
  );
}

function getApplicationStatusView(
  todayApplication: TodayMatchingApplication | undefined,
  preferHistoryBack = false,
) {
  if (!todayApplication?.appliedToday) {
    return null;
  }

  switch (todayApplication.status) {
    case "WAITING":
    case "MATCHING":
      return (
        <TeamMatchingPoolView
          preferHistoryBack={preferHistoryBack}
          showCancelAction={false}
          todayApplication={todayApplication}
        />
      );
    case "REASSIGN_PENDING":
      return (
        <TeamMatchingAcceptWaitingView
          preferHistoryBack={preferHistoryBack}
          showCancelAction={false}
          todayApplication={todayApplication}
        />
      );
    case "PASSED":
      return <TeamMatchingPassView preferHistoryBack={preferHistoryBack} />;
    default:
      return null;
  }
}

function useHasTeamMatchingCompletionHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const unsubscribeHydrate =
        useTeamMatchingCompletionStore.persist?.onHydrate(onStoreChange);
      const unsubscribeFinishHydration =
        useTeamMatchingCompletionStore.persist?.onFinishHydration(onStoreChange);

      return () => {
        unsubscribeHydrate?.();
        unsubscribeFinishHydration?.();
      };
    },
    () => useTeamMatchingCompletionStore.persist?.hasHydrated() ?? false,
    () => false,
  );
}

function ConfirmedMatchingStatusView({
  preferHistoryBack = false,
  todayMatchingResult,
}: {
  preferHistoryBack?: boolean;
  todayMatchingResult: TodayMatchingResult;
}) {
  const hasHydrated = useHasTeamMatchingCompletionHydrated();
  const hasSeenCompletion = useTeamMatchingCompletionStore((state) => state.hasSeenCompletion);
  const markCompletionAsSeen = useTeamMatchingCompletionStore(
    (state) => state.markCompletionAsSeen,
  );
  const preserveVisibleCompletion = useTeamMatchingCompletionStore(
    (state) => state.preserveVisibleCompletion,
  );
  const clearVisibleCompletion = useTeamMatchingCompletionStore(
    (state) => state.clearVisibleCompletion,
  );
  const visibleCompletionId = useTeamMatchingCompletionStore((state) => state.visibleCompletionId);
  const completionId = getMatchingCompletionId(todayMatchingResult);
  const hasSeenCurrentCompletion = completionId ? hasSeenCompletion(completionId) : false;
  const shouldShowCompletion =
    Boolean(completionId) &&
    hasHydrated &&
    (!hasSeenCurrentCompletion || visibleCompletionId === completionId);

  useEffect(() => {
    if (!completionId || !hasHydrated || hasSeenCompletion(completionId)) {
      return;
    }

    preserveVisibleCompletion(completionId);
    markCompletionAsSeen(completionId);

    return () => {
      clearVisibleCompletion(completionId);
    };
  }, [
    clearVisibleCompletion,
    completionId,
    hasHydrated,
    hasSeenCompletion,
    markCompletionAsSeen,
    preserveVisibleCompletion,
  ]);

  if (!hasHydrated) {
    return (
      <StatusFeedbackView
        message="완료된 매칭 상태를 확인하고 있어요."
        preferHistoryBack={preferHistoryBack}
        title="잠시만 기다려주세요"
      />
    );
  }

  if (shouldShowCompletion) {
    return <TeamMatchingCompleteView preferHistoryBack={preferHistoryBack} />;
  }

  return <TeamMatchingStatusEmptyView preferHistoryBack={preferHistoryBack} />;
}

function getStatusView(
  todayMatchingResult: TodayMatchingResult,
  todayApplication: TodayMatchingApplication | undefined,
  preferHistoryBack = false,
) {
  if (todayMatchingResult.resultStatus === "NOT_APPLIED") {
    return (
      getApplicationStatusView(todayApplication, preferHistoryBack) ?? (
        <TeamMatchingStatusEmptyView preferHistoryBack={preferHistoryBack} />
      )
    );
  }

  if (todayMatchingResult.resultStatus === "MATCHED") {
    if (isConfirmedMatching(todayMatchingResult)) {
      return (
        <ConfirmedMatchingStatusView
          preferHistoryBack={preferHistoryBack}
          todayMatchingResult={todayMatchingResult}
        />
      );
    }

    if (todayMatchingResult.myResponseStatus === "ACCEPTED") {
      return (
        <TeamMatchingAcceptWaitingView
          preferHistoryBack={preferHistoryBack}
          showCancelAction={false}
          todayMatchingResult={todayMatchingResult}
        />
      );
    }

    if (todayMatchingResult.myResponseStatus === "PASSED") {
      return <TeamMatchingPassView preferHistoryBack={preferHistoryBack} />;
    }

    return (
      <TeamMatchingStatusResultView
        preferHistoryBack={preferHistoryBack}
        todayMatchingResult={todayMatchingResult}
      />
    );
  }

  switch (todayMatchingResult.resultStatus) {
    case "NOT_PUBLISHED":
    case "PROCESSING":
      return (
        <TeamMatchingPoolView
          preferHistoryBack={preferHistoryBack}
          showCancelAction={false}
          todayApplication={todayApplication}
        />
      );
    case "UNMATCHED":
      return <TeamMatchingUnmatchedView preferHistoryBack={preferHistoryBack} />;
    case "WITHDRAWN":
      return <TeamMatchingPassView preferHistoryBack={preferHistoryBack} />;
    default:
      return <TeamMatchingStatusEmptyView preferHistoryBack={preferHistoryBack} />;
  }
}

export default function TeamMatchingStatusRouterView() {
  const { data: todayMatchingResult, error, isError, isLoading } = useTodayMatchingResultQuery();
  const {
    data: todayApplication,
    error: todayApplicationError,
    isError: isTodayApplicationError,
    isLoading: isTodayApplicationLoading,
  } = useTodayMatchingApplicationQuery();
  const isUnauthorized = error instanceof ApiError && error.status === 401;
  const isTodayApplicationUnauthorized =
    todayApplicationError instanceof ApiError && todayApplicationError.status === 401;

  if (isLoading || (isTodayApplicationLoading && !todayMatchingResult)) {
    return (
      <StatusFeedbackView
        message="오늘의 매칭 신청 상태를 확인하고 있어요."
        preferHistoryBack
        title="잠시만 기다려주세요"
      />
    );
  }

  if (isError || !todayMatchingResult) {
    const fallbackStatusView = getApplicationStatusView(todayApplication, true);

    if (fallbackStatusView) {
      return fallbackStatusView;
    }

    return (
      <StatusFeedbackView
        actionHref={isUnauthorized || isTodayApplicationUnauthorized ? "/login" : undefined}
        actionLabel={isUnauthorized || isTodayApplicationUnauthorized ? "로그인하기" : undefined}
        message={
          isUnauthorized || isTodayApplicationUnauthorized
            ? "로그인 후 나의 매칭현황을 확인할 수 있어요."
            : "매칭 신청 상태를 불러오지 못했어요.\n잠시 후 다시 시도해 주세요."
        }
        preferHistoryBack
        title="상태 확인 실패"
      />
    );
  }

  if (
    todayMatchingResult.resultStatus === "NOT_APPLIED" &&
    isTodayApplicationLoading &&
    !isTodayApplicationError
  ) {
    return (
      <StatusFeedbackView
        message="오늘의 매칭 신청 상태를 확인하고 있어요."
        preferHistoryBack
        title="잠시만 기다려주세요"
      />
    );
  }

  if (todayMatchingResult.resultStatus === "NOT_APPLIED" && isTodayApplicationError) {
    return (
      <StatusFeedbackView
        actionHref={isTodayApplicationUnauthorized ? "/login" : undefined}
        actionLabel={isTodayApplicationUnauthorized ? "로그인하기" : undefined}
        message={
          isTodayApplicationUnauthorized
            ? "로그인 후 나의 매칭현황을 확인할 수 있어요."
            : "매칭 신청 상태를 불러오지 못했어요.\n잠시 후 다시 시도해 주세요."
        }
        preferHistoryBack
        title="상태 확인 실패"
      />
    );
  }

  return getStatusView(todayMatchingResult, todayApplication, true);
}
