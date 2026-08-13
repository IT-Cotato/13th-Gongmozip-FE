import { Client, type IMessage } from "@stomp/stompjs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import type {
  ChatMember,
  ChatMessage,
  ChatMessageMetadata,
  ChatSenderType,
  ChatMessageType,
  ChatRoom,
} from "@/app/chat/_data/mockMessages";
import type { RecommendedContest } from "@/app/chat/_components/leader-election/types";
import type { ReviewMember } from "@/app/chat/_components/member-review/types";
import { API_BASE_URL, apiFetch, isBaseResponse } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";

type UnknownRecord = Record<string, unknown>;

const WS_BASE_URL = (process.env.NEXT_PUBLIC_WS_BASE_URL ?? API_BASE_URL).replace(/\/+$/, "");

export type ChatTeamResponse = UnknownRecord;
export type ChatTeamMemberResponse = UnknownRecord;
export type ChatMessageResponse = UnknownRecord;
export type ContestCandidateResponse = UnknownRecord;
export type ContestVoteStatusResponse = UnknownRecord;
export type ReviewTargetResponse = UnknownRecord;
export type ChatRealtimeStatus = "idle" | "connecting" | "connected" | "error";

export type TeamMembersResponse = {
  members: ChatTeamMemberResponse[];
  leaderSelectionDeadlineAt: string | null;
  myTeamMemberId: number | string | null;
};

export type TeamMessagesResponse = {
  messages: ChatMessageResponse[];
  nextCursor: string | null;
  hasNext: boolean;
};

export type ContestVoteResultStatus = "normal" | "noVotes" | "tie";

export type ContestVoteResultItem = {
  contestCandidateId?: number;
  contestId?: number;
  voteCount: number;
  percent: number;
  isWinner: boolean;
};

export type ContestVoteStatus = {
  result: ContestVoteResultStatus;
  hasVotes: boolean;
  isTie: boolean;
  participantCount: number;
  results: ContestVoteResultItem[];
};

export const chatTeamsQueryKey = ["chat", "teams"] as const;
export const chatTeamMembersQueryKey = (teamId: string) => ["chat", "teams", teamId, "members"] as const;
export const chatTeamMessagesQueryKey = (teamId: string) => ["chat", "teams", teamId, "messages"] as const;
export const contestCandidatesQueryKey = (teamId: string) =>
  ["chat", "teams", teamId, "contest-candidates"] as const;
export const contestVotesQueryKey = (teamId: string) =>
  ["chat", "teams", teamId, "contest-candidates", "votes"] as const;
export const reviewTargetsQueryKey = (teamId: string) =>
  ["chat", "teams", teamId, "reviews", "targets"] as const;

export function fetchChatTeams() {
  return apiFetch<
    ChatTeamResponse[] | { rooms?: ChatTeamResponse[]; teams?: ChatTeamResponse[]; content?: ChatTeamResponse[] }
  >("/api/teams");
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

export async function fetchChatTeamMessages(
  teamId: string,
  cursor?: string | null,
): Promise<TeamMessagesResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("size", "50");

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  const queryString = searchParams.toString();
  const data = await apiFetch<
    | ChatMessageResponse[]
    | {
        messages?: ChatMessageResponse[];
        content?: ChatMessageResponse[];
        nextCursor?: string | number | null;
        previousCursor?: string | number | null;
        cursor?: string | number | null;
        hasNext?: boolean;
        hasPrevious?: boolean;
      }
  >(`/api/teams/${encodeURIComponent(teamId)}/messages?${queryString}`);

  if (Array.isArray(data)) {
    return {
      messages: data,
      nextCursor: null,
      hasNext: false,
    };
  }

  const nextCursor = data.nextCursor ?? data.previousCursor ?? data.cursor ?? null;

  return {
    messages: data.messages ?? data.content ?? [],
    nextCursor: nextCursor === null ? null : String(nextCursor),
    hasNext: data.hasNext ?? data.hasPrevious ?? nextCursor !== null,
  };
}

