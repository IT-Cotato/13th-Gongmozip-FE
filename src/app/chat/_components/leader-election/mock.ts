import { MOCK_CHAT_MEMBERS } from "../../_data/mockMessages";
import type { LeaderIntentAnswer, RecommendedContest } from "./types";

export const fallbackCandidate = MOCK_CHAT_MEMBERS[0];

// TODO: API 연동 후 백엔드가 내려주는 팀원 참여 의사 값으로 교체한다.
export const mockLeaderIntentAnswers: LeaderIntentAnswer[] = [
  { memberId: "me", intent: "none" },
  { memberId: "haeeun", intent: "flexible" },
  { memberId: "minjeong", intent: "none" },
  { memberId: "junsu", intent: "none" },
];

// TODO: API 연동 후 백엔드가 내려주는 AI 추천 팀장 2명으로 교체한다.
export const mockAiRecommendedLeaderIds = ["minjeong", "haeeun"];

// TODO: 팀장 여부 투표 완료 후 백엔드가 내려주는 전체 후보 등록 결과로 교체한다.
export const mockRegisteredCandidateIds = ["minjeong", "haeeun"];
export const mockIsTieResult = false;

// TODO: API 연동 후 백엔드가 내려주는 공모전 투표 결과 상태로 교체한다.
export const mockContestVoteResult: "normal" | "noVotes" | "tie" = "normal";

export const mockRecommendedContests: RecommendedContest[] = [
  {
    id: "contest-ai-idea",
    category: "기획/아이디어",
    dday: "D-21",
    imageSrc: "/images/contests/cha.png",
    organizer: "야놀자 리서치",
    title: "2026트래블이노베이션 아이디어 공모전",
    viewCount: "211",
  },
  {
    id: "contest-service",
    category: "텍스트",
    dday: "D-텍스트",
    organizer: "텍스트",
    title: "텍스트",
    viewCount: "텍스트",
  },
  {
    id: "contest-branding",
    category: "텍스트",
    dday: "D-텍스트",
    organizer: "텍스트",
    title: "텍스트",
    viewCount: "텍스트",
  },
];
