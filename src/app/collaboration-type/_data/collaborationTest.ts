export const COLLABORATION_TEST_TOTAL_QUESTION_COUNT = 15;

const LIKERT_SCALE_OPTIONS = ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "매우 그렇지 않다"];

export const COLLABORATION_TEST_QUESTIONS = [
  {
    title: "이번 공모전에서 우리 팀의 최우선 목표는 무엇이었으면 하나요?",
    options: [
      "무조건 수상!\n결과물 완성도와 스펙이 최우선",
      "수상도 중요하지만,\n그 과정에서의 배움도 중요",
      "수상보다는 새로운 경험,\n네트워킹, 나의 성장이 최우선",
    ],
  },
  {
    title: "어떤 방식으로 일정을 관리하고 작업하는 것을 선호하나요?",
    options: [
      "무조건 수상!\n결과물 완성도와 스펙이 최우선",
      "수상도 중요하지만,\n그 과정에서의 배움도 중요",
      "수상보다는 새로운 경험,\n네트워킹, 나의 성장이 최우선",
    ],
  },
  {
    title: "팀원들과 어떤 형태의 소통을 선호하나요?",
    options: [
      "빠르고 자주,\n실시간으로 의견을 나누는 소통",
      "정리된 내용 중심으로,\n필요한 순간에 집중하는 소통",
      "서로의 작업 시간을 존중하며,\n비동기로 차분히 이어가는 소통",
    ],
  },
  {
    title: "나는 나를 크게 잘못 대한 사람에게도 거의 원한을 품지 않는다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "나는 다른 사람이 반대 의견을 낼 때 보통 꽤 유연하게 생각을 바꾸는 편이다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "사람들은 때때로 내가 너무 고집스럽다고 이야기한다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "나는 목표를 달성하려 할 때 종종 매우 열심히 자신을 몰아붙인다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "나는 시간이 걸리더라도 항상 정확하게 일하려고 노력한다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "나는 그냥 버틸 수 있을 최소한의 일만 한다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "나는 승진이나 임금 인상을 위해, 효과가 있을 것을 알더라도 아부하지 않을 것이다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "나는 평균적인 사람보다 더 많은 존중을 받을 자격이 있다고 생각한다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "절대 들키지 않는다는 걸 안다면, 나는 15억을 훔칠 의향이 있다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "나는 혼자 일하는 것보다 적극적인 사회적 상호작용이 있는 일을 더 선호한다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "나는 사회적 상황에서 보통 먼저 다가가는 편이다.",
    options: LIKERT_SCALE_OPTIONS,
  },
  {
    title: "나는 단체 회의에서 내 의견을 거의 표현하지 않는다.",
    options: LIKERT_SCALE_OPTIONS,
  },
].map((question, index) => ({
  id: index + 1,
  ...question,
}));

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
