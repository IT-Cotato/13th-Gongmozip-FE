export type ProjectBadge = "SPRINT" | "CRUISE" | "MARATHON";

const PROJECT_BADGE_IMAGE: Record<ProjectBadge, string> = {
  SPRINT: "/images/sprint-badge.svg",
  CRUISE: "/images/cruise-badge.svg",
  MARATHON: "/images/marathon-badge.svg",
};

const PROJECT_BADGE_LABEL: Record<ProjectBadge, string> = {
  SPRINT: "스프린트 완주 메달",
  CRUISE: "크루즈 완주 메달",
  MARATHON: "마라톤 완주 메달",
};

const DEFAULT_BADGE: ProjectBadge = "MARATHON";

// 백엔드가 내려주는 medal 문자열이 위 세 종류를 벗어나면 기본 배지로 대체함.
export function getProjectBadgeImage(medal: string) {
  return PROJECT_BADGE_IMAGE[medal as ProjectBadge] ?? PROJECT_BADGE_IMAGE[DEFAULT_BADGE];
}

export function getProjectBadgeLabel(medal: string) {
  return PROJECT_BADGE_LABEL[medal as ProjectBadge] ?? PROJECT_BADGE_LABEL[DEFAULT_BADGE];
}
