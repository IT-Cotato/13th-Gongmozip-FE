import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type CompletedProject = {
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

function fetchCompletedProjects() {
  return apiFetch<CompletedProjectsResponse>("/api/mypage/projects/completed?size=50");
}

export function useCompletedProjectsQuery() {
  return useQuery({
    queryKey: COMPLETED_PROJECTS_QUERY_KEY,
    queryFn: fetchCompletedProjects,
  });
}
