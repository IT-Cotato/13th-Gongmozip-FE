import { useQuery } from "@tanstack/react-query";

import type { ContestDetail } from "@/app/contests/_types";
import { apiFetch } from "@/lib/http";
import { contestCategoryLabels, type ContestStatus } from "./useContestsQuery";

type ContestDetailResponse = {
  contestId: string | number;
  title: string;
  summary: string | null;
  description: string;
  category: string;
  status: ContestStatus | string;
  hostName: string;
  applyStartAt: string | null;
  applyEndAt: string;
  announcementAt: string | null;
  eligibilityText: string | null;
  prizeText: string | null;
  locationText: string | null;
  thumbnailUrl: string | null;
  detailImageUrls: string[] | null;
  sourceUrl: string | null;
  isTeamParticipation: boolean;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  daysRemaining: number;
  viewCount: number;
  isScrapped?: boolean;
};

export const contestDetailQueryKey = (contestId: string) => ["contest", contestId] as const;

export async function fetchContestDetail(contestId: string) {
  const data = await apiFetch<ContestDetailResponse>(
    `/api/contests/${encodeURIComponent(contestId)}`,
  );

  return mapContestDetail(data);
}

export function useContestDetailQuery(contestId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: contestDetailQueryKey(contestId),
    queryFn: () => fetchContestDetail(contestId),
    enabled: contestId.length > 0 && (options.enabled ?? true),
  });
}

function mapContestDetail(contest: ContestDetailResponse): ContestDetail {
  return {
    id: String(contest.contestId),
    title: contest.title,
    organizer: contest.hostName,
    category: contestCategoryLabels[contest.category] ?? contest.category,
    dDay: formatDday(contest.daysRemaining),
    viewCount: contest.viewCount,
    posterImageUrl: contest.thumbnailUrl ?? "",
    isScrapped: contest.isScrapped ?? false,
    applicationPeriod: formatPeriod(contest.applyStartAt, contest.applyEndAt),
    announcementDate: formatDateTime(contest.announcementAt),
    eligibility: contest.eligibilityText ?? "제한 없음",
    prize: contest.prizeText ?? "미정",
    location: contest.locationText ?? "미정",
    teamParticipation: formatTeamParticipation(
      contest.isTeamParticipation,
      contest.minTeamSize,
      contest.maxTeamSize,
    ),
    description: contest.description || contest.summary || "",
    websiteUrl: contest.sourceUrl ?? "",
    detailImageUrls: contest.detailImageUrls ?? [],
  };
}

function formatDday(daysRemaining: number) {
  if (daysRemaining <= 0) {
    return "D-Day";
  }

  return `D-${daysRemaining}`;
}

function formatPeriod(startAt: string | null, endAt: string) {
  const endDate = formatDate(endAt);

  if (!startAt) {
    return `- ${endDate}`;
  }

  return `${formatDate(startAt)} - ${endDate}`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "미정";
  }

  const dateParts = parseDateTime(value);

  if (!dateParts) {
    return value;
  }

  return `${dateParts.date} ${dateParts.time}`;
}

function formatDate(value: string) {
  return parseDateTime(value)?.date ?? value;
}

function parseDateTime(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;

  return {
    date: `${year}.${month}.${day}`,
    time: `${hour}:${minute}`,
  };
}

function formatTeamParticipation(
  isTeamParticipation: boolean,
  minTeamSize: number | null,
  maxTeamSize: number | null,
) {
  if (!isTeamParticipation) {
    return "개인 참가";
  }

  if (minTeamSize !== null && maxTeamSize !== null) {
    return `팀 참가 가능 (${minTeamSize}~${maxTeamSize}명)`;
  }

  if (minTeamSize !== null) {
    return `팀 참가 가능 (${minTeamSize}명 이상)`;
  }

  if (maxTeamSize !== null) {
    return `팀 참가 가능 (최대 ${maxTeamSize}명)`;
  }

  return "팀 참가 가능";
}
