import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ChatMember, ChatMessage, ChatRoom } from "@/app/chat/_data/mockMessages";
import { apiFetch } from "@/lib/http";

type UnknownRecord = Record<string, unknown>;

export type ChatTeamResponse = UnknownRecord;
export type ChatTeamMemberResponse = UnknownRecord;
export type ChatMessageResponse = UnknownRecord;

export type TeamMembersResponse = {
  members: ChatTeamMemberResponse[];
  leaderSelectionDeadlineAt: string | null;
  myTeamMemberId: number | string | null;
};

export type TeamMessagesResponse = {
  messages: ChatMessageResponse[];
};

export const chatTeamsQueryKey = ["chat", "teams"] as const;
export const chatTeamMembersQueryKey = (teamId: string) => ["chat", "teams", teamId, "members"] as const;
export const chatTeamMessagesQueryKey = (teamId: string) => ["chat", "teams", teamId, "messages"] as const;

export function fetchChatTeams() {
  return apiFetch<ChatTeamResponse[] | { teams?: ChatTeamResponse[]; content?: ChatTeamResponse[] }>(
    "/api/teams",
  );
}

export function markChatTeamAsRead(teamId: string) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/read`, {
    method: "PATCH",
  });
}

export async function fetchChatTeamMembers(teamId: string): Promise<TeamMembersResponse> {
  const data = await apiFetch<
    | ChatTeamMemberResponse[]
    | {
        members?: ChatTeamMemberResponse[];
        teamMembers?: ChatTeamMemberResponse[];
        leaderSelectionDeadlineAt?: string | null;
        myTeamMemberId?: number | string | null;
      }
  >(`/api/teams/${encodeURIComponent(teamId)}/members`);

  if (Array.isArray(data)) {
    return {
      members: data,
      leaderSelectionDeadlineAt: null,
      myTeamMemberId: findMyTeamMemberId(data),
    };
  }

  const members = data.members ?? data.teamMembers ?? [];

  return {
    members,
    leaderSelectionDeadlineAt: data.leaderSelectionDeadlineAt ?? null,
    myTeamMemberId: data.myTeamMemberId ?? findMyTeamMemberId(members),
  };
}

export async function fetchChatTeamMessages(teamId: string): Promise<TeamMessagesResponse> {
  const data = await apiFetch<
    ChatMessageResponse[] | { messages?: ChatMessageResponse[]; content?: ChatMessageResponse[] }
  >(`/api/teams/${encodeURIComponent(teamId)}/messages`);

  return {
    messages: Array.isArray(data) ? data : (data.messages ?? data.content ?? []),
  };
}

export function useChatTeamsQuery() {
  return useQuery({
    queryKey: chatTeamsQueryKey,
    queryFn: fetchChatTeams,
    select: (data) => {
      const teams = Array.isArray(data) ? data : (data.teams ?? data.content ?? []);

      return teams.map(mapChatTeam);
    },
  });
}

export function useChatTeamMembersQuery(teamId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: chatTeamMembersQueryKey(teamId),
    queryFn: () => fetchChatTeamMembers(teamId),
    enabled: (options.enabled ?? true) && teamId.length > 0,
    select: (data) => ({
      ...data,
      chatMembers: data.members.map((member, index) =>
        mapChatMember(member, data.myTeamMemberId, index),
      ),
    }),
  });
}

export function useChatTeamMessagesQuery(
  teamId: string,
  members: ChatMember[] = [],
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: chatTeamMessagesQueryKey(teamId),
    queryFn: () => fetchChatTeamMessages(teamId),
    enabled: (options.enabled ?? true) && teamId.length > 0,
    select: (data) => ({
      messages: [...data.messages]
        .sort((a, b) => getMessageTime(a) - getMessageTime(b))
        .map((message) => mapChatMessage(message, members)),
    }),
  });
}

export function useMarkChatTeamAsReadMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markChatTeamAsRead(teamId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamsQueryKey });
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
    },
  });
}

export type ReportUserPayload = {
  reportedMemberId: number | string;
  teamId?: number | string;
  reasonCode: string;
  customReasonText?: string;
};

export function leaveChatTeam(teamId: string) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/members/me`, {
    method: "DELETE",
  });
}

