import type { CollaborationCharacterType } from "@/types/collaboration";

export const COLLABORATION_TEST_TOTAL_QUESTION_COUNT = 15;

export type { CollaborationCharacterType } from "@/types/collaboration";

export const COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE = {
  LEAD_RUNNER: "lead",
  TRACK_RUNNER: "track",
  BOOST_RUNNER: "boost",
  BOOSTER_RUNNER: "boost",
  FREE_RUNNER: "free",
} as const satisfies Record<CollaborationCharacterType, CollaborationResultType>;

export const COLLABORATION_RESULT_TYPE_TO_CHARACTER_TYPE = {
  lead: "LEAD_RUNNER",
  track: "TRACK_RUNNER",
  boost: "BOOST_RUNNER",
  free: "FREE_RUNNER",
} as const satisfies Record<CollaborationResultType, CollaborationCharacterType>;

const LIKERT_SCALE_OPTIONS = [
  "매우 그렇다",
  "그렇다",
  "보통이다",
  "그렇지 않다",
  "매우 그렇지 않다",
];

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
      "철저한 사전 기획, 명확한 역할 분담,\n꼼꼼한 마일스톤 관리",
      "큰 틀만 잡고 상황에 따라\n유동적으로 분담",
      "필요할 때마다 모여서 유연하게\n대처하며 협업",
    ],
  },
  {
    title: "팀원들과 어떤 형태의 소통을 선호하나요?",
    options: [
      "텍스트/비대면 위주의\n빠르고 효율적인 소통",
      "평소엔 온라인,\n중요한 의사결정은 대면",
      "자주 만나서 아이디어를 나누는\n대면 위주의 밀도 있는 소통",
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
    id: "lead",
    characterType: "LEAD_RUNNER",
    name: "리드러너",
    quote: '"우리 팀, 결승선까지 내가 페이스 맞춰줄게!"',
    hashtags: ["#계획적", "#적극적 소통", "#리더십", "#추진력"],
    imageSrc: "/images/test/lead.png",
    quoteBoxWidth: 250,
    quoteBoxColor: "#FF7658",
    themeColor: "#FF7658",
    nameColor: "#D56046",
    hashtagColor: "#FF7658",
    featureTitleColor: "#591E12",
    traitLabelColor: "#FF7658",
    traitBarColor: "#FF7658",
    borderColor: "#FF7658",
    traits: [
      { left: "계획형", right: "즉흥형", percentage: 82 },
      { left: "조율형", right: "독립형", percentage: 82 },
      { left: "추진형", right: "신중형", percentage: 82 },
    ],
    descriptions: [
      "팀의 방향을 잡고 모두를 끌고 가는 선두 러너",
      "일정관리, 역할분배, 회의 진행까지 주도",
      "목표를 향해 팀원들의 페이스를 맞춰주는 성향",
      "공모전 수상 가능성 가장 높은 편",
    ],
  },
  {
    id: "boost",
    characterType: "BOOST_RUNNER",
    name: "부스트 러너",
    quote: '"좋은 아이디어는 움직이면서 나온다!"',
    hashtags: ["#창의성", "#친화력", "#즉흥성", "#도전정신"],
    imageSrc: "/images/test/boost.png",
    quoteBoxWidth: 218,
    quoteBoxColor: "#FFAD62",
    themeColor: "#FF9B50",
    nameColor: "#885527",
    hashtagColor: "#885527",
    featureTitleColor: "#625E10",
    traitLabelColor: "#885527",
    traitBarColor: "#FFAD62",
    borderColor: "#D7904E",
    traits: [
      { left: "추진형", right: "신중형", percentage: 81 },
      { left: "교류형", right: "관찰형", percentage: 81 },
      { left: "속도형", right: "꼼꼼형", percentage: 81 },
    ],
    descriptions: [
      "아이디어와 에너지로 분위기를 띄우는 러너",
      "사람들과 빠르게 친해지고 네트워킹에 강한 편",
      "브레인 스토밍과 발표 상황에서 빛남",
      "새로운 시도를 두려워하지 않는 성향",
    ],
  },
  {
    id: "track",
    characterType: "TRACK_RUNNER",
    name: "트랙러너",
    quote: '"조용히 달려도 결국 완주하는 건 나야."',
    hashtags: ["#꼼꼼함", "#책임감", "#집중력", "#안정성"],
    imageSrc: "/images/test/track.png",
    quoteBoxWidth: 223,
    quoteBoxColor: "#51D879",
    themeColor: "#74E094",
    nameColor: "#318249",
    hashtagColor: "#41AD61",
    featureTitleColor: "#184224",
    traitLabelColor: "#41AD61",
    traitBarColor: "#51D879",
    borderColor: "#74E094",
    traits: [
      { left: "배려형", right: "주장형", percentage: 78 },
      { left: "꼼꼼형", right: "속도형", percentage: 78 },
      { left: "신중형", right: "추진형", percentage: 78 },
    ],
    descriptions: [
      "말보다 결과물로 보여주는 꾸준한 러너",
      "눈에 띄진 않지만 팀의 완성도를 책임짐",
      "맡은 일은 끝까지 해내는 신뢰형 플레이어",
      "마감 직전 모두가 찾게 되는 존재",
    ],
  },
  {
    id: "free",
    characterType: "FREE_RUNNER",
    name: "프리러너",
    quote: '"꼭 같은 길로 달릴 필요는 없잖아?"',
    hashtags: ["#독립심", "#유연성", "#탐색형", "#자유로움"],
    imageSrc: "/images/test/free.png",
    quoteBoxWidth: 205,
    quoteBoxColor: "#3CAEF4",
    themeColor: "#3CAFF4",
    nameColor: "#308CC5",
    hashtagColor: "#3CAEF4",
    featureTitleColor: "#12384F",
    traitLabelColor: "#3CAEF4",
    traitBarColor: "#3CAEF4",
    borderColor: "#3CAEF4",
    traits: [
      { left: "유연형", right: "계획형", percentage: 79 },
      { left: "탐색형", right: "안정형", percentage: 79 },
      { left: "독립형", right: "조율형", percentage: 79 },
    ],
    descriptions: [
      "정해진 코스보다 자신만의 길을 찾는 러너",
      "압박 없는 환경에서 창의력이 발휘됨",
      "자유로운 탐색과 새로운 관점을 제공",
      "팀에 신선한 시각을 더해주는 존재",
    ],
  },
] as const;

