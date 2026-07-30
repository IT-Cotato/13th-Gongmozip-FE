import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type CollaborationCharacterKey =
  | "TRACK_RUNNER"
  | "FREE_RUNNER"
  | "LEAD_RUNNER"
  | "BOOSTER_RUNNER";

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

function fetchMypageSummary() {
  return apiFetch<MypageSummary>("/api/members/me/mypage-summary");
}

export function useMypageSummaryQuery() {
  return useQuery({
    queryKey: ["member", "mypage-summary"],
    queryFn: fetchMypageSummary,
  });
}