export function updateChatbotStatus(teamId: string, enabled: boolean) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/chatbot`, {
    method: "PATCH",
    body: { enabled },
  });
}

export function reportUser(payload: ReportUserPayload) {
  return apiFetch<null>("/api/reports", {
    method: "POST",
    body: payload,
  });
}

export function useLeaveChatTeamMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveChatTeam(teamId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamsQueryKey });
      void queryClient.invalidateQueries({ queryKey: chatTeamMembersQueryKey(teamId) });
    },
  });
}

export function useUpdateChatbotStatusMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => updateChatbotStatus(teamId, enabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamMembersQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
    },
  });
}

export function useReportUserMutation() {
  return useMutation({
    mutationFn: (payload: ReportUserPayload) => reportUser(payload),
  });
}


function mapChatTeam(team: ChatTeamResponse): ChatRoom {
  const id = String(
    getValue(team, ["teamId", "id", "chatRoomId", "roomId"]) ?? `team-${getString(team, ["name", "teamName"])}`,
  );
  const memberCount = getNumber(team, ["memberCount", "teamMemberCount", "membersCount"]) ?? 0;
  const fallbackTitle = memberCount > 0 ? `팀원 ${memberCount}명` : "채팅방";
  const title = getString(team, ["title", "teamName", "name", "roomName"]) ?? fallbackTitle;
  const lastMessage =
    getString(team, ["lastMessage", "lastMessageContent", "lastMessagePreview", "recentMessage"]) ??
    "아직 메시지가 없습니다.";

  return {
    id,
    title,
    memberCount,
    lastMessage,
    lastMessageAt: formatRelativeTime(getString(team, ["lastMessageAt", "lastMessageCreatedAt", "updatedAt"])),
    unreadCount: getNumber(team, ["unreadCount", "unreadMessageCount"]) ?? 0,
    avatarSrcs: getStringArray(team, ["avatarSrcs", "memberProfileImageUrls", "profileImageUrls"]),
  };
}

function mapChatMember(
  member: ChatTeamMemberResponse,
  myTeamMemberId: number | string | null,
  index: number,
): ChatMember {
  const id = String(getValue(member, ["teamMemberId", "id", "memberId", "profileId"]) ?? index);
  const name = getString(member, ["nickname", "name", "memberName", "profileName"]) ?? "팀원";
  const avatarTones: ChatMember["avatarTone"][] = ["green", "blue", "coral"];
  const me = getBoolean(member, ["me", "isMe"]) ?? (myTeamMemberId !== null && id === String(myTeamMemberId));

  return {
    id,
    name,
    isMe: me,
    avatarTone: avatarTones[index % avatarTones.length] ?? "green",
    avatarSrc: getString(member, ["profileImageUrl", "avatarUrl", "characterImageUrl"]) ?? undefined,
    school: getString(member, ["school", "schoolName"]) ?? undefined,
    major: getString(member, ["major", "majorName"]) ?? undefined,
    grade: getString(member, ["grade"]) ?? undefined,
    introduction: getString(member, ["introduction", "bio", "description"]) ?? "",
  };
}

function mapChatMessage(message: ChatMessageResponse, members: ChatMember[]): ChatMessage {
  const senderId = getValue(message, ["senderTeamMemberId", "teamMemberId", "senderId", "memberId"]);
  const sender = senderId === undefined ? undefined : members.find((member) => member.id === String(senderId));
  const isMine = getBoolean(message, ["me", "isMe", "mine", "isMine"]) ?? sender?.isMe ?? false;
  const senderName =
    getString(message, ["senderName", "senderNickname", "nickname", "memberName"]) ??
    sender?.name ??
    (isSystemMessage(message) ? "시스템" : "팀원");

  return {
    id: String(getValue(message, ["messageId", "id"]) ?? `${senderName}-${getMessageTime(message)}`),
    senderName,
    body: getString(message, ["content", "body", "message"]) ?? "",
    sentAt: formatMessageTime(getString(message, ["createdAt", "sentAt", "timestamp"])),
    direction: isMine ? "outgoing" : "incoming",
    avatarTone: isSystemMessage(message) ? "robot" : (sender?.avatarTone ?? "green"),
    avatarSrc: isSystemMessage(message)
      ? "/icons/chat/chat_bot.svg"
      : (sender?.avatarSrc ?? getString(message, ["senderProfileImageUrl", "profileImageUrl"]) ?? undefined),
  };
}

function findMyTeamMemberId(members: ChatTeamMemberResponse[]) {
  const me = members.find((member) => getBoolean(member, ["me", "isMe"]) === true);

  return me ? (getValue(me, ["teamMemberId", "id", "memberId"]) as number | string | null) : null;
}

function isSystemMessage(message: ChatMessageResponse) {
  const messageType = getString(message, ["messageType", "type"]);

  return messageType === "SYSTEM" || messageType === "BOT";
}

function getMessageTime(message: ChatMessageResponse) {
  const dateValue = getString(message, ["createdAt", "sentAt", "timestamp"]);
  const time = dateValue ? new Date(dateValue).getTime() : 0;

  return Number.isFinite(time) ? time : 0;
}

function getValue(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function getString(record: UnknownRecord, keys: string[]) {
  const value = getValue(record, keys);

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getNumber(record: UnknownRecord, keys: string[]) {
  const value = getValue(record, keys);

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
}

function getBoolean(record: UnknownRecord, keys: string[]) {
  const value = getValue(record, keys);

  return typeof value === "boolean" ? value : undefined;
}

function getStringArray(record: UnknownRecord, keys: string[]) {
  const value = getValue(record, keys);

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function formatRelativeTime(dateValue: string | undefined) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return `${Math.floor(diffHours / 24)}일 전`;
}

function formatMessageTime(dateValue: string | undefined) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
