import type {
  MatchingEligibility,
  MatchingEligibilityReason,
} from "@/queries/useMatchingEligibilityQuery";
import type { TodayMatchingApplication } from "@/queries/useTodayMatchingApplicationQuery";

export const teamMatchingReasonPriority: MatchingEligibilityReason[] = [
  "PROFILE_REQUIRED",
  "SURVEY_REQUIRED",
  "ALREADY_APPLIED_TODAY",
  "MATCHING_RESTRICTED",
  "APPLICATION_DEADLINE_PASSED",
  "PROJECT_EVALUATION_NOT_READY",
  "REASSIGNMENT_PENDING",
];

export const teamMatchingBlockingReasonMessages: Record<MatchingEligibilityReason, string> = {
  PROFILE_REQUIRED: "프로필 작성 후 신청할 수 있어요.",
  SURVEY_REQUIRED: "협업 유형 검사 후 신청할 수 있어요.",
  APPLICATION_DEADLINE_PASSED: "오늘 매칭 신청이 마감됐어요.",
  ALREADY_APPLIED_TODAY: "오늘은 이미 매칭을 신청했어요.",
  MATCHING_RESTRICTED: "매칭 참여 제한 기간이에요.",
  PROJECT_EVALUATION_NOT_READY: "프로젝트 AI 평가 완료 후 신청할 수 있어요.",
  REASSIGNMENT_PENDING: "이전 매칭 응답 완료 후 신청할 수 있어요.",
};

export function getTeamMatchingPrimaryReason(reasons: MatchingEligibilityReason[]) {
  return teamMatchingReasonPriority.find((reason) => reasons.includes(reason));
}

export function getTeamMatchingApplyHref(
  eligibility?: MatchingEligibility,
  todayApplication?: TodayMatchingApplication,
) {
  if (!eligibility || !todayApplication) {
    return undefined;
  }

  if (eligibility?.appliedToday || todayApplication?.appliedToday) {
    return "/team-matching/modal-preview/already-applied";
  }

  const reasons = eligibility.reasons;

  if (eligibility.eligible || reasons.length === 0) {
    return "/team-matching/profile";
  }

  if (reasons.includes("PROFILE_REQUIRED") && reasons.includes("SURVEY_REQUIRED")) {
    return "/team-matching/modal-preview/all-required";
  }

  if (reasons.includes("PROFILE_REQUIRED")) {
    return "/team-matching/modal-preview/profile-required";
  }

  if (reasons.includes("SURVEY_REQUIRED")) {
    return "/team-matching/modal-preview/collaboration-test-required";
  }

  if (reasons.includes("ALREADY_APPLIED_TODAY")) {
    return "/team-matching/modal-preview/already-applied";
  }

  if (reasons.includes("MATCHING_RESTRICTED")) {
    return "/team-matching/modal-preview/weekly-limit";
  }

  return "/team-matching";
}

export function hasTeamMatchingActionableBlockingReason(eligibility?: MatchingEligibility) {
  if (!eligibility || eligibility.eligible) {
    return true;
  }

  return eligibility.reasons.some((reason) =>
    [
      "PROFILE_REQUIRED",
      "SURVEY_REQUIRED",
      "ALREADY_APPLIED_TODAY",
      "MATCHING_RESTRICTED",
    ].includes(reason),
  );
}
