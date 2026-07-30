import type { ProjectBadge } from "./date";

export const PROJECT_BADGE_IMAGE: Record<ProjectBadge, string> = {
  SPRINT: "/images/sprint-badge.svg",
  CRUISE: "/images/cruise-badge.svg",
  MARATHON: "/images/marathon-badge.svg",
};

export const PROJECT_BADGE_LABEL: Record<ProjectBadge, string> = {
  SPRINT: "스프린트 완주 메달",
  CRUISE: "크루즈 완주 메달",
  MARATHON: "마라톤 완주 메달",
};
