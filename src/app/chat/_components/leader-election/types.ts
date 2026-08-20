import type { ChatMember } from "../../_data/chatTypes";

export type SheetState =
  | "closed"
  | "willingness"
  | "candidateVote"
  | "leaderComplete"
  | "contestAddList"
  | "contestVote"
  | "contestComplete"
  | "contestResult"
  | "contestDetail";
export type LeaderChoice = "yes" | "no";
export type LeaderCandidate = Pick<
  ChatMember,
  "avatarSrc" | "avatarTone" | "id" | "isMe" | "name" | "profileId"
>;
export type RecommendedContest = {
  id: string;
  contestId?: number;
  contestCandidateId?: number;
  category: string;
  candidateDeadlineAt?: string;
  dday: string;
  imageSrc?: string;
  isRecommended?: boolean;
  organizer: string;
  projectEndAt?: string;
  title: string;
  voteDeadlineAt?: string;
  viewCount: string;
};
