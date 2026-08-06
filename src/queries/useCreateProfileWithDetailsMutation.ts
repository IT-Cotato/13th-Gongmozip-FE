import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { profileListQueryKey } from "./useProfileListQuery";
import { fetchProfileDetail, profileDetailQueryKey } from "./useProfileDetailQuery";
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

function buildProfileBody(basicInfo: ProfileBasicInfo) {
  const secondaryMajor = basicInfo.doubleMajor.trim() || basicInfo.minor.trim() || "";

  return {
    nickname: basicInfo.nickname.trim(),
    schoolName: basicInfo.school.trim(),
    grade: basicInfo.grade ? Number(basicInfo.grade) : 1,
    major: basicInfo.major.trim(),
    secondaryMajor,
    gpa: Number(basicInfo.gpa),
    gpaScale: Number(basicInfo.gpaScale),
  };
}

async function createProjectsAwardsAndCertifications(
  profileId: number,
  projects: ProjectExperienceInput[],
  certificates: Certificate[],
) {
  await Promise.all(
    projects.map(async (project) => {
      await apiFetch<{ projectId: number }>(`/api/profiles/${profileId}/projects`, {
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
      });

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
}

async function createProfileWithDetails({
  basicInfo,
  projects,
  certificates,
}: CreateProfileWithDetailsInput) {
  const createdProfile = await apiFetch<{ profileId: number }>("/api/profiles", {
    method: "POST",
    body: {
      ...buildProfileBody(basicInfo),
      // 관심 분야를 고르는 화면이 아직 없어 항상 빈 배열로 전송함
      interestCategories: [],
      isPublic: true,
    },
  });

  const profileId = createdProfile.profileId;
  await createProjectsAwardsAndCertifications(profileId, projects, certificates);

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

export type UpdateProfileWithDetailsInput = {
  profileId: number;
  basicInfo: ProfileBasicInfo;
  projects: ProjectExperienceInput[];
  certificates: Certificate[];
};

// 프로젝트/수상/자격증은 개별 수정(PATCH) 대신 기존 항목을 모두 삭제하고
// 마법사에 담긴 현재 목록으로 다시 생성하는 방식으로 갱신함. 백엔드가 수상을
// 프로젝트와 연결해 저장하지 않아 어차피 항목 단위로 정확히 대응시킬 수 없고,
// 이 방식이 생성 로직을 그대로 재사용할 수 있어 더 단순함.
async function updateProfileWithDetails({
  profileId,
  basicInfo,
  projects,
  certificates,
}: UpdateProfileWithDetailsInput) {
  const encodedId = encodeURIComponent(String(profileId));
  const original = await fetchProfileDetail(String(profileId));

  await apiFetch<void>(`/api/profiles/${encodedId}`, {
    method: "PATCH",
    body: buildProfileBody(basicInfo),
  });

  await Promise.all([
    ...original.projects.map((project) =>
      apiFetch<void>(`/api/profiles/${encodedId}/projects/${project.projectId}`, {
        method: "DELETE",
      }),
    ),
    ...original.awards.map((award) =>
      apiFetch<void>(`/api/profiles/${encodedId}/awards/${award.awardId}`, {
        method: "DELETE",
      }),
    ),
    ...original.certifications.map((certification) =>
      apiFetch<void>(`/api/profiles/${encodedId}/certifications/${certification.certificationId}`, {
        method: "DELETE",
      }),
    ),
  ]);

  await createProjectsAwardsAndCertifications(profileId, projects, certificates);

  return { profileId };
}

export function useUpdateProfileWithDetailsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileWithDetails,
    onSuccess: (_data, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: profileListQueryKey });
      queryClient.invalidateQueries({ queryKey: profileDetailQueryKey(String(profileId)) });
    },
  });
}
