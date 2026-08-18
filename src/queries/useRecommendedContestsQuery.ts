import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";
import { getContestCategoryLabel } from "./useContestsQuery";

export type RecommendedContest = {
  id: string;
  title: string;
  organizer: string;
  category: string;
  period: string;
  posterImageUrl: string;
  viewCount: number;
  isScrapped: boolean;
};

type ApiRecord = Record<string, unknown>;

export const recommendedContestsQueryKey = (accessToken: string | null) =>
  ["recommendations", "contests", accessToken] as const;

async function fetchRecommendedContests() {
  const data = await apiFetch<unknown>("/api/recommendations/contests");

  return extractRecommendedContestRows(data)
    .map(mapRecommendedContest)
    .filter((contest): contest is RecommendedContest => contest !== null);
}

export function useRecommendedContestsQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: recommendedContestsQueryKey(accessToken),
    queryFn: fetchRecommendedContests,
    enabled: Boolean(accessToken),
  });
}

function extractRecommendedContestRows(data: unknown): ApiRecord[] {
  if (Array.isArray(data)) {
    return data.filter(isApiRecord);
  }

  if (!isApiRecord(data)) {
    return [];
  }

  const rows =
    getArray(data, "contests") ??
    getArray(data, "recommendations") ??
    getArray(data, "recommendedContests") ??
    getArray(data, "content") ??
    getArray(data, "items") ??
    getArray(data, "results") ??
    [];

  return rows.filter(isApiRecord);
}

function mapRecommendedContest(row: ApiRecord): RecommendedContest | null {
  const contest = getRecord(row, "contest") ?? getRecord(row, "contestInfo") ?? row;
  const id = getValue(contest, "contestId", "id") ?? getValue(row, "contestId", "id");

  if (id === undefined || id === null) {
    return null;
  }

  const category = getString(contest, "category", "contestCategory") ?? "";

  return {
    id: String(id),
    title: getString(contest, "title", "contestTitle", "name") ?? "제목 없음",
    organizer:
      getString(contest, "hostName", "organizer", "organizerName", "host", "organization") ?? "",
    category: getContestCategoryLabel(category),
    period:
      getString(contest, "period", "applicationPeriod") ??
      formatPeriod(
        getString(contest, "applyStartAt", "applicationStartAt", "startAt", "startDate"),
        getString(contest, "applyEndAt", "applicationEndAt", "endAt", "endDate"),
      ),
    posterImageUrl:
      getString(contest, "thumbnailUrl", "posterImageUrl", "imageUrl", "posterUrl") ?? "",
    viewCount: getNumber(contest, "viewCount", "views", "hitCount", "hits", "readCount") ?? 0,
    isScrapped: getBoolean(contest, "isScrapped", "scrapped") ?? false,
  };
}

function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getArray(record: ApiRecord, key: string) {
  const value = record[key];

  return Array.isArray(value) ? value : undefined;
}

function getRecord(record: ApiRecord, key: string) {
  const value = record[key];

  return isApiRecord(value) ? value : undefined;
}

function getValue(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function getString(record: ApiRecord, ...keys: string[]) {
  const value = getValue(record, ...keys);

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
}

function getNumber(record: ApiRecord, ...keys: string[]) {
  const value = getValue(record, ...keys);

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsedValue = Number(value.replaceAll(",", ""));

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function getBoolean(record: ApiRecord, ...keys: string[]) {
  const value = getValue(record, ...keys);

  return typeof value === "boolean" ? value : undefined;
}

function formatPeriod(startAt: string | undefined, endAt: string | undefined) {
  if (!endAt) {
    return "";
  }

  const endDate = formatKoreanDate(endAt);

  if (!startAt) {
    return `~ ${endDate}`;
  }

  return `${formatKoreanDate(startAt)} ~ ${endDate}`;
}

function formatKoreanDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;

  return `${year}년 ${month}월 ${day}일`;
}
