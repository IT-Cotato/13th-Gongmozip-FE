export type ChatMessage = {
  id: string;
  senderId?: string;
  senderName: string;
  body: string;
  sentAt: string;
  sentAtDateKey?: string;
  sentAtDateLabel?: string;
  direction: "incoming" | "outgoing";
  senderType?: ChatSenderType;
  messageType?: ChatMessageType;
  metadata?: ChatMessageMetadata;
  avatarTone?: "robot" | "green" | "blue" | "coral";
  avatarSrc?: string;
  unreadLabel?: string;
};

export type ChatSenderType = "MEMBER" | "CHATBOT" | "SYSTEM" | (string & {});

export type ChatMessageType =
  | "TALK"
  | "TEXT"
  | "SYSTEM"
  | "BOT"
  | "CHATBOT_GUIDE_CARD"
  | "LEADER_NOMINATION_CARD"
  | "LEADER_VOTE_CARD"
  | "LEADER_RESULT_CARD"
  | "CONTEST_RECOMMEND_CARD"
  | "CONTEST_SHARE_CARD"
  | "CONTEST_CANDIDATE_CARD"
  | "CONTEST_VOTE_CARD"
  | "CONTEST_RESULT_CARD"
  | (string & {});

export type ChatMessageMetadata = Record<
  string,
  string | number | boolean | null | string[] | number[]
>;

export type ChatRoom = {
  id: string;
  title: string;
  memberCount: number;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  avatarItems?: ChatRoomAvatarItem[];
  avatarSrcs: string[];
  projectEndedAt?: string | null;
};

export type ChatRoomAvatarItem = {
  bgColor?: string;
  src?: string;
};

export type ChatMember = {
  id: string;
  memberId?: string;
  profileId?: number;
  name: string;
  isMe?: boolean;
  isChatbot?: boolean;
  isLeader?: boolean;
  avatarTone: NonNullable<ChatMessage["avatarTone"]>;
  avatarSrc?: string;
  school?: string;
  major?: string;
  grade?: string;
  introduction?: string;
  strengths?: string[];
};
