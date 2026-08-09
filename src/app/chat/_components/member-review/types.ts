import type { ChatMember } from "../../_data/mockMessages";

export type ReviewScore = "bad" | "okay" | "good";
export type ReviewQuestion = {
  id: string;
  label: string;
  options: {
    label: string;
    value: ReviewScore;
  }[];
};

export type MemberReviewAnswer = {
  memberId: string;
  scores: Record<string, ReviewScore>;
  strengths: string[];
};

export type ReviewMember = Pick<ChatMember, "avatarSrc" | "avatarTone" | "id" | "isMe" | "name"> & {
  alreadyReviewed?: boolean;
  isLeader?: boolean;
};
