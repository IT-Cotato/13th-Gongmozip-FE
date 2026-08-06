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

export const mypageSummaryQueryKey = ["mypage", "summary"] as const;

export function fetchMypageSummary() {
  return apiFetch<MypageSummary>("/api/mypage");
}

export function useMypageSummaryQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: mypageSummaryQueryKey,
    queryFn: fetchMypageSummary,
    enabled: Boolean(accessToken),
  });
}
