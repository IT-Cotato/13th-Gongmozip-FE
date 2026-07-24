export type ChatMessage = {
  id: string;
  senderName: string;
  body: string;
  sentAt: string;
  direction: "incoming" | "outgoing";
  avatarTone?: "robot" | "green" | "blue" | "coral";
  avatarSrc?: string;
  unreadLabel?: string;
};

export type ChatRoom = {
  id: string;
  title: string;
  memberCount: number;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  avatarSrcs: string[];
};

export type ChatMember = {
  id: string;
  name: string;
  isMe?: boolean;
  isChatbot?: boolean;
  avatarTone: NonNullable<ChatMessage["avatarTone"]>;
  avatarSrc?: string;
  school?: string;
  major?: string;
  grade?: string;
  introduction?: string;
  strengths?: string[];
};

export const CHAT_ROOM_ID = "team-seoul-01";
export const CHAT_ROOM_TITLE = "김민정, 이해은, 박준수";
export const CHAT_MEMBER_COUNT = 4;

export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: CHAT_ROOM_ID,
    title: CHAT_ROOM_TITLE,
    memberCount: CHAT_MEMBER_COUNT,
    lastMessage: "요즘 날씨 너무 좋아서 야외 활동하기 딱이야!",
    lastMessageAt: "15시간 전",
    unreadCount: 9,
    avatarSrcs: ["/icons/chat/character1.svg", "/icons/chat/character2.svg", "/icons/chat/character3.svg"],
  },
  {
    id: "team-brand-02",
    title: "김민정, 이해은, 박준수",
    memberCount: 4,
    lastMessage: "요즘 날씨 너무 좋아서 야외 활동하기 딱이야!",
    lastMessageAt: "15시간 전",
    unreadCount: 0,
    avatarSrcs: ["/icons/chat/character1.svg", "/icons/chat/character2.svg", "/icons/chat/character3.svg"],
  },
  {
    id: "team-service-03",
    title: "김민정, 이해은, 박준수",
    memberCount: 4,
    lastMessage: "요즘 날씨 너무 좋아서 야외 활동하기 딱이야!",
    lastMessageAt: "15시간 전",
    unreadCount: 0,
    avatarSrcs: ["/icons/chat/character1.svg", "/icons/chat/character2.svg", "/icons/chat/character3.svg"],
  },
];

export const MOCK_CHAT_MEMBERS: ChatMember[] = [
  {
    id: "me",
    name: "김철수",
    isMe: true,
    avatarTone: "blue",
    avatarSrc: "/icons/chat/character1.svg",
    school: "서울대학교",
    major: "경영학과",
    grade: "4학년",
    introduction: "팀 일정 정리와 자료 조사에 강점이 있어요.",
    strengths: ["일정 관리", "시장 조사", "발표 자료"],
  },
  {
    id: "haeeun",
    name: "이해은",
    avatarTone: "coral",
    avatarSrc: "/icons/chat/character2.svg",
    school: "서울대학교",
    major: "경영학과",
    grade: "4학년",
    introduction: "사용자 리서치와 서비스 기획을 맡고 싶어요.",
    strengths: ["서비스 기획", "리서치", "문서화"],
  },
  {
    id: "minjeong",
    name: "김민정",
    avatarTone: "green",
    avatarSrc: "/icons/chat/character3.svg",
    school: "서울대학교",
    major: "경영학과",
    grade: "4학년",
    introduction: "데이터 분석과 공모전 전략 수립 경험이 있어요.",
    strengths: ["데이터 분석", "전략 수립", "문제 정의"],
  },
  {
    id: "junsu",
    name: "박준수",
    avatarTone: "blue",
    avatarSrc: "/icons/chat/character1.svg",
    school: "서울대학교",
    major: "경영학과",
    grade: "4학년",
    introduction: "프로토타입 제작과 발표를 빠르게 진행할 수 있어요.",
    strengths: ["프로토타입", "발표", "운영"],
  },
];

export const MOCK_CHATBOT_MEMBER: ChatMember = {
  id: "chatbot",
  name: "챗봇",
  isChatbot: true,
  avatarTone: "robot",
  avatarSrc: "/icons/chat/chat_bot.svg",
  introduction: "팀 대화 정리, 역할 제안, 일정 리마인드를 도와줘요.",
  strengths: ["대화 요약", "역할 추천", "일정 리마인드"],
};

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "bot-intro",
    senderName: "챗봇",
    body: "안녕하세요. 저는 팀 운영을 도와주는 AI 챗봇이에요. 팀 매칭이 완료되었어요. 각자 간단한 자기소개와 인사를 나눠볼까요?",
    sentAt: "오후 8:28",
    direction: "incoming",
    avatarTone: "robot",
    avatarSrc: "/icons/chat/chat_bot.svg",
  },
  {
    id: "minjeong-intro",
    senderName: "김민정",
    body: "안녕하세요. 서울대학교 4학년 경영학과 김민정입니다.",
    sentAt: "오후 8:28",
    direction: "incoming",
    avatarTone: "green",
    avatarSrc: "/icons/chat/character3.svg",
  },
  {
    id: "haeeun-intro",
    senderName: "이해은",
    body: "안녕하세요. 서울대학교 4학년 경영학과 이해은입니다.",
    sentAt: "오후 8:28",
    direction: "incoming",
    avatarTone: "blue",
    avatarSrc: "/icons/chat/character2.svg",
  },
  {
    id: "me-intro",
    senderName: "박준수",
    body: "안녕하세요. 서울대학교 4학년 경영학과 박준수 입니다.",
    sentAt: "오후 8:28",
    direction: "outgoing",
    unreadLabel: "N",
  },
];
