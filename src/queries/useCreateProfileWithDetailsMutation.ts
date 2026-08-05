import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { profileListQueryKey } from "./useProfileListQuery";
import type { ProfileBasicInfo } from "@/stores/profileDraftStore";
import type { ProjectExperienceInput } from "@/app/mypage/profile-management/new/experience/_components/ProjectExperienceSheet";
import type { Certificate } from "@/app/mypage/profile-management/new/certificates/_components/CertificateCard";

const CERTIFICATE_CATEGORY_CODE: Record<string, string> = {
  어학: "LANGUAGE",
  "컴퓨터/IT": "COMPUTER_IT",
  "데이터분석/AI": "DATA_AI",
  디자인: "DESIGN",
  "경영/사무": "MANAGEMENT_OFFICE",
  기타: "OTHER",
};

// The backend has no field for "role"/"기술스택" in this wizard (never collected)
// but requires both, so a fixed placeholder is sent until that UI exists.
const DEFAULT_PROJECT_ROLE = "팀원";
const DEFAULT_PROJECT_TECH_STACKS = ["기타"];

export type CreateProfileWithDetailsInput = {
  basicInfo: ProfileBasicInfo;
  projects: ProjectExperienceInput[];
  certificates: Certificate[];
};

function toIsoDate(monthValue: string) {
  return `${monthValue}-01`;
}

async function createProfileWithDetails({
  basicInfo,
  projects,
  certificates,
}: CreateProfileWithDetailsInput) {
  const secondaryMajor = basicInfo.doubleMajor.trim() || basicInfo.minor.trim() || "";

  const createdProfile = await apiFetch<{ profileId: number }>("/api/profiles", {
    method: "POST",
    body: {
      nickname: basicInfo.nickname.trim(),
      schoolName: basicInfo.school.trim(),
      grade: basicInfo.grade ? Number(basicInfo.grade) : 1,
      major: basicInfo.major.trim(),
      secondaryMajor,
      gpa: Number(basicInfo.gpa),
      gpaScale: Number(basicInfo.gpaScale),
      // 관심 분야를 고르는 화면이 아직 없어 항상 빈 배열로 전송함
      interestCategories: [],
      isPublic: true,
    },
  });

  const profileId = createdProfile.profileId;

  await Promise.all(
    projects.map(async (project) => {
      const created = await apiFetch<{ projectId: number }>(
        `/api/profiles/${profileId}/projects`,
        {
          method: "POST",
          body: {
            projectName: project.name,
            description: project.content,
            role: DEFAULT_PROJECT_ROLE,
            techStacks: DEFAULT_PROJECT_TECH_STACKS,
            startedAt: project.startMonth ? toIsoDate(project.startMonth) : undefined,
            endedAt: project.endMonth ? toIsoDate(project.endMonth) : undefined,
            isOngoing: !project.endMonth,
          },
        },
      );

      if (project.hasAward && project.awardName.trim()) {
        const awardDateMonth = project.endMonth || project.startMonth;
        await apiFetch<void>(`/api/profiles/${profileId}/awards`, {
          method: "POST",
          body: {
            awardName: project.awardName.trim(),
            organizationName: "",
            awardRank: "",
            awardedAt: awardDateMonth ? toIsoDate(awardDateMonth) : undefined,
          },
        });
      }

      return created;
    }),
  );

  await Promise.all(
    certificates.map((certificate) =>
      apiFetch<void>(`/api/profiles/${profileId}/certifications`, {
        method: "POST",
        body: {
          certificateName: certificate.grade
            ? `${certificate.name} (${certificate.grade})`
            : certificate.name,
          categoryCode: CERTIFICATE_CATEGORY_CODE[certificate.category] ?? "OTHER",
          issuer: "",
          acquiredAt: certificate.year ? `${certificate.year}-01-01` : undefined,
          isCustom: true,
        },
      }),
    ),
  );

  return { profileId };
}

export function useCreateProfileWithDetailsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfileWithDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileListQueryKey });
    },
  });
}