export type CollaborationResultType = (typeof COLLABORATION_RESULT_TYPES)[number]["id"];

type CollaborationAxis = {
  leftLabel: string;
  rightLabel: string;
  score: number;
};

export type CollaborationDisplayTrait = {
  left: string;
  right: string;
  filledSegmentCount: number;
};

export function getTraitFilledSegmentCount(score: number) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  const segmentCount = score <= 5 ? Math.round(score) : Math.round(score / 20);

  return Math.min(5, Math.max(0, segmentCount));
}

export function getCollaborationDisplayTraits(
  result: (typeof COLLABORATION_RESULT_TYPES)[number],
  axes?: readonly CollaborationAxis[] | null,
): CollaborationDisplayTrait[] {
  if (axes && axes.length > 0) {
    return axes.slice(0, result.traits.length).map((axis) => ({
      left: axis.leftLabel,
      right: axis.rightLabel,
      filledSegmentCount: getTraitFilledSegmentCount(axis.score),
    }));
  }

  return result.traits.map((trait) => ({
    left: trait.left,
    right: trait.right,
    filledSegmentCount: getTraitFilledSegmentCount(trait.percentage),
  }));
}

export function normalizeCollaborationCharacterType(characterType: CollaborationCharacterType) {
  return characterType === "BOOSTER_RUNNER" ? "BOOST_RUNNER" : characterType;
}

export function getCollaborationResultByCharacterType(characterType: CollaborationCharacterType) {
  const normalizedCharacterType = normalizeCollaborationCharacterType(characterType);

  return COLLABORATION_RESULT_TYPES.find((result) => {
    return result.characterType === normalizedCharacterType;
  });
}

export function getCollaborationResultByRouteParam(routeParam: string) {
  if (routeParam in COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE) {
    return getCollaborationResultByCharacterType(routeParam as CollaborationCharacterType);
  }

  const characterType =
    COLLABORATION_RESULT_TYPE_TO_CHARACTER_TYPE[routeParam as CollaborationResultType];

  return characterType ? getCollaborationResultByCharacterType(characterType) : undefined;
}
