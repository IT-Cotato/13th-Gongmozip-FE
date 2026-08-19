import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";

export type CollaborationDistance = {
  collaborationPoint: number;
  maxCollaborationPoint: number;
  gaugePercent: number;
};

export type CollaborationDistanceHistory = {
  historyId: number;
  delta: number;
  reason: string;
  createdAt: string;
};

export type CollaborationDistanceHistoriesResponse = {
  histories: CollaborationDistanceHistory[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

type CollaborationDistanceHistoriesParams = {
  page: number;
  size?: number;
  sort?: string[];
};

const COLLABORATION_DISTANCE_HISTORIES_PAGE_SIZE = 20;

export const COLLABORATION_DISTANCE_QUERY_KEY = [
  "members",
  "me",
  "collaboration-distance",
] as const;

export const COLLABORATION_DISTANCE_HISTORIES_QUERY_KEY = [
  ...COLLABORATION_DISTANCE_QUERY_KEY,
  "histories",
] as const;

export const collaborationDistanceQueryKey = (accessToken: string | null) =>
  [...COLLABORATION_DISTANCE_QUERY_KEY, accessToken] as const;

export const collaborationDistanceHistoriesQueryKey = (
  accessToken: string | null,
  size = COLLABORATION_DISTANCE_HISTORIES_PAGE_SIZE,
  sort: string[] = [],
) => [...COLLABORATION_DISTANCE_HISTORIES_QUERY_KEY, accessToken, size, sort] as const;

export function fetchCollaborationDistance() {
  return apiFetch<CollaborationDistance>("/api/members/me/collaboration-distance");
}

export function fetchCollaborationDistanceHistories({
  page,
  size = COLLABORATION_DISTANCE_HISTORIES_PAGE_SIZE,
  sort = [],
}: CollaborationDistanceHistoriesParams) {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  sort.forEach((sortOption) => {
    searchParams.append("sort", sortOption);
  });

  return apiFetch<CollaborationDistanceHistoriesResponse>(
    `/api/members/me/collaboration-distance/histories?${searchParams.toString()}`,
  );
}

export function useCollaborationDistanceQuery(options: { enabled?: boolean } = {}) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    enabled: Boolean(accessToken) && (options.enabled ?? true),
    queryFn: fetchCollaborationDistance,
    queryKey: collaborationDistanceQueryKey(accessToken),
  });
}

export function useCollaborationDistanceHistoriesQuery(
  options: { enabled?: boolean; size?: number; sort?: string[] } = {},
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const size = options.size ?? COLLABORATION_DISTANCE_HISTORIES_PAGE_SIZE;
  const sort = options.sort ?? [];

  return useInfiniteQuery({
    enabled: Boolean(accessToken) && (options.enabled ?? true),
    queryFn: ({ pageParam }) =>
      fetchCollaborationDistanceHistories({
        page: pageParam,
        size,
        sort,
      }),
    queryKey: collaborationDistanceHistoriesQueryKey(accessToken, size, sort),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });
}
