import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/http";
import type { CollaborationCharacterType } from "@/types/collaboration";

export type PublicProfileProject = {
  projectName: string;
  role: string;
  aiSummary: string | null;
};

export type PublicProfileAward = {
  awardName: string;
  organizationName: string;
};

export type PublicProfileCertification = {
  certificateName: string;
};

export type PublicProfile = {
  profileId: number;
  nickname: string;
  gender?: string | null;
  birthDate?: string | null;
  age?: number | null;
  birthYear?: number | null;
  character: {
    characterType: CollaborationCharacterType;
    paletteCode: string;
  } | null;
  isPublic: boolean;
  schoolRegion: string;
  schoolName: string;
  grade: number;
  major: string;
  secondaryMajor: string | null;
  gpa?: number | null;
  gpaScale?: number | null;
  projects: PublicProfileProject[];
  awards: PublicProfileAward[];
  certifications: PublicProfileCertification[];
};

export const publicProfileQueryKey = (profileId: string) =>
  ["profiles", "public", profileId] as const;

export function fetchPublicProfile(profileId: string) {
  return apiFetch<PublicProfile>(`/api/public/profiles/${encodeURIComponent(profileId)}`);
}

export function usePublicProfileQuery(
  profileId: string | null,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: publicProfileQueryKey(profileId ?? ""),
    queryFn: () => fetchPublicProfile(profileId ?? ""),
    enabled: Boolean(profileId) && (options.enabled ?? true),
  });
}
