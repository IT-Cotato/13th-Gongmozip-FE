import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";

export type ProfileListItem = {
  profileId: number;
  nickname: string;
  schoolName: string;
  grade: number;
  major: string;
  gpa: number;
  gpaScale: number;
  isPublic: boolean;
  updatedAt: string;
};

export type ProfileListResponse = {
  profiles: ProfileListItem[];
  profileCount: number;
};

export const profileListQueryKey = ["profiles", "me"] as const;

export function fetchProfileList() {
  return apiFetch<ProfileListResponse>("/api/profiles");
}

export function useProfileListQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: profileListQueryKey,
    queryFn: fetchProfileList,
    enabled: Boolean(accessToken),
  });
}
