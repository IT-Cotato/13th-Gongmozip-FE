import type { ChatMember } from "../../_data/mockMessages";

export type SheetState =
  | "closed"
  | "willingness"
  | "candidateVote"
  | "complete"
  | "leaderResult"
  | "contestAddConfirm"
  | "contestList"
  | "contestVote"
  | "contestComplete"
  | "contestResult"
  | "contestDetail";
export type LeaderChoice = "yes" | "no";
export type LeaderIntent = "definite" | "flexible" | "none";
export type LeaderScenario = "singleDefinite" | "noDefinite" | "multipleDefinite";
export type LeaderEvent =
  | "autoLeaderNotice"
  | "candidateRegistrationRequest"
  | "voteRequest"
  | "elected"
  | "tie"
  | "revote"
  | "temporaryLeader"
  | "contestVoteReady";
export type LeaderCandidate = Pick<ChatMember, "avatarSrc" | "avatarTone" | "id" | "isMe" | "name">;
export type LeaderIntentAnswer = {
  memberId: string;
  intent: LeaderIntent;
};
export type RecommendedContest = {
  id: string;
  category: string;
  dday: string;
  imageSrc?: string;
  organizer: string;
  title: string;
  viewCount: string;
};
