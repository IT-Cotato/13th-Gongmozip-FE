import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type OngoingProject = {
  teamId: number;
  contestId: number;
  contestTitle: string;
  contestImageUrl: string | null;
  startedAt: string;
  deadline: string;
  memberCount: number;
};

type OngoingProjectsResponse = {
  projects: OngoingProject[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const PAGE_SIZE = 50;

function fetchOngoingProjects(page: number) {
  return apiFetch<OngoingProjectsResponse>(
    `/api/mypage/projects/ongoing?page=${page}&size=${PAGE_SIZE}`,
  );
}

export function useOngoingProjectsQuery() {
  return useInfiniteQuery({
    queryKey: ["member", "projects", "ongoing"],
    queryFn: ({ pageParam }) => fetchOngoingProjects(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}
