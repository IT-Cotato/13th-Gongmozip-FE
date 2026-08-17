import type { ProfileDetail } from "@/queries/useProfileDetailQuery";
import type { ProjectExperienceInput } from "../new/experience/_components/ProjectExperienceSheet";
import type { Certificate } from "../new/certificates/_components/CertificateCard";

const PROJECT_CATEGORY_FALLBACK: ProjectExperienceInput["category"] = "공모전 출품";

// 백엔드는 프로젝트 카테고리를 저장하지 않고, 수상 내역도 프로젝트와 연결해
// 저장하지 않는다. 수정 진입 시에는 카테고리를 기본값으로 채우고(재선택 필요),
// 수상 내역은 마법사가 만들 때와 같은 순서(프로젝트당 최대 1개)로 저장됐다고
// 가정해 배열 순서로 최대한 재연결한다.
export function buildProfileDraftFromDetail(profile: ProfileDetail) {
  const basicInfo = {
    nickname: profile.nickname,
    school: profile.schoolName,
    grade: String(profile.grade),
    major: profile.major,
    doubleMajor: profile.secondaryMajor ?? "",
    minor: "",
    gpa: String(profile.gpa),
    gpaScale: String(profile.gpaScale),
  };

  const projects: ProjectExperienceInput[] = profile.projects.map((project, index) => {
    const matchedAward = profile.awards[index];
    return {
      name: project.projectName,
      startMonth: project.startedAt ? project.startedAt.slice(0, 7) : "",
      endMonth: project.endedAt ? project.endedAt.slice(0, 7) : "",
      category: PROJECT_CATEGORY_FALLBACK,
      content: project.description,
      hasAward: Boolean(matchedAward),
      awardName: matchedAward?.awardName ?? "",
    };
  });

  const certificates: Certificate[] = profile.certifications.map((certification) => ({
    name: certification.certificateName,
    category: certification.categoryName,
    grade: "",
    year: certification.acquiredAt ? String(new Date(certification.acquiredAt).getFullYear()) : "",
    // 프로필 상세 조회 API는 certificationCode를 내려주지 않아 재저장 시 직접 입력으로 취급한다.
    certificationCode: null,
  }));

  return { basicInfo, projects, certificates };
}
