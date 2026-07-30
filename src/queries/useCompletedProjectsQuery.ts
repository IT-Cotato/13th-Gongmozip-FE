import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type CompletedProject = {
  id: string;
  projectName: string;
  startDate: string;
  endDate: string;
};

export const COMPLETED_PROJECTS_QUERY_KEY = ["member", "projects", "completed"] as const;

function fetchCompletedProjects() {
  return apiFetch<CompletedProject[]>("/api/members/me/projects/completed");
}

export function useCompletedProjectsQuery() {
  return useQuery({
    queryKey: COMPLETED_PROJECTS_QUERY_KEY,
    queryFn: fetchCompletedProjects,
  });
}