export function useChatTeamsQuery() {
  return useQuery({
    queryKey: chatTeamsQueryKey,
    queryFn: fetchChatTeams,
    select: (data) => {
      const teams = Array.isArray(data) ? data : (data.rooms ?? data.teams ?? data.content ?? []);

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
  return useInfiniteQuery({
    queryKey: chatTeamMessagesQueryKey(teamId),
    queryFn: ({ pageParam }) => fetchChatTeamMessages(teamId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: (options.enabled ?? true) && teamId.length > 0,
    select: (data) => ({
      ...data,
      messages: data.pages
        .flatMap((page) => page.messages)
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

export type LeaderCandidacyPayload = {
  wants: boolean;
};

export type LeaderVotePayload = {
  candidateTeamMemberId: number;
};

export type TeamProgressPayload = {
  progressPercent: number;
};

export type TeamSubmissionPayload = {
  completed: boolean;
};

export type ShareContestToChatsPayload = {
  contestId: number | string;
  teamIds: string[];
};

export type ReviewScoreValue = "DISAGREE" | "NEUTRAL" | "AGREE";

export type TeamReviewPayload = {
  revieweeTeamMemberId: number;
  communicationScore: ReviewScoreValue;
  participationScore: ReviewScoreValue;
  keywords: string[];
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

export function useChatRealtime(
  teamId: string,
  options: { enabled?: boolean } = {},
) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const normalizedAccessToken = useMemo(() => normalizeAccessToken(accessToken), [accessToken]);
  const clientRef = useRef<Client | null>(null);
  const [status, setStatus] = useState<ChatRealtimeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const enabled = (options.enabled ?? true) && teamId.length > 0 && API_BASE_URL.length > 0;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const stompClient = new Client({
      brokerURL: getWebSocketUrl("/ws"),
      connectHeaders: normalizedAccessToken
        ? { Authorization: `Bearer ${normalizedAccessToken}` }
        : {},
      debug: () => undefined,
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setStatus("connected");
        setErrorMessage(null);

        stompClient.subscribe(`/topic/teams/${teamId}`, (message) => {
          const payload = parseStompMessage(message);

          if (!isRecord(payload)) {
            return;
          }

          if (isChatMessageEvent(payload)) {
            queryClient.setQueryData<InfiniteData<TeamMessagesResponse>>(
              chatTeamMessagesQueryKey(teamId),
              (current) => appendChatMessagePages(current, payload),
            );
            void queryClient.invalidateQueries({ queryKey: chatTeamsQueryKey });
            return;
          }

          void queryClient.invalidateQueries({ queryKey: chatTeamsQueryKey });
        });

        stompClient.subscribe("/user/queue/errors", (message) => {
          const payload = parseStompMessage(message);
          setErrorMessage(getRealtimeErrorMessage(payload));
        });
      },
      onStompError: (frame) => {
        setStatus("error");
        setErrorMessage(frame.headers.message ?? "채팅 서버 연결 중 오류가 발생했습니다.");
      },
      onWebSocketError: () => {
        setStatus("error");
        setErrorMessage("채팅 서버에 연결하지 못했습니다.");
      },
      onWebSocketClose: () => {
        setStatus((currentStatus) => (currentStatus === "connected" ? "connecting" : currentStatus));
      },
    });

    clientRef.current = stompClient;
    stompClient.activate();

    return () => {
      clientRef.current = null;
      void stompClient.deactivate();
    };
  }, [enabled, normalizedAccessToken, queryClient, teamId]);

  const sendMessage = (content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent || !clientRef.current?.connected) {
      return false;
    }

    clientRef.current.publish({
      destination: `/app/teams/${teamId}/messages`,
      body: JSON.stringify({ content: trimmedContent }),
    });

    return true;
  };

  return {
    errorMessage: enabled ? errorMessage : null,
    isConnected: enabled && status === "connected",
    sendMessage,
    status: enabled ? status : "idle",
  };
}

export function fetchContestCandidates(teamId: string) {
  return apiFetch<
    | ContestCandidateResponse[]
    | {
        contestCandidates?: ContestCandidateResponse[];
        candidates?: ContestCandidateResponse[];
        contests?: ContestCandidateResponse[];
        content?: ContestCandidateResponse[];
      }
  >(`/api/teams/${encodeURIComponent(teamId)}/contest-candidates`);
}

export function addContestCandidate(teamId: string, contestId: number) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/contest-candidates`, {
    method: "POST",
    body: { contestId },
  });
}

export function deleteContestCandidate(teamId: string, contestCandidateId: number) {
  return apiFetch<null>(
    `/api/teams/${encodeURIComponent(teamId)}/contest-candidates/${encodeURIComponent(String(contestCandidateId))}`,
    {
      method: "DELETE",
    },
  );
}

export function voteContestCandidates(teamId: string, contestCandidateIds: number[]) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/contest-candidates/votes`, {
    method: "POST",
    body: { contestCandidateIds },
  });
}

export function fetchContestVoteStatus(teamId: string) {
  return apiFetch<ContestVoteStatusResponse>(
    `/api/teams/${encodeURIComponent(teamId)}/contest-candidates/votes`,
  );
}

export function shareContestToChat(teamId: string, contestId: number) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/contest-shares`, {
    method: "POST",
    body: { contestId },
  });
}

export async function shareContestToChats(payload: ShareContestToChatsPayload) {
  const contestId = Number(payload.contestId);

  if (!Number.isFinite(contestId)) {
    throw new Error("공모전 정보를 확인할 수 없습니다.");
  }

  await Promise.all(payload.teamIds.map((teamId) => shareContestToChat(teamId, contestId)));
}

export function updateTeamProgress(teamId: string, payload: TeamProgressPayload) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/progress`, {
    method: "PATCH",
    body: payload,
  });
}

export function updateTeamSubmission(teamId: string, payload: TeamSubmissionPayload) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/submission`, {
    method: "PATCH",
    body: payload,
  });
}

export function fetchReviewTargets(teamId: string) {
  return apiFetch<
    | ReviewTargetResponse[]
    | {
        targets?: ReviewTargetResponse[];
        members?: ReviewTargetResponse[];
        reviewTargets?: ReviewTargetResponse[];
        content?: ReviewTargetResponse[];
      }
  >(`/api/teams/${encodeURIComponent(teamId)}/reviews/targets`);
}

export function submitTeamReview(teamId: string, payload: TeamReviewPayload) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/reviews`, {
    method: "POST",
    body: payload,
  });
}

