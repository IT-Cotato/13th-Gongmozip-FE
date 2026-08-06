import { MOCK_CHAT_MEMBERS, type ChatMember } from "../../_data/mockMessages";
import { mockLeaderIntentAnswers, mockRegisteredCandidateIds } from "./mock";
import type { LeaderChoice, LeaderIntentAnswer, LeaderScenario } from "./types";

export function getLeaderScenario(intentAnswers: LeaderIntentAnswer[]): LeaderScenario {
  const definiteCount = intentAnswers.filter((answer) => answer.intent === "definite").length;

  if (definiteCount === 1) {
    return "singleDefinite";
  }

  if (definiteCount >= 2) {
    return "multipleDefinite";
  }

  return "noDefinite";
}

export function formatRecommendedLeaderNames(names: string[]) {
  if (names.length === 0) {
    return "추천 후보";
  }

  if (names.length === 1) {
    return names[0];
  }

  return `${names.slice(0, -1).join(", ")} 혹은 ${names.at(-1)}`;
}

export function formatLeaderCandidateNames(names: string[]) {
  if (names.length === 0) {
    return "팀장 후보";
  }

  if (names.length === 1) {
    return names[0];
  }

  if (names.length === 2) {
    return `${names[0]}과\n${names[1]}`;
  }

  return `${names.slice(0, -1).join(", ")}과\n${names.at(-1)}`;
}

export function findMembersByIds(ids: string[]) {
  return ids
    .map((id) => MOCK_CHAT_MEMBERS.find((member) => member.id === id))
    .filter((member): member is ChatMember => Boolean(member));
}

export function getLeaderCandidates(scenario: LeaderScenario, leaderChoice: LeaderChoice) {
  if (scenario === "singleDefinite" || scenario === "multipleDefinite") {
    return findMembersByIds(
      mockLeaderIntentAnswers
        .filter((answer) => answer.intent === "definite")
        .map((answer) => answer.memberId),
    );
  }

  const registeredCandidateIds = [...mockRegisteredCandidateIds];

  if (leaderChoice === "yes") {
    registeredCandidateIds.push("me");
  }

  return findMembersByIds([...new Set(registeredCandidateIds)]);
}
