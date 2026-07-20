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
    avatarSrcs: [],
  },
  {
    id: "team-brand-02",
    title: "김민정, 이해은, 박준수",
    memberCount: 4,
    lastMessage: "요즘 날씨 너무 좋아서 야외 활동하기 딱이야!",
    lastMessageAt: "15시간 전",
    unreadCount: 0,
    avatarSrcs: [],
  },
  {
    id: "team-service-03",
    title: "김민정, 이해은, 박준수",
    memberCount: 4,
    lastMessage: "요즘 날씨 너무 좋아서 야외 활동하기 딱이야!",
    lastMessageAt: "15시간 전",
    unreadCount: 0,
    avatarSrcs: [],
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "bot-intro",
    senderName: "챗봇",
    body: "안녕하세요. 저는 팀 운영을 도와주는 AI 챗봇이에요. 팀 매칭이 완료되었어요. 각자 간단한 자기소개와 인사를 나눠볼까요?",
    sentAt: "오후 8:28",
    direction: "incoming",
    avatarTone: "robot",
    avatarSrc: undefined,
  },
  {
    id: "minjeong-intro",
    senderName: "김민정",
    body: "안녕하세요. 서울대학교 4학년 경영학과 김민정입니다.",
    sentAt: "오후 8:28",
    direction: "incoming",
    avatarTone: "green",
    avatarSrc: undefined,
  },
  {
    id: "haeeun-intro",
    senderName: "이해은",
    body: "안녕하세요. 서울대학교 4학년 경영학과 이해은입니다.",
    sentAt: "오후 8:28",
    direction: "incoming",
    avatarTone: "blue",
    avatarSrc: undefined,
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
