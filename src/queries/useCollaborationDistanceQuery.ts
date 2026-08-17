import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";

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

export function fetchCollaborationDistance() {
  return apiFetch<CollaborationDistance>("/api/members/me/collaboration-distance");
}

export function useCollaborationDistanceQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryFn: fetchCollaborationDistance,
    queryKey: COLLABORATION_DISTANCE_QUERY_KEY,
  });
}
