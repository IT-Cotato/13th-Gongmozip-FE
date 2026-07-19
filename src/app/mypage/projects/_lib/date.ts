export function formatYearMonth(isoDate: string) {
  const [year, month] = isoDate.split("-");
  return `${year}.${month}`;
}

export type ProjectBadge = "SPRINT" | "CRUISE" | "MARATHON";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const SPRINT_MAX_DAYS = 14;
const CRUISE_MAX_DAYS = 28;

export function getProjectBadge(startDate: string, endDate: string): ProjectBadge {
  const durationDays = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / MS_PER_DAY,
  );

  if (durationDays <= SPRINT_MAX_DAYS) return "SPRINT";
  if (durationDays < CRUISE_MAX_DAYS) return "CRUISE";
  return "MARATHON";
}