export function updateLeaderCandidacy(teamId: string, payload: LeaderCandidacyPayload) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/leader-candidacy`, {
    method: "PATCH",
    body: payload,
  });
}

export function voteLeader(teamId: string, payload: LeaderVotePayload) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/leader-votes`, {
    method: "POST",
    body: payload,
  });
}

export function acceptLeaderAiRecommendation(teamId: string) {
  return apiFetch<null>(
    `/api/teams/${encodeURIComponent(teamId)}/leader-votes/ai-recommendation/accept`,
    {
      method: "POST",
    },
  );
}

export function requestLeaderRevote(teamId: string) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/leader-votes/revote`, {
    method: "POST",
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

export function useContestCandidatesQuery(teamId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: contestCandidatesQueryKey(teamId),
    queryFn: () => fetchContestCandidates(teamId),
    enabled: (options.enabled ?? true) && teamId.length > 0,
    select: (data) => {
      const candidates = Array.isArray(data)
        ? data
        : (data.contestCandidates ?? data.candidates ?? data.contests ?? data.content ?? []);

      return candidates.map(mapContestCandidate);
    },
  });
}

export function useContestVoteStatusQuery(teamId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: contestVotesQueryKey(teamId),
    queryFn: () => fetchContestVoteStatus(teamId),
    enabled: (options.enabled ?? true) && teamId.length > 0,
    select: mapContestVoteStatus,
  });
}

export function useAddContestCandidateMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contestId: number) => addContestCandidate(teamId, contestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contestCandidatesQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: contestVotesQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
    },
  });
}

export function useDeleteContestCandidateMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contestCandidateId: number) => deleteContestCandidate(teamId, contestCandidateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contestCandidatesQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
    },
  });
}

export function useVoteContestCandidatesMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contestCandidateIds: number[]) => voteContestCandidates(teamId, contestCandidateIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contestVotesQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
    },
  });
}

export function useShareContestToChatMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contestId: number) => shareContestToChat(teamId, contestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
    },
  });
}

export function useShareContestToChatsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shareContestToChats,
    onSuccess: (_data, variables) => {
      variables.teamIds.forEach((teamId) => {
        void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
      });
      void queryClient.invalidateQueries({ queryKey: chatTeamsQueryKey });
    },
  });
}

export function useUpdateTeamProgressMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TeamProgressPayload) => updateTeamProgress(teamId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
    },
  });
}

export function useUpdateTeamSubmissionMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TeamSubmissionPayload) => updateTeamSubmission(teamId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamsQueryKey });
    },
  });
}

export function useReviewTargetsQuery(teamId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: reviewTargetsQueryKey(teamId),
    queryFn: () => fetchReviewTargets(teamId),
    enabled: (options.enabled ?? true) && teamId.length > 0,
    select: (data) => {
      const targets = Array.isArray(data)
        ? data
        : (data.targets ?? data.members ?? data.reviewTargets ?? data.content ?? []);

      return targets.map(mapReviewTarget);
    },
  });
}

export function useSubmitTeamReviewMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TeamReviewPayload) => submitTeamReview(teamId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewTargetsQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
    },
  });
}

export function useUpdateLeaderCandidacyMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LeaderCandidacyPayload) => updateLeaderCandidacy(teamId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMembersQueryKey(teamId) });
    },
  });
}

export function useVoteLeaderMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LeaderVotePayload) => voteLeader(teamId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMembersQueryKey(teamId) });
    },
  });
}

export function useAcceptLeaderAiRecommendationMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => acceptLeaderAiRecommendation(teamId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMembersQueryKey(teamId) });
    },
  });
}

export function useRequestLeaderRevoteMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestLeaderRevote(teamId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMembersQueryKey(teamId) });
    },
  });
}

function parseStompMessage(message: IMessage): unknown {
  if (!message.body) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(message.body);

    return isBaseResponse(parsedValue) ? parsedValue.data : parsedValue;
  } catch {
    return message.body;
  }
}

function appendChatMessage(
  current: TeamMessagesResponse | undefined,
  message: ChatMessageResponse,
): TeamMessagesResponse {
  const messages = current?.messages ?? [];
  const messageId = getValue(message, ["messageId", "id"]);

  if (
    messageId !== undefined &&
    messages.some((currentMessage) => getValue(currentMessage, ["messageId", "id"]) === messageId)
  ) {
    return current ?? { messages, nextCursor: null, hasNext: false };
  }

  return {
    nextCursor: current?.nextCursor ?? null,
    hasNext: current?.hasNext ?? false,
    messages: [...messages, message].sort((a, b) => getMessageTime(a) - getMessageTime(b)),
  };
}

function appendChatMessagePages(
  current: InfiniteData<TeamMessagesResponse> | undefined,
  message: ChatMessageResponse,
): InfiniteData<TeamMessagesResponse> | undefined {
  if (!current) {
    return current;
  }

  const pages = current.pages.map((page) => ({
    ...page,
    messages: [...page.messages],
  }));
  const messageId = getValue(message, ["messageId", "id"]);

  if (
    messageId !== undefined &&
    pages.some((page) =>
      page.messages.some((currentMessage) => getValue(currentMessage, ["messageId", "id"]) === messageId),
    )
  ) {
    return current;
  }

  const firstPage = pages[0] ?? { messages: [], nextCursor: null, hasNext: false };
  pages[0] = appendChatMessage(firstPage, message);

  return {
    ...current,
    pages,
  };
}

function isChatMessageEvent(value: UnknownRecord): value is ChatMessageResponse {
  return (
    getString(value, ["content", "body", "message"]) !== undefined ||
    getString(value, ["messageType", "type", "senderType"]) !== undefined ||
    getString(value, ["createdAt", "sentAt", "timestamp"]) !== undefined
  );
}

function getRealtimeErrorMessage(value: unknown) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (!isRecord(value)) {
    return "메시지 처리 중 오류가 발생했습니다.";
  }

  return (
    getString(value, ["message", "error", "reason"]) ??
    "메시지 처리 중 오류가 발생했습니다."
  );
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAccessToken(accessToken: string | null) {
  if (!accessToken) {
    return null;
  }

  return accessToken.startsWith("Bearer ") ? accessToken.slice("Bearer ".length) : accessToken;
}

function getWebSocketUrl(path: string) {
  const url = new URL(path, `${WS_BASE_URL}/`);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

  return url.toString();
}

function mapChatTeam(team: ChatTeamResponse): ChatRoom {
  const id = String(
    getValue(team, ["teamId", "id", "chatRoomId", "roomId"]) ??
      `team-${getString(team, ["roomTitle", "title", "name", "teamName"])}`,
  );
  const memberCount =
    getNumber(team, ["participantCount", "memberCount", "teamMemberCount", "membersCount"]) ?? 0;
  const fallbackTitle = memberCount > 0 ? `팀원 ${memberCount}명` : "채팅방";
  const title =
    getString(team, ["roomTitle", "title", "teamName", "name", "roomName"]) ?? fallbackTitle;
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
  const messageType = getMessageType(message);
  const senderType = getSenderType(message);
  const isChatbotMessage = senderType === "CHATBOT";
  const isSystemMessage = senderType === "SYSTEM" || isSystemMessageType(messageType);
  const isMine = getBoolean(message, ["me", "isMe", "mine", "isMine"]) ?? sender?.isMe ?? false;
  const senderName =
    getString(message, ["senderName", "senderNickname", "nickname", "memberName"]) ??
    sender?.name ??
    (isChatbotMessage ? "\uCC57\uBD07" : isSystemMessage ? "\uC2DC\uC2A4\uD15C" : "\uD300\uC6D0");

  return {
    id: String(getValue(message, ["messageId", "id"]) ?? `${senderName}-${getMessageTime(message)}`),
    senderName,
    body: getString(message, ["content", "body", "message"]) ?? "",
    sentAt: formatMessageTime(getString(message, ["createdAt", "sentAt", "timestamp"])),
    direction: isMine ? "outgoing" : "incoming",
    senderType,
    messageType,
    metadata: getMessageMetadata(message),
    avatarTone: isChatbotMessage || isSystemMessage ? "robot" : (sender?.avatarTone ?? "green"),
    avatarSrc: isChatbotMessage || isSystemMessage
      ? "/icons/chat/chat_bot.svg"
      : (sender?.avatarSrc ?? getString(message, ["senderProfileImageUrl", "profileImageUrl"]) ?? undefined),
  };
}

function mapContestCandidate(candidate: ContestCandidateResponse): RecommendedContest {
  const contestId = getNumber(candidate, ["contestId", "id"]);
  const contestCandidateId =
    getNumber(candidate, ["contestCandidateId", "candidateId"]) ?? contestId ?? 0;
  const dday = getString(candidate, ["dDay", "dday", "deadlineLabel"]) ?? "";
  const viewCount = getNumber(candidate, ["viewCount", "views"]) ?? 0;

  return {
    id: String(contestCandidateId),
    contestId,
    contestCandidateId,
    category: getString(candidate, ["category", "contestCategory"]) ?? "공모전",
    dday,
    imageSrc:
      getString(candidate, ["posterImageUrl", "imageUrl", "thumbnailUrl", "posterUrl"]) ?? undefined,
    organizer: getString(candidate, ["organizer", "host", "organization"]) ?? "",
    title:
      getString(candidate, ["title", "contestTitle", "name"]) ??
      (contestId ? `공모전 #${contestId}` : "공모전"),
    viewCount: viewCount.toLocaleString("ko-KR"),
  };
}

