export const COLLABORATION_TEST_TOTAL_QUESTION_COUNT = 15;

export const COLLABORATION_TEST_QUESTIONS = Array.from(
  { length: COLLABORATION_TEST_TOTAL_QUESTION_COUNT },
  (_, index) => ({
    id: index + 1,
    title: `협업 유형 검사 ${index + 1}번 문제`,
    options: ["그렇다", "아니다"],
  }),
);

export const COLLABORATION_RESULT_TYPES = [
  {
    id: "planner",
    name: "기획형",
    imageSrc: "/images/collaboration-type/planner.png",
  },
  {
    id: "driver",
    name: "추진형",
    imageSrc: "/images/collaboration-type/driver.png",
  },
  {
    id: "supporter",
    name: "조율형",
    imageSrc: "/images/collaboration-type/supporter.png",
  },
  {
    id: "creator",
    name: "창작형",
    imageSrc: "/images/collaboration-type/creator.png",
  },
] as const;

export type CollaborationResultType = (typeof COLLABORATION_RESULT_TYPES)[number]["id"];
