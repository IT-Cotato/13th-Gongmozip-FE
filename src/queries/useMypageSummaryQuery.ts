import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CollaborationCharacterType } from "@/types/collaboration";

export type CollaborationCharacterKey = CollaborationCharacterType;

export type MypageSummary = {
  character: {
    characterType: CollaborationCharacterKey;
    paletteCode: string;
  } | null;
  collaborationDistance: {
    current: number;
    max: number;
    progress: number;
  };
  ongoingProjectCount: number;
  completedProjectCount: number;
  reviewCount: number;
  scrapContestCount: number;
};

export const MYPAGE_SUMMARY_QUERY_KEY_PREFIX = ["mypage", "summary"] as const;

// accessToken을 키에 포함시켜, 로그아웃 없이 다른 계정으로 로그인해도
// 이전 계정의 캐시된 데이터가 잠깐 보이는 일이 없도록 세션별로 캐시를 분리한다.
export const mypageSummaryQueryKey = (accessToken: string | null) =>
  [...MYPAGE_SUMMARY_QUERY_KEY_PREFIX, accessToken] as const;

export function fetchMypageSummary() {
  return apiFetch<MypageSummary>("/api/mypage");
}

export function useMypageSummaryQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: mypageSummaryQueryKey(accessToken),
    queryFn: fetchMypageSummary,
    enabled: Boolean(accessToken),
  });
}
