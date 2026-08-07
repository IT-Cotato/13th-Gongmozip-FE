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

// accessToken을 키에 포함시켜, 로그아웃 없이 다른 계정으로 로그인해도
// 이전 계정의 캐시된 데이터가 잠깐 보이는 일이 없도록 세션별로 캐시를 분리한다.
export const profileListQueryKey = (accessToken: string | null) =>
  ["profiles", "me", accessToken] as const;

export function fetchProfileList() {
  return apiFetch<ProfileListResponse>("/api/profiles");
}

export function useProfileListQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: profileListQueryKey(accessToken),
    queryFn: fetchProfileList,
    enabled: Boolean(accessToken),
  });
}
