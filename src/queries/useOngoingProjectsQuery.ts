import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type ProjectTeammate = {
  id: string;
  profileImageUrl: string | null;
};

export type OngoingProject = {
  id: string;
  projectName: string;
  startDate: string;
  teammates: ProjectTeammate[];
};

function fetchOngoingProjects() {
  return apiFetch<OngoingProject[]>("/api/members/me/projects/ongoing");
}

export function useOngoingProjectsQuery() {
  return useQuery({
    queryKey: ["member", "projects", "ongoing"],
    queryFn: fetchOngoingProjects,
  });
}
