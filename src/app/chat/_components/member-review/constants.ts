import type { ReviewQuestion } from "./types";

export const memberReviewQuestions: ReviewQuestion[] = [
  {
    id: "communication",
    label: "소통이 원활하게 이루어졌나요?",
    options: [
      { label: "아니다", value: "bad" },
      { label: "보통이다", value: "okay" },
      { label: "그렇다", value: "good" },
    ],
  },
  {
    id: "responsibility",
    label: "프로젝트에 적극적으로 참여하였나요?",
    options: [
      { label: "아니다", value: "bad" },
      { label: "보통이다", value: "okay" },
      { label: "그렇다", value: "good" },
    ],
  },
];

export const memberReviewStrengths = [
  "리더십이 있는 팀원",
  "소통이 잘 되는 팀원",
  "아이디어가 좋은 팀원",
  "문제해결을 잘하는 팀원",
  "믿음직한 팀원",
  "적극적인 팀원",
  "책임감 있는 팀원",
  "배려심 있는 팀원",
];
