import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import type { CollaborationCharacterType } from "@/types/collaboration";

export type ProfileProject = {
  projectId: number;
  profileId: number;
  projectName: string;
  description: string;
  role: string;
  techStacks: string[];
  startedAt: string;
  endedAt: string | null;
  isOngoing: boolean;
  aiSummary: string | null;
  aiSummaryUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileAward = {
  awardId: number;
  awardName: string;
  organizationName: string;
  awardRank: string;
  awardedAt: string;
};

export type ProfileCertification = {
  certificationId: number;
  certificateName: string;
  categoryCode: string;
  categoryName: string;
  issuer: string;
  acquiredAt: string;
  isCustom: boolean;
};

export type ProfileDetail = {
  profileId: number;
  nickname: string;
  character: {
    characterType: CollaborationCharacterType;
    paletteCode: string;
  } | null;
  schoolName: string;
  grade: number;
  major: string;
  secondaryMajor: string | null;
  gpa: number;
  gpaScale: number;
  interestCategories: string[];
  isPublic: boolean;
  projects: ProfileProject[];
  awards: ProfileAward[];
  certifications: ProfileCertification[];
  updatedAt: string;
};

export const profileDetailQueryKey = (profileId: string) =>
  ["profiles", profileId, "detail"] as const;

export function fetchProfileDetail(profileId: string) {
  return apiFetch<ProfileDetail>(`/api/profiles/${encodeURIComponent(profileId)}`);
}

export function useProfileDetailQuery(profileId: string) {
  return useQuery({
    queryKey: profileDetailQueryKey(profileId),
    queryFn: () => fetchProfileDetail(profileId),
    enabled: profileId.length > 0,
  });
}
