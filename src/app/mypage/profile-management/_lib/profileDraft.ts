import type { ProfileDetail } from "@/queries/useProfileDetailQuery";
import type { ProjectExperienceInput } from "../new/experience/_components/ProjectExperienceSheet";
import type { Certificate } from "../new/certificates/_components/CertificateCard";

const PROJECT_CATEGORY_FALLBACK: ProjectExperienceInput["category"] = "공모전 출품";

// 백엔드는 프로젝트 카테고리를 저장하지 않고, 수상 내역도 어느 프로젝트의
// 수상인지 연결해 저장하지 않는다(awards 응답에 프로젝트 연관 키가 없음).
// 수정 진입 시 카테고리는 기본값으로 채우고(재선택 필요), 수상 내역은 어느
// 프로젝트 것인지 알 수 없으므로 추측해서 잘못 붙이지 않고 비워둔다 - 배열
// 순서로 추측하면(과거 방식) 프로젝트 개수와 수상 개수가 다를 때 엉뚱한
// 프로젝트에 수상 내역이 붙는다.
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

  const projects: ProjectExperienceInput[] = profile.projects.map((project) => ({
    name: project.projectName,
    startMonth: project.startedAt ? project.startedAt.slice(0, 7) : "",
    endMonth: project.endedAt ? project.endedAt.slice(0, 7) : "",
    category: PROJECT_CATEGORY_FALLBACK,
    content: project.description,
    hasAward: false,
    awardName: "",
  }));

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
