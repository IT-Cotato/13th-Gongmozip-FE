import { useEffect, useMemo, useState } from "react";

import { getMatchingResultPublishAt } from "@/lib/matchingSchedule";
import type { MatchingParticipantCount } from "@/queries/useMatchingParticipantCountQuery";

export const fallbackCountdownDigits = ["0", "0", "0", "0", "0", "0"];

export const countdownLabels = {
  application: "팀원 매칭 마감까지",
  publish: "매칭 결과 발표까지",
  next: "다음 매칭 신청 접수 중",
} as const;

export function formatParticipantCount(participantCount?: number) {
  if (typeof participantCount !== "number") {
    return "---";
  }

  return participantCount.toLocaleString("ko-KR");
}

function getTimestamp(dateTime?: string) {
  if (!dateTime) {
    return null;
  }

  const timestamp = new Date(dateTime).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
}

function getRemainingSeconds(deadlineAt?: string, baseTime = Date.now()) {
  if (!deadlineAt) {
    return 0;
  }

  const deadlineTime = getTimestamp(deadlineAt);

  if (deadlineTime === null) {
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

function getServerOffsetMs(serverTime?: string) {
  const serverTimestamp = getTimestamp(serverTime);

  return serverTimestamp === null ? 0 : serverTimestamp - Date.now();
}

function getCountdownState(
  participantCountData?: MatchingParticipantCount,
  fallbackDeadlineAt?: string,
  nowOnServer = Date.now(),
) {
  if (!participantCountData) {
    return {
      deadlineAt: fallbackDeadlineAt,
      label: countdownLabels.application,
    };
  }

  const applicationDeadlineAt = participantCountData.applicationDeadlineAt;
  const resultPublishAt =
    getMatchingResultPublishAt(applicationDeadlineAt) ?? participantCountData.resultPublishAt;
  const deadlineLeftMs = (getTimestamp(applicationDeadlineAt) ?? 0) - nowOnServer;
  const publishLeftMs = (getTimestamp(resultPublishAt) ?? 0) - nowOnServer;

  if (deadlineLeftMs > 0) {
    return {
      deadlineAt: applicationDeadlineAt,
      label: countdownLabels.application,
    };
  }

  if (publishLeftMs > 0) {
    return {
      deadlineAt: resultPublishAt,
      label: countdownLabels.publish,
    };
  }

  return {
    deadlineAt: undefined,
    label: countdownLabels.next,
  };
}

export function useCountdownState(
  participantCountData?: MatchingParticipantCount,
  fallbackDeadlineAt?: string,
) {
  const serverOffsetMs = useMemo(
    () => getServerOffsetMs(participantCountData?.serverTime),
    [participantCountData?.serverTime],
  );
  const [baseTime, setBaseTime] = useState(Date.now);

  useEffect(() => {
    if (!participantCountData && !fallbackDeadlineAt) {
      return;
    }

    const timerId = window.setInterval(() => {
      setBaseTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [fallbackDeadlineAt, participantCountData]);

  const nowOnServer = baseTime + serverOffsetMs;
  const countdownState = getCountdownState(participantCountData, fallbackDeadlineAt, nowOnServer);

  return {
    label: countdownState.label,
    digits: countdownState.deadlineAt
      ? getCountdownDigits(countdownState.deadlineAt, nowOnServer)
      : fallbackCountdownDigits,
  };
}
