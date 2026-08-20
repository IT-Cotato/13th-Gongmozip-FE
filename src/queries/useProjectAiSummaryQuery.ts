import { useMutation, useQuery, useQueryClient, type Query } from "@tanstack/react-query";
import { ApiError, apiFetch } from "@/lib/http";

export type ProjectAiSummaryStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | string;

export type ProjectAiSummary = {
  summary: string;
  status: ProjectAiSummaryStatus;
  generatedAt: string | null;
};

export const projectAiSummaryQueryKey = (profileId: string, projectId: number) =>
  ["profiles", profileId, "projects", projectId, "ai-summary"] as const;

type ProjectAiSummaryRefetchInterval =
  | number
  | false
  | ((
      query: Query<
        ProjectAiSummary,
        Error,
        ProjectAiSummary,
        ReturnType<typeof projectAiSummaryQueryKey>
      >,
    ) => number | false | undefined);

function projectAiSummaryPath(profileId: string, projectId: number) {
  return `/api/profiles/${encodeURIComponent(profileId)}/projects/${projectId}/ai-summary`;
}

function fetchProjectAiSummary(profileId: string, projectId: number) {
  return apiFetch<ProjectAiSummary>(projectAiSummaryPath(profileId, projectId));
}

function generateProjectAiSummary({
  profileId,
  projectId,
}: {
  profileId: string;
  projectId: number;
}) {
  return apiFetch<void>(projectAiSummaryPath(profileId, projectId), { method: "POST" });
}

export function useProjectAiSummaryQuery(
  profileId: string,
  projectId: number,
  options: { enabled?: boolean; refetchInterval?: ProjectAiSummaryRefetchInterval } = {},
) {
  return useQuery({
    queryKey: projectAiSummaryQueryKey(profileId, projectId),
    queryFn: () => fetchProjectAiSummary(profileId, projectId),
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403, 404].includes(error.status)) return false;
      return failureCount < 1;
    },
  });
}

// AI 요약 (재)생성을 요청한다. 실제 요약 텍스트는 비동기로 만들어지므로, 이 요청이
// 성공한 뒤에는 useProjectAiSummaryQuery를 폴링(refetchInterval)해 상태(PENDING/
// PROCESSING -> COMPLETED/FAILED)가 끝날 때까지 지켜봐야 한다.
export function useGenerateProjectAiSummaryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateProjectAiSummary,
    onSuccess: (_data, { profileId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectAiSummaryQueryKey(profileId, projectId) });
    },
  });
}
