import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";

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
  contestId: string | number;
  title: string;
  category: string;
  status: ContestStatus;
  hostName: string;
  thumbnailUrl: string | null;
  applyEndAt: string;
  daysRemaining: number;
  view?: number | string | null;
  viewCount?: number | string | null;
  views?: number | string | null;
  viewNum?: number | string | null;
  hitCount?: number | string | null;
  hits?: number | string | null;
  readCount?: number | string | null;
  view_count?: number | string | null;
  viewCnt?: number | string | null;
  view_cnt?: number | string | null;
  hit_count?: number | string | null;
  hitCnt?: number | string | null;
  hit_cnt?: number | string | null;
  read_count?: number | string | null;
  readCnt?: number | string | null;
  read_cnt?: number | string | null;
  viewsCount?: number | string | null;
  views_count?: number | string | null;
  hitsCount?: number | string | null;
  hits_count?: number | string | null;
  isScrapped?: boolean;
};

export type ContestViewCountFields = {
  view?: number | string | null;
  viewCount?: number | string | null;
  views?: number | string | null;
  viewNum?: number | string | null;
  hitCount?: number | string | null;
  hits?: number | string | null;
  readCount?: number | string | null;
  view_count?: number | string | null;
  viewCnt?: number | string | null;
  view_cnt?: number | string | null;
  hit_count?: number | string | null;
  hitCnt?: number | string | null;
  hit_cnt?: number | string | null;
  read_count?: number | string | null;
  readCnt?: number | string | null;
  read_cnt?: number | string | null;
  viewsCount?: number | string | null;
  views_count?: number | string | null;
  hitsCount?: number | string | null;
  hits_count?: number | string | null;
};

const contestViewCountKeys = [
  "view",
  "viewCount",
  "views",
  "viewNum",
  "view_count",
  "viewCnt",
  "view_cnt",
  "viewsCount",
  "views_count",
  "hitCount",
  "hits",
  "hit_count",
  "hitCnt",
  "hit_cnt",
  "hitsCount",
  "hits_count",
  "readCount",
  "read_count",
  "readCnt",
  "read_cnt",
] as const;

const contestViewCountContainerKeys = [
  "contest",
  "contestInfo",
  "metrics",
  "stats",
  "statistics",
  "counts",
  "contestMetrics",
  "contestStats",
  "contestStatistics",
] as const;

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
  IDEA_PLANNING: "기획/아이디어",
  PLANNING_IDEA: "기획/아이디어",
  ART_DESIGN: "미술/디자인",
  DATA_ANALYSIS: "데이터 분석",
  PHOTO_VIDEO: "사진/영상",
};

export const contestsQueryKey = (params: ContestsQueryParams) => ["contests", params] as const;
export const infiniteContestsQueryKey = (params: ContestsQueryParams) =>
  ["contests", "infinite", params] as const;

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

export function useInfiniteContestsQuery(
  params: ContestsQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  return useInfiniteQuery({
    queryKey: infiniteContestsQueryKey(params),
    queryFn: ({ pageParam }) => fetchContests({ ...params, page: pageParam }),
    initialPageParam: params.page ?? 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: options.enabled ?? true,
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
    id: String(contest.contestId),
    title: contest.title,
    organizer: contest.hostName,
    category: contestCategoryLabels[contest.category] ?? contest.category,
    dDay: formatDday(contest.daysRemaining),
    viewCount: getContestViewCount(contest),
    posterImageUrl: contest.thumbnailUrl ?? "",
    isScrapped: contest.isScrapped ?? false,
  };
}

export function getContestViewCount(contest: ContestViewCountFields) {
  const count = getContestViewCountFromRecord(contest as Record<string, unknown>);

  return count ?? 0;
}

function parseCount(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsedValue = Number(value.replaceAll(",", ""));

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function getContestViewCountFromRecord(record: Record<string, unknown>) {
  for (const key of contestViewCountKeys) {
    const count = parseCount(record[key] as number | string | null | undefined);

    if (count !== undefined) {
      return count;
    }
  }

  for (const key of contestViewCountContainerKeys) {
    const value = record[key];

    if (isRecord(value)) {
      const count = getContestViewCountFromRecord(value);

      if (count !== undefined) {
        return count;
      }
    }
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatDday(daysRemaining: number) {
  if (daysRemaining <= 0) {
    return "D-Day";
  }

  return `D-${daysRemaining}`;
}
