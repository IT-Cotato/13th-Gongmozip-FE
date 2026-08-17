import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";

export type CollaborationDistance = {
  collaborationPoint: number;
  maxCollaborationPoint: number;
  gaugePercent: number;
};

export const COLLABORATION_DISTANCE_QUERY_KEY = [
  "members",
  "me",
  "collaboration-distance",
] as const;

// accessToken을 키에 포함시켜, 로그아웃 없이 다른 계정으로 로그인해도 이전 계정의
// 캐시된 협업거리 데이터가 잠깐 보이는 일이 없도록 세션별로 캐시를 분리한다.
// invalidateQueries는 prefix 기준으로 매칭되므로, COLLABORATION_DISTANCE_QUERY_KEY만으로
// 호출하는 useWithdrawMatchingApplicationMutation의 무효화는 그대로 유효하다.
export const collaborationDistanceQueryKey = (accessToken: string | null) =>
  [...COLLABORATION_DISTANCE_QUERY_KEY, accessToken] as const;

export function fetchCollaborationDistance() {
  return apiFetch<CollaborationDistance>("/api/members/me/collaboration-distance");
}

export function useCollaborationDistanceQuery(options: { enabled?: boolean } = {}) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    enabled: options.enabled ?? true,
    queryFn: fetchCollaborationDistance,
    queryKey: collaborationDistanceQueryKey(accessToken),
  });
}
