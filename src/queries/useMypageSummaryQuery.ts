import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";
import type { CollaborationCharacterType } from "@/types/collaboration";

export type CollaborationCharacterKey = CollaborationCharacterType;

export type MypageSummary = {
  name: string;
  collaborationType: {
    characterKey: CollaborationCharacterKey;
    label: string;
    badgeColor: string;
  } | null;
  collaborativeDistanceMeters: number;
  stats: {
    profileManagementCount: number;
    projectManagementCount: number;
    scrapCount: number;
  };
};

export const mypageSummaryQueryKey = ["member", "mypage-summary"] as const;

export function fetchMypageSummary() {
  return apiFetch<MypageSummary>("/api/members/me/mypage-summary");
}

export function useMypageSummaryQuery() {
  return useQuery({
    queryKey: mypageSummaryQueryKey,
    queryFn: fetchMypageSummary,
  });
}
