import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { COMPLETED_PROJECTS_QUERY_KEY } from "./useCompletedProjectsQuery";

function deleteCompletedProject(teamId: number) {
  return apiFetch<void>(`/api/mypage/projects/completed/${teamId}`, {
    method: "DELETE",
  });
}

export function useDeleteCompletedProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompletedProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPLETED_PROJECTS_QUERY_KEY });
    },
  });
}
