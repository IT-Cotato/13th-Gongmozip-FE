import { useQueries, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type ProfilePreview = {
  profileId: number;
  nickname: string;
  schoolName: string;
  grade: number;
  major: string;
  secondaryMajor: string | null;
  gpa: number;
  gpaScale: number;
  projectSummaries: { projectId: number; projectName: string; summary: string }[];
  awardCount: number;
  certificationCount: number;
  isPublic: boolean;
};

export const profilePreviewQueryKey = (profileId: string) =>
  ["profiles", profileId, "preview"] as const;

export function fetchProfilePreview(profileId: string) {
  return apiFetch<ProfilePreview>(`/api/profiles/${encodeURIComponent(profileId)}/preview`);
}

export function useProfilePreviewQuery(profileId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: profilePreviewQueryKey(profileId),
    queryFn: () => fetchProfilePreview(profileId),
    enabled: profileId.length > 0 && (options.enabled ?? true),
  });
}

export function useProfilePreviewsQuery(profileIds: string[]) {
  const uniqueProfileIds = Array.from(new Set(profileIds.filter(Boolean)));

  return useQueries({
    queries: uniqueProfileIds.map((profileId) => ({
      queryKey: profilePreviewQueryKey(profileId),
      queryFn: () => fetchProfilePreview(profileId),
    })),
  });
}
