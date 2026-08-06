import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type CompletedProject = {
  teamId: number;
  contestId: number;
  contestTitle: string;
  completedAt: string;
  medal: string;
  award: string;
};

type CompletedProjectsResponse = {
  projects: CompletedProject[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export const COMPLETED_PROJECTS_QUERY_KEY = ["member", "projects", "completed"] as const;

const PAGE_SIZE = 50;

function fetchCompletedProjects(page: number) {
  return apiFetch<CompletedProjectsResponse>(
    `/api/mypage/projects/completed?page=${page}&size=${PAGE_SIZE}`,
  );
}

export function useCompletedProjectsQuery() {
  return useInfiniteQuery({
    queryKey: COMPLETED_PROJECTS_QUERY_KEY,
    queryFn: ({ pageParam }) => fetchCompletedProjects(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}
