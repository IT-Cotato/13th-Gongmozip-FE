import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { fetchProfileDetail, profileDetailQueryKey } from "./useProfileDetailQuery";
import type { ProfileBasicInfo } from "@/stores/profileDraftStore";
import type { ProjectExperienceInput } from "@/app/mypage/profile-management/new/experience/_components/ProjectExperienceSheet";
import type { Certificate } from "@/app/mypage/profile-management/new/certificates/_components/CertificateCard";
import { CERTIFICATE_CATEGORY_CODE } from "@/app/mypage/profile-management/new/certificates/_components/CertificateSheet";

// The backend has no field for "role"/"기술스택" in this wizard (never collected)
// but requires both, so a fixed placeholder is sent until that UI exists.
const DEFAULT_PROJECT_ROLE = "팀원";
const DEFAULT_PROJECT_TECH_STACKS = ["기타"];

const PROJECT_CATEGORY_CODE: Record<string, string> = {
  "공모전 출품": "CONTEST",
  "대외활동 프로젝트": "EXTERNAL_ACTIVITY",
  "교내 프로젝트": "CAMPUS_PROJECT",
};

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
          category: PROJECT_CATEGORY_CODE[project.category] ?? "CAMPUS_PROJECT",
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
    certificates.map((certificate) => {
      const certificateName = certificate.grade
        ? `${certificate.name} (${certificate.grade})`
        : certificate.name;

      return apiFetch<void>(`/api/profiles/${profileId}/certifications`, {
        method: "POST",
        body: {
          certificateName,
          // 자동완성 목록에서 고른 경우에만 certificationCode를 함께 보내고
          // isCustom을 false로 표시한다. 직접 입력한 이름은 isCustom: true.
          ...(certificate.certificationCode
            ? { certificationCode: certificate.certificationCode, isCustom: false }
            : { isCustom: true }),
          categoryCode: CERTIFICATE_CATEGORY_CODE[certificate.category] ?? "OTHER",
          issuer: "",
          acquiredAt: certificate.year ? `${certificate.year}-01-01` : undefined,
        },
      });
    }),
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
      queryClient.invalidateQueries({ queryKey: ["profiles", "me"] });
    },
  });
}

// 1단계(기본 정보) "다음"에서 호출된다. 닉네임 중복 등 서버 검증을 마지막
// 단계까지 미루지 않고 이 시점에 바로 확인하기 위해, 프로젝트/자격증 없이
// 프로필만 먼저 만든다. 이후 단계는 이 profileId로 계속 수정(PATCH)하므로
// 뒷 단계에서 실패해 재시도하더라도 프로필이 중복 생성되지 않는다.
async function createBasicProfile(basicInfo: ProfileBasicInfo) {
  return apiFetch<{ profileId: number }>("/api/profiles", {
    method: "POST",
    body: {
      ...buildProfileBody(basicInfo),
      interestCategories: [],
      isPublic: true,
    },
  });
}

export function useCreateBasicProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBasicProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "me"] });
    },
  });
}

export type UpdateBasicProfileInput = {
  profileId: number;
  basicInfo: ProfileBasicInfo;
};

async function updateBasicProfile({ profileId, basicInfo }: UpdateBasicProfileInput) {
  await apiFetch<void>(`/api/profiles/${encodeURIComponent(String(profileId))}`, {
    method: "PATCH",
    body: buildProfileBody(basicInfo),
  });

  return { profileId };
}

export function useUpdateBasicProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBasicProfile,
    onSuccess: (_data, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "me"] });
      queryClient.invalidateQueries({ queryKey: profileDetailQueryKey(String(profileId)) });
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
      queryClient.invalidateQueries({ queryKey: ["profiles", "me"] });
      queryClient.invalidateQueries({ queryKey: profileDetailQueryKey(String(profileId)) });
    },
  });
}