function mapContestVoteStatus(status: ContestVoteStatusResponse): ContestVoteStatus {
  const resultsValue = getValue(status, ["results", "voteResults", "contestCandidates", "candidates"]);
  const results = Array.isArray(resultsValue)
    ? resultsValue.filter(isRecord).map(mapContestVoteResultItem)
    : [];
  const participantCount =
    getNumber(status, ["participantCount", "voterCount", "totalVoteCount", "totalVotes"]) ??
    results.reduce((sum, result) => sum + result.voteCount, 0);
  const explicitStatus = getString(status, ["result", "status", "voteStatus"])?.toUpperCase();
  const isTie = getBoolean(status, ["tie", "isTie"]) ?? (explicitStatus === "TIE");
  const hasVotes =
    getBoolean(status, ["hasVotes"]) ??
    (explicitStatus === "NO_VOTES" || explicitStatus === "NO_VOTE"
      ? false
      : participantCount > 0 || results.some((result) => result.voteCount > 0));

  return {
    result: !hasVotes ? "noVotes" : isTie ? "tie" : "normal",
    hasVotes,
    isTie,
    participantCount,
    results,
  };
}

function mapContestVoteResultItem(result: UnknownRecord): ContestVoteResultItem {
  return {
    contestCandidateId: getNumber(result, ["contestCandidateId", "candidateId", "id"]),
    contestId: getNumber(result, ["contestId"]),
    voteCount: getNumber(result, ["voteCount", "votes", "count"]) ?? 0,
    percent: getNumber(result, ["percent", "votePercent", "rate"]) ?? 0,
    isWinner: getBoolean(result, ["winner", "isWinner"]) ?? false,
  };
}

