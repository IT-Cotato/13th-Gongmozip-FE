import { useQuery } from "@tanstack/react-query";
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

function fetchOngoingProjects() {
  return apiFetch<OngoingProjectsResponse>("/api/mypage/projects/ongoing?size=50");
}

export function useOngoingProjectsQuery() {
  return useQuery({
    queryKey: ["member", "projects", "ongoing"],
    queryFn: fetchOngoingProjects,
  });
}
