import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { COMPLETED_PROJECTS_QUERY_KEY, type CompletedProject } from "./useCompletedProjectsQuery";

function deleteCompletedProject(projectId: string) {
  return apiFetch<void>(`/api/members/me/projects/completed/${projectId}`, {
    method: "DELETE",
  });
}

export function useDeleteCompletedProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompletedProject,
    onSuccess: (_data, projectId) => {
      queryClient.setQueryData<CompletedProject[]>(COMPLETED_PROJECTS_QUERY_KEY, (current) =>
        current?.filter((project) => project.id !== projectId),
      );
    },
  });
}