function mapReviewTarget(target: ReviewTargetResponse): ReviewMember {
  const id = String(getValue(target, ["teamMemberId", "revieweeTeamMemberId", "id", "memberId"]) ?? "");
  const role = getString(target, ["role", "teamRole"]);

  return {
    id,
    name: getString(target, ["nickname", "name", "memberName", "profileName"]) ?? "팀원",
    alreadyReviewed: getBoolean(target, ["alreadyReviewed", "reviewed"]) ?? false,
    avatarTone: "green",
    avatarSrc:
      getString(target, ["profileImageUrl", "avatarUrl", "characterImageUrl", "senderAvatar"]) ??
      undefined,
    isLeader: role === "LEADER" || getBoolean(target, ["leader", "isLeader"]) === true,
    isMe: getBoolean(target, ["me", "isMe"]) ?? false,
  };
}

function findMyTeamMemberId(members: ChatTeamMemberResponse[]) {
  const me = members.find((member) => getBoolean(member, ["me", "isMe"]) === true);

  return me ? (getValue(me, ["teamMemberId", "id", "memberId"]) as number | string | null) : null;
}

function getMessageType(message: ChatMessageResponse): ChatMessageType {
  return (getString(message, ["messageType", "type"]) ?? "TALK") as ChatMessageType;
}

function getSenderType(message: ChatMessageResponse): ChatSenderType {
  return (getString(message, ["senderType"]) ?? "MEMBER") as ChatSenderType;
}

function isSystemMessageType(messageType: ChatMessageType) {
  return messageType === "SYSTEM" || messageType === "BOT" || messageType.endsWith("_CARD");
}

function getMessageMetadata(message: ChatMessageResponse): ChatMessageMetadata | undefined {
  const value = getValue(message, ["metadata"]);

  if (typeof value === "string") {
    try {
      const parsedValue: unknown = JSON.parse(value);
      return isChatMessageMetadata(parsedValue) ? parsedValue : undefined;
    } catch {
      return undefined;
    }
  }

  return isChatMessageMetadata(value) ? value : undefined;
}

function isChatMessageMetadata(value: unknown): value is ChatMessageMetadata {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (item) =>
      item === null ||
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean" ||
      (Array.isArray(item) &&
        item.every((arrayItem) => typeof arrayItem === "string" || typeof arrayItem === "number")),
  );
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
