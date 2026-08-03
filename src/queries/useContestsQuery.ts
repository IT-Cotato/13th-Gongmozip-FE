import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ContestCategory, ContestSummary } from "@/app/contests/_types";
import { apiFetch } from "@/lib/http";

export type ContestStatus = "UPCOMING" | "OPEN" | "CLOSED";

export type ContestSort = "deadlineAsc" | "deadlineDesc" | "newest" | "popular";

export type ContestsQueryParams = {
  keyword?: string;
  category?: ContestApiCategory;
  status?: ContestStatus;
  sort?: ContestSort;
  page?: number;
  size?: number;
};

export type ContestApiCategory =
  | "IT_AI_TECH"
  | "MARKETING_AD_BRANDING"
  | "PLANNING_IDEA"
  | "ART_DESIGN"
  | "DATA_ANALYSIS"
  | "PHOTO_VIDEO";

type ContestListItemResponse = {
  contestId: string;
  title: string;
  category: string;
  status: ContestStatus;
  hostName: string;
  thumbnailUrl: string | null;
  applyEndAt: string;
  daysRemaining: number;
};

export type ContestsResponse = {
  contests: ContestSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

type ContestListResponse = {
  contests: ContestListItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export const contestCategoryApiValues: Record<ContestCategory, ContestApiCategory | undefined> = {
  전체: undefined,
  "IT/AI/기술": "IT_AI_TECH",
  "마케팅/광고/브랜딩": "MARKETING_AD_BRANDING",
  "기획/아이디어": "PLANNING_IDEA",
  "미술/디자인": "ART_DESIGN",
  "데이터 분석": "DATA_ANALYSIS",
  "사진/영상": "PHOTO_VIDEO",
};

export const contestCategoryLabels: Record<string, ContestCategory> = {
  IT_AI_TECH: "IT/AI/기술",
  MARKETING_AD_BRANDING: "마케팅/광고/브랜딩",
  PLANNING_IDEA: "기획/아이디어",
  ART_DESIGN: "미술/디자인",
  DATA_ANALYSIS: "데이터 분석",
  PHOTO_VIDEO: "사진/영상",
};

export const contestsQueryKey = (params: ContestsQueryParams) => ["contests", params] as const;

export async function fetchContests(params: ContestsQueryParams = {}) {
  const searchParams = new URLSearchParams();

  addSearchParam(searchParams, "keyword", params.keyword);
  addSearchParam(searchParams, "category", params.category);
  addSearchParam(searchParams, "status", params.status);
  addSearchParam(searchParams, "sort", params.sort ?? "deadlineAsc");
  addSearchParam(searchParams, "page", params.page);
  addSearchParam(searchParams, "size", params.size);

  const queryString = searchParams.toString();
  const data = await apiFetch<ContestListResponse>(
    `/api/contests${queryString ? `?${queryString}` : ""}`,
  );

  return {
    ...data,
    contests: data.contests.map(mapContestListItem),
  } satisfies ContestsResponse;
}

export function useContestsQuery(
  params: ContestsQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: contestsQueryKey(params),
    queryFn: () => fetchContests(params),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

function addSearchParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value === undefined || value === "") {
    return;
  }

  searchParams.set(key, String(value));
}

function mapContestListItem(contest: ContestListItemResponse): ContestSummary {
  return {
    id: contest.contestId,
    title: contest.title,
    organizer: contest.hostName,
    category: contestCategoryLabels[contest.category] ?? contest.category,
    dDay: formatDday(contest.daysRemaining),
    viewCount: 0,
    posterImageUrl: contest.thumbnailUrl ?? "",
    isScrapped: false,
  };
}

function formatDday(daysRemaining: number) {
  if (daysRemaining <= 0) {
    return "D-Day";
  }

  return `D-${daysRemaining}`;
}
