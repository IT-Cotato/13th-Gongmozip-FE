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
  ChatRoomAvatarItem,
} from "@/app/chat/_data/chatTypes";
import type { RecommendedContest } from "@/app/chat/_components/leader-election/types";
import type { ReviewMember } from "@/app/chat/_components/member-review/types";
import { API_BASE_URL, apiFetch, isBaseResponse } from "@/lib/http";
import { getNextImageSafeSrc } from "@/lib/imageSources";
import { MYPAGE_SUMMARY_QUERY_KEY_PREFIX } from "@/queries/useMypageSummaryQuery";
import { useAuthStore } from "@/stores/useAuthStore";
import { contestCategoryLabels } from "./useContestsQuery";

type UnknownRecord = Record<string, unknown>;

const WS_BASE_URL = (process.env.NEXT_PUBLIC_WS_BASE_URL ?? API_BASE_URL).replace(/\/+$/, "");
const HAS_TIMEZONE_REGEX = /(Z|[+-]\d{2}:?\d{2})$/;
const CHAT_TIME_ZONE = "Asia/Seoul";
const KOREA_TIME_ZONE_OFFSET = "+09:00";
const LOCAL_CONTEST_SHARE_SENDER_TTL_MS = 5 * 60 * 1000;
const localContestShareSenderByTeamId = new Map<string, { contestId: number; sharedAt: number }>();
const DIRECT_TEAM_MEMBER_ID_KEYS = [
  "senderTeamMemberId",
  "teamMemberId",
  "teamMemberNo",
  "writerTeamMemberId",
  "createdByTeamMemberId",
  "authorTeamMemberId",
  "sharedByTeamMemberId",
  "shareTeamMemberId",
];
const DIRECT_MEMBER_ID_KEYS = [
  "senderMemberId",
  "memberId",
  "writerMemberId",
  "createdByMemberId",
  "authorMemberId",
  "sharedByMemberId",
  "shareMemberId",
];
const METADATA_TEAM_MEMBER_ID_KEYS = [
  "senderTeamMemberId",
  "writerTeamMemberId",
  "createdByTeamMemberId",
  "authorTeamMemberId",
  "sharedByTeamMemberId",
  "shareTeamMemberId",
];
const METADATA_MEMBER_ID_KEYS = [
  "senderMemberId",
  "writerMemberId",
  "createdByMemberId",
  "authorMemberId",
  "sharedByMemberId",
  "shareMemberId",
];
const DIRECT_SENDER_ID_KEYS = [
  "senderId",
  "writerId",
  "createdBy",
  "createdById",
  "authorId",
  "sharedBy",
  "sharedById",
];
const METADATA_SENDER_ID_KEYS = [
  "senderId",
  "writerId",
  "createdBy",
  "createdById",
  "authorId",
  "sharedBy",
  "sharedById",
];
const SENDER_NAME_KEYS = [
  "senderName",
  "senderNickname",
  "nickname",
  "memberName",
  "profileName",
  "writerName",
  "writerNickname",
  "createdByName",
  "createdByNickname",
  "authorName",
  "authorNickname",
  "sharedByName",
  "sharedByNickname",
  "shareMemberName",
  "shareMemberNickname",
  "sharerName",
  "sharerNickname",
  "sharedByMemberName",
  "sharedByMemberNickname",
];
const SENDER_RECORD_KEYS = [
  "sender",
  "member",
  "writer",
  "createdBy",
  "author",
  "sharedBy",
  "sharer",
];
const PROFILE_IMAGE_KEYS = [
  "profileImageUrl",
  "memberProfileImageUrl",
  "senderProfileImageUrl",
  "profileImage",
  "profilePhotoUrl",
  "photoUrl",
  "pictureUrl",
];
const AVATAR_IMAGE_KEYS = [
  "avatarUrl",
  "avatarSrc",
];
const PROFILE_IMAGE_RECORD_KEYS = [
  "profile",
  "memberProfile",
  "senderProfile",
  "userProfile",
  "account",
  ...SENDER_RECORD_KEYS,
];
const MESSAGE_ID_KEYS = ["messageId", "id", "chatMessageId"];
const MESSAGE_UNREAD_COUNT_KEYS = [
  "unreadCount",
  "unreadMessageCount",
  "unreadMembersCount",
  "unreadMemberCount",
  "unreadTeamMembersCount",
  "unreadTeamMemberCount",
  "unreadParticipantsCount",
  "unreadParticipantCount",
  "unreadUsersCount",
  "unreadUserCount",
  "notReadCount",
  "notReadMembersCount",
  "notReadMemberCount",
  "notReadTeamMembersCount",
  "notReadTeamMemberCount",
  "notReadParticipantsCount",
  "notReadParticipantCount",
  "notReadUsersCount",
  "notReadUserCount",
  "unReadCount",
  "unReadMembersCount",
  "unReadMemberCount",
  "remainingUnreadCount",
];
const MESSAGE_READ_COUNT_KEYS = [
  "readCount",
  "readMessageCount",
  "readMembersCount",
  "readMemberCount",
  "readTeamMembersCount",
  "readTeamMemberCount",
  "readParticipantsCount",
  "readParticipantCount",
  "readUsersCount",
  "readUserCount",
];

export type ChatTeamResponse = UnknownRecord;
export type ChatTeamMemberResponse = UnknownRecord;
export type ChatMessageResponse = UnknownRecord;
export type MessageUnreadUpdateResponse = UnknownRecord;
export type ContestCandidateResponse = UnknownRecord;
export type ContestVoteStatusResponse = {
  participatedVoterCount: number;
  requiredVoterCount: number;
  results?: Array<Record<string, unknown>>;
  result?: string;
  tie?: boolean;
  hasVotes?: boolean;
  myVoted?: boolean;
  [key: string]: unknown;
};
export type ReviewTargetResponse = UnknownRecord;
export type LeaderRecommendationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | (string & {});
export type ChatRealtimeStatus = "idle" | "connecting" | "connected" | "error";

type ChatCharacterType =
  | "LEAD_RUNNER"
  | "TRACK_RUNNER"
  | "BOOST_RUNNER"
  | "BOOSTER_RUNNER"
  | "FREE_RUNNER";

export type TeamMembersResponse = {
  chatbotEnabled: boolean;
  contestCandidateDeadlineAt: string | null;
  leaderCandidacyDeadlineAt: string | null;
  members: ChatTeamMemberResponse[];
  leaderVoteDeadlineAt: string | null;
  leaderSelectionDeadlineAt: string | null;
  myTeamMemberId: number | string | null;
  projectEndedAt: string | null;
  teamStatus: string | null;
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
  isMyVote: boolean;
};

export type ContestVoteStatus = {
  result: ContestVoteResultStatus;
  hasVotes: boolean;
  isTie: boolean;
  participantCount: number;
  participatedVoterCount: number;
  requiredVoterCount: number;
  myVoted: boolean;
  myContestCandidateIds: number[];
  myContestIds: number[];
  results: ContestVoteResultItem[];
};

export type LeaderRecommendationCandidate = {
  memberId: number;
  nickname: string;
  rank: number;
  score: number;
  reason: string;
};

export type LeaderRecommendation = {
  recommendationId: number;
  teamId: number;
  status: LeaderRecommendationStatus;
  recommendedMemberId: number | null;
  recommendedMemberNickname: string | null;
  recommendationReason: string | null;
  candidates: LeaderRecommendationCandidate[];
  teamSummary: string | null;
  caution: string | null;
  failureMessage: string | null;
  generatedAt: string | null;
  createdAt: string;
};

export const chatTeamsQueryKey = ["chat", "teams"] as const;
export const chatTeamMembersQueryKey = (teamId: string) =>
  ["chat", "teams", teamId, "members"] as const;
export const chatTeamMessagesQueryKey = (teamId: string) =>
  ["chat", "teams", teamId, "messages"] as const;
export const contestCandidatesQueryKey = (teamId: string) =>
  ["chat", "teams", teamId, "contest-candidates"] as const;
export const contestVotesQueryKey = (teamId: string) =>
  ["chat", "teams", teamId, "contest-candidates", "votes"] as const;
export const reviewTargetsQueryKey = (teamId: string) =>
  ["chat", "teams", teamId, "reviews", "targets"] as const;
export const leaderRecommendationQueryKey = (teamId: string) =>
  ["chat", "teams", teamId, "leader-recommendation"] as const;

const CHARACTER_AVATAR_META: Record<ChatCharacterType, Required<ChatRoomAvatarItem>> = {
  LEAD_RUNNER: {
    bgColor: "#FFF1EE",
    src: "/images/test/lead.png",
  },
  FREE_RUNNER: {
    bgColor: "#EBF7FE",
    src: "/images/test/free.png",
  },
  BOOST_RUNNER: {
    bgColor: "#FEFDEA",
    src: "/images/test/boost.png",
  },
  BOOSTER_RUNNER: {
    bgColor: "#FEFDEA",
    src: "/images/test/boost.png",
  },
  TRACK_RUNNER: {
    bgColor: "#EEFBF0",
    src: "/images/test/track.png",
  },
};

export function fetchChatTeams() {
  return apiFetch<
    | ChatTeamResponse[]
    | { rooms?: ChatTeamResponse[]; teams?: ChatTeamResponse[]; content?: ChatTeamResponse[] }
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
        chatbotEnabled?: boolean;
        contestCandidateDeadlineAt?: string | null;
        leaderCandidacyDeadlineAt?: string | null;
        leaderSelectionDeadlineAt?: string | null;
        leaderVoteDeadlineAt?: string | null;
        myTeamMemberId?: number | string | null;
        status?: string | null;
        teamStatus?: string | null;
        submissionStatus?: string | null;
      }
  >(`/api/teams/${encodeURIComponent(teamId)}/members`);

  if (Array.isArray(data)) {
    return {
      chatbotEnabled: true,
      contestCandidateDeadlineAt: null,
      leaderCandidacyDeadlineAt: null,
      members: data,
      leaderVoteDeadlineAt: null,
      leaderSelectionDeadlineAt: null,
      myTeamMemberId: findMyTeamMemberId(data),
      projectEndedAt: null,
      teamStatus: null,
    };
  }

  const members = data.members ?? data.teamMembers ?? [];

  return {
    chatbotEnabled: data.chatbotEnabled ?? true,
    contestCandidateDeadlineAt: data.contestCandidateDeadlineAt ?? null,
    leaderCandidacyDeadlineAt: data.leaderCandidacyDeadlineAt ?? null,
    members,
    leaderVoteDeadlineAt: data.leaderVoteDeadlineAt ?? null,
    leaderSelectionDeadlineAt: data.leaderSelectionDeadlineAt ?? null,
    myTeamMemberId: data.myTeamMemberId ?? findMyTeamMemberId(members),
    projectEndedAt:
      getString(data, ["projectEndedAt", "projectEndDate", "endedAt", "endDate"]) ?? null,
    teamStatus: getString(data, ["status", "teamStatus", "submissionStatus"]) ?? null,
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

export function useChatTeamsQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: chatTeamsQueryKey,
    queryFn: fetchChatTeams,
    enabled: options.enabled ?? true,
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
        .map((message) => mapChatMessage(message, members, teamId)),
    }),
  });
}

export function useMarkChatTeamAsReadMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markChatTeamAsRead(teamId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: chatTeamsQueryKey });
      queryClient.setQueryData(chatTeamsQueryKey, (current: unknown) =>
        updateChatTeamUnreadCount(current, teamId, 0),
      );
    },
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
  candidateTeamMemberId: number | string;
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

export type ShareContestToChatsResult = {
  failedTeamIds: string[];
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

export function useChatRealtime(teamId: string, options: { enabled?: boolean } = {}) {
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

          if (isMessageUnreadUpdateEvent(payload)) {
            queryClient.setQueryData<InfiniteData<TeamMessagesResponse>>(
              chatTeamMessagesQueryKey(teamId),
              (current) => updateChatMessageUnreadPages(current, payload),
            );
            void queryClient.invalidateQueries({ queryKey: chatTeamsQueryKey });
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
        setStatus((currentStatus) =>
          currentStatus === "connected" ? "connecting" : currentStatus,
        );
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

export function fetchLeaderRecommendation(teamId: string) {
  return apiFetch<LeaderRecommendation>(
    `/api/ai/teams/${encodeURIComponent(teamId)}/leader-recommendation`,
  );
}

export function createLeaderRecommendation(teamId: string) {
  return apiFetch<
    Pick<LeaderRecommendation, "recommendationId" | "teamId" | "status" | "createdAt">
  >(`/api/ai/teams/${encodeURIComponent(teamId)}/leader-recommendation`, {
    method: "POST",
  });
}

export function shareContestToChat(teamId: string, contestId: number | string) {
  return apiFetch<null>(`/api/teams/${encodeURIComponent(teamId)}/contest-shares`, {
    method: "POST",
    body: { contestId },
  });
}

export async function shareContestToChats(
  payload: ShareContestToChatsPayload,
): Promise<ShareContestToChatsResult> {
  const contestId = Number(payload.contestId);

  if (!Number.isFinite(contestId)) {
    throw new Error("공모전 정보를 확인할 수 없습니다.");
  }

  const results = await Promise.allSettled(
    payload.teamIds.map((teamId) => shareContestToChat(teamId, contestId)),
  );

  return {
    failedTeamIds: payload.teamIds.filter((_, index) => results[index]?.status === "rejected"),
  };
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
      // 중도 퇴장은 협업거리를 깎는다 - 마이페이지 요약(협업거리 게이지)도 함께
      // 갱신해야 마이페이지에서 감소분이 바로 보인다.
      void queryClient.invalidateQueries({ queryKey: MYPAGE_SUMMARY_QUERY_KEY_PREFIX });
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

export function useLeaderRecommendationQuery(teamId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: leaderRecommendationQueryKey(teamId),
    queryFn: () => fetchLeaderRecommendation(teamId),
    enabled: (options.enabled ?? true) && teamId.length > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      return status === "PENDING" || status === "PROCESSING" ? 5000 : false;
    },
    retry: false,
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
    mutationFn: (contestCandidateIds: number[]) =>
      voteContestCandidates(teamId, contestCandidateIds),
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
    onSuccess: (_data, contestId) => {
      rememberLocalContestShareSender([teamId], contestId);
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
    },
  });
}

export function useShareContestToChatsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shareContestToChats,
    onSuccess: (data, variables) => {
      const failedTeamIds = new Set(data.failedTeamIds);
      const successfulTeamIds = variables.teamIds.filter((teamId) => !failedTeamIds.has(teamId));
      const contestId = Number(variables.contestId);

      if (Number.isFinite(contestId)) {
        rememberLocalContestShareSender(successfulTeamIds, contestId);
      }

      successfulTeamIds.forEach((teamId) => {
        void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
      });

      if (successfulTeamIds.length > 0) {
        void queryClient.invalidateQueries({ queryKey: chatTeamsQueryKey });
      }
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
      void queryClient.invalidateQueries({ queryKey: chatTeamMembersQueryKey(teamId) });
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

export function useCreateLeaderRecommendationMutation(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createLeaderRecommendation(teamId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leaderRecommendationQueryKey(teamId) });
      void queryClient.invalidateQueries({ queryKey: chatTeamMessagesQueryKey(teamId) });
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
      page.messages.some(
        (currentMessage) => getValue(currentMessage, ["messageId", "id"]) === messageId,
      ),
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

function updateChatMessageUnreadPages(
  current: InfiniteData<TeamMessagesResponse> | undefined,
  event: MessageUnreadUpdateResponse,
): InfiniteData<TeamMessagesResponse> | undefined {
  if (!current) {
    return current;
  }

  const unreadCountsByMessageId = getMessageUnreadUpdates(event);

  if (unreadCountsByMessageId.size === 0) {
    return current;
  }

  let hasChanged = false;
  const pages = current.pages.map((page) => {
    let pageChanged = false;
    const messages = page.messages.map((message) => {
      const messageId = getMessageId(message);

      if (messageId === undefined || !unreadCountsByMessageId.has(messageId)) {
        return message;
      }

      const unreadCount = unreadCountsByMessageId.get(messageId) ?? 0;

      if (getMessageUnreadCount(message) === unreadCount) {
        return message;
      }

      pageChanged = true;
      hasChanged = true;

      return {
        ...message,
        unreadCount,
        unreadMessageCount: unreadCount,
      };
    });

    return pageChanged ? { ...page, messages } : page;
  });

  return hasChanged ? { ...current, pages } : current;
}

function isMessageUnreadUpdateEvent(value: UnknownRecord): value is MessageUnreadUpdateResponse {
  return getMessageUnreadUpdates(value).size > 0;
}

function getMessageUnreadUpdates(event: MessageUnreadUpdateResponse) {
  const updates = new Map<string, number>();

  collectMessageUnreadUpdate(event, updates);

  for (const arrayKey of [
    "updates",
    "messageUnreadUpdates",
    "unreadUpdates",
    "updatedMessages",
    "messages",
  ]) {
    const value = event[arrayKey];

    if (!Array.isArray(value)) {
      continue;
    }

    value.filter(isRecord).forEach((item) => collectMessageUnreadUpdate(item, updates));
  }

  for (const mapKey of ["unreadCounts", "messageUnreadCounts", "unreadCountByMessageId"]) {
    const value = event[mapKey];

    if (!isRecord(value)) {
      continue;
    }

    Object.entries(value).forEach(([messageId, unreadCountValue]) => {
      const unreadCount = toFiniteNumber(unreadCountValue);

      if (unreadCount !== undefined) {
        updates.set(messageId, unreadCount);
      }
    });
  }

  return updates;
}

function collectMessageUnreadUpdate(value: UnknownRecord, updates: Map<string, number>) {
  const unreadCount = getNumber(value, MESSAGE_UNREAD_COUNT_KEYS);

  if (unreadCount === undefined) {
    return;
  }

  const messageId = getMessageId(value);

  if (messageId !== undefined) {
    updates.set(messageId, unreadCount);
    return;
  }

  const messageIds = getStringArray(value, ["messageIds", "chatMessageIds"]);

  messageIds.forEach((id) => updates.set(id, unreadCount));
  getNumberArray(value, ["messageIds", "chatMessageIds"]).forEach((id) =>
    updates.set(String(id), unreadCount),
  );
}

function isChatMessageEvent(value: UnknownRecord): value is ChatMessageResponse {
  return (
    getValue(value, MESSAGE_ID_KEYS) !== undefined ||
    getString(value, ["content", "body", "message"]) !== undefined ||
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

  return getString(value, ["message", "error", "reason"]) ?? "메시지 처리 중 오류가 발생했습니다.";
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

  const avatarItems = getChatRoomAvatarItems(team);

  return {
    id,
    title,
    memberCount,
    lastMessage,
    lastMessageAt: formatRelativeTime(
      getString(team, ["lastMessageAt", "lastMessageCreatedAt", "updatedAt"]),
    ),
    unreadCount: getNumber(team, ["unreadCount", "unreadMessageCount"]) ?? 0,
    avatarItems,
    avatarSrcs:
      avatarItems.length > 0
        ? avatarItems.map((item) => item.src).filter((src): src is string => Boolean(src))
        : getStringArray(team, ["avatarSrcs", "memberProfileImageUrls", "profileImageUrls"]),
    projectEndedAt:
      getString(team, ["projectEndedAt", "projectEndDate", "endedAt", "endDate"]) ?? null,
    teamStatus: getString(team, ["status", "teamStatus", "submissionStatus"]) ?? null,
  };
}

function getChatRoomAvatarItems(team: ChatTeamResponse): ChatRoomAvatarItem[] {
  const memberItems = getChatRoomMembers(team)
    .map(getChatRoomMemberAvatarItem)
    .filter((item): item is ChatRoomAvatarItem => item !== null);

  if (memberItems.length > 0) {
    return memberItems;
  }

  const characterTypes = getStringArray(team, [
    "characterTypes",
    "memberCharacterTypes",
    "collaborationCharacterTypes",
  ]);

  if (characterTypes.length > 0) {
    return characterTypes
      .map((characterType) => getCharacterAvatarMeta(characterType))
      .filter((item): item is Required<ChatRoomAvatarItem> => item !== null);
  }

  return getStringArray(team, ["avatarSrcs", "memberProfileImageUrls", "profileImageUrls"]).map(
    (src) => ({ src }),
  );
}

function getChatRoomMembers(team: ChatTeamResponse): UnknownRecord[] {
  const value = getValue(team, ["members", "teamMembers", "participants", "teamMemberResponses"]);

  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function getChatRoomMemberAvatarItem(member: UnknownRecord): ChatRoomAvatarItem | null {
  const profileImageSrc = getProfileImageSrcFromRecord(member);

  if (profileImageSrc) {
    return { src: profileImageSrc };
  }

  const characterMeta = getCharacterAvatarMeta(
    getString(member, ["characterType", "collaborationCharacterType"]),
  );

  if (characterMeta) {
    return characterMeta;
  }

  const src = getString(member, ["characterImageUrl"]);

  return src ? { src } : null;
}

function getCharacterAvatarMeta(
  characterType: string | undefined,
): Required<ChatRoomAvatarItem> | null {
  if (!characterType || !(characterType in CHARACTER_AVATAR_META)) {
    return null;
  }

  return CHARACTER_AVATAR_META[characterType as ChatCharacterType];
}

function updateChatTeamUnreadCount(current: unknown, teamId: string, unreadCount: number): unknown {
  if (Array.isArray(current)) {
    return current.map((team) => updateChatTeamUnreadCountItem(team, teamId, unreadCount));
  }

  if (!isRecord(current)) {
    return current;
  }

  return {
    ...current,
    rooms: Array.isArray(current.rooms)
      ? current.rooms.map((team) => updateChatTeamUnreadCountItem(team, teamId, unreadCount))
      : current.rooms,
    teams: Array.isArray(current.teams)
      ? current.teams.map((team) => updateChatTeamUnreadCountItem(team, teamId, unreadCount))
      : current.teams,
    content: Array.isArray(current.content)
      ? current.content.map((team) => updateChatTeamUnreadCountItem(team, teamId, unreadCount))
      : current.content,
  };
}

function updateChatTeamUnreadCountItem(
  item: unknown,
  teamId: string,
  unreadCount: number,
): unknown {
  if (!isRecord(item)) {
    return item;
  }

  const itemId = getValue(item, ["teamId", "id", "chatRoomId", "roomId"]);

  if (String(itemId) !== teamId) {
    return item;
  }

  return {
    ...item,
    unreadCount,
    unreadMessageCount: unreadCount,
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
  const me =
    getBoolean(member, ["me", "isMe"]) ??
    (myTeamMemberId !== null && id === String(myTeamMemberId));
  const role = getString(member, ["role", "teamRole"]);

  return {
    id,
    memberId:
      getValue(member, ["memberId"]) === undefined
        ? undefined
        : String(getValue(member, ["memberId"])),
    profileId: getNumber(member, ["profileId"]),
    name,
    isMe: me,
    isLeader: role === "LEADER" || getBoolean(member, ["leader", "isLeader"]) === true,
    avatarTone: avatarTones[index % avatarTones.length] ?? "green",
    avatarSrc:
      getProfileImageSrcFromRecord(member) ??
      getString(member, ["characterImageUrl"]) ??
      undefined,
    school: getString(member, ["school", "schoolName"]) ?? undefined,
    major: getString(member, ["major", "majorName"]) ?? undefined,
    grade: getString(member, ["grade"]) ?? undefined,
    introduction: getString(member, ["introduction", "bio", "description"]) ?? "",
  };
}

function mapChatMessage(
  message: ChatMessageResponse,
  members: ChatMember[],
  teamId?: string,
): ChatMessage {
  const sentAtValue = getString(message, ["createdAt", "sentAt", "timestamp"]);
  const metadata = getMessageMetadata(message);
  const messageType = getMessageType(message);
  const isContestShareCard = messageType === "CONTEST_SHARE_CARD";
  const resolvedSender = resolveChatMessageSender(message, members, metadata, isContestShareCard);
  const localShareSender =
    isContestShareCard && !resolvedSender
      ? resolveLocalContestShareSender(message, members, metadata, teamId)
      : undefined;
  const sender = resolvedSender ?? localShareSender;
  const senderId = sender?.id ?? getRawMessageSenderId(message, metadata, isContestShareCard);
  const senderType = getSenderType(message);
  const isChatbotMessage = senderType === "CHATBOT" && !isContestShareCard;
  const isSystemMessage =
    !isContestShareCard && (senderType === "SYSTEM" || isSystemMessageType(messageType));
  const messageSenderName = getChatMessageSenderName(message, metadata);
  const unreadCount = getMessageUnreadCount(message, metadata, members.length);
  const isMine =
    getBoolean(message, ["me", "isMe", "mine", "isMine"]) ??
    sender?.isMe ??
    isCurrentMemberSender(message, members, metadata, isContestShareCard);
  const contestShareSenderName = isContestShareCard
    ? getContestShareSenderNameFromContent(message)
    : undefined;
  const senderName =
    (isContestShareCard ? sender?.name : undefined) ??
    messageSenderName ??
    contestShareSenderName ??
    sender?.name ??
    (isChatbotMessage ? "\uCC57\uBD07" : isSystemMessage ? "\uC2DC\uC2A4\uD15C" : "\uD300\uC6D0");

  return {
    id: String(
      getValue(message, ["messageId", "id"]) ?? `${senderName}-${getMessageTime(message)}`,
    ),
    senderId: senderId === undefined ? undefined : String(senderId),
    senderName,
    body: getString(message, ["content", "body", "message"]) ?? "",
    sentAt: formatMessageTime(sentAtValue),
    sentAtValue,
    sentAtDateKey: formatMessageDateKey(sentAtValue),
    sentAtDateLabel: formatMessageDateLabel(sentAtValue),
    direction: isMine ? "outgoing" : "incoming",
    senderType,
    messageType,
    metadata,
    avatarTone: isChatbotMessage || isSystemMessage ? "robot" : (sender?.avatarTone ?? "green"),
    avatarSrc:
      isChatbotMessage || isSystemMessage
        ? "/icons/chat/chat_bot.svg"
        : (sender?.avatarSrc ?? getProfileImageSrcFromRecord(message) ?? undefined),
    unreadLabel: formatMessageUnreadLabel(unreadCount),
  };
}

function getMessageId(message: UnknownRecord) {
  const messageId = getValue(message, MESSAGE_ID_KEYS);

  return messageId === undefined ? undefined : String(messageId);
}

function getMessageUnreadCount(
  message: UnknownRecord,
  metadata: ChatMessageMetadata | undefined = getMessageMetadata(message),
  memberCount = 0,
) {
  const unreadCount =
    getNumber(message, MESSAGE_UNREAD_COUNT_KEYS) ??
    (metadata ? getNumber(metadata, MESSAGE_UNREAD_COUNT_KEYS) : undefined);

  if (unreadCount !== undefined) {
    return unreadCount;
  }

  const readCount =
    getNumber(message, MESSAGE_READ_COUNT_KEYS) ??
    (metadata ? getNumber(metadata, MESSAGE_READ_COUNT_KEYS) : undefined);

  if (readCount !== undefined && memberCount > 0) {
    return Math.max(0, memberCount - readCount);
  }

  return 0;
}

function formatMessageUnreadLabel(unreadCount: number) {
  return unreadCount > 0 ? String(unreadCount) : undefined;
}

function resolveChatMessageSender(
  message: ChatMessageResponse,
  members: ChatMember[],
  metadata: ChatMessageMetadata | undefined,
  includeMetadataSender: boolean,
) {
  const teamMemberId = getMessageSenderValue(
    message,
    metadata,
    DIRECT_TEAM_MEMBER_ID_KEYS,
    METADATA_TEAM_MEMBER_ID_KEYS,
    includeMetadataSender,
  );

  if (teamMemberId !== undefined) {
    const sender = members.find((member) => member.id === String(teamMemberId));

    if (sender) {
      return sender;
    }
  }

  const memberId = getMessageSenderValue(
    message,
    metadata,
    DIRECT_MEMBER_ID_KEYS,
    METADATA_MEMBER_ID_KEYS,
    includeMetadataSender,
  );

  if (memberId !== undefined) {
    const sender = members.find((member) => member.memberId === String(memberId));

    if (sender) {
      return sender;
    }
  }

  const senderId = getMessageSenderValue(
    message,
    metadata,
    DIRECT_SENDER_ID_KEYS,
    METADATA_SENDER_ID_KEYS,
    includeMetadataSender,
  );

  if (senderId !== undefined) {
    const normalizedSenderId = String(senderId);
    const sender =
      members.find((member) => member.id === normalizedSenderId) ??
      members.find((member) => member.memberId === normalizedSenderId);

    if (sender) {
      return sender;
    }
  }

  const senderName = getChatMessageSenderName(message, metadata);
  const senderByName = senderName ? findChatMemberByName(members, senderName) : undefined;

  if (senderByName) {
    return senderByName;
  }

  const contestShareSenderName = includeMetadataSender
    ? getContestShareSenderNameFromContent(message)
    : undefined;

  return contestShareSenderName ? findChatMemberByName(members, contestShareSenderName) : undefined;
}

function getChatMessageSenderName(
  message: ChatMessageResponse,
  metadata: ChatMessageMetadata | undefined,
) {
  return (
    getSenderNameFromRecord(message) ?? (metadata ? getSenderNameFromRecord(metadata) : undefined)
  );
}

function getContestShareSenderNameFromContent(message: ChatMessageResponse) {
  const content = getString(message, ["content", "body", "message"]);

  if (!content) {
    return undefined;
  }

  const shareMatch = content.match(/^(.+?)님이\s+공모전을\s+공유했어요/);

  return shareMatch?.[1]?.trim() || undefined;
}

function findChatMemberByName(members: ChatMember[], name: string) {
  const normalizedName = normalizeChatMemberName(name);

  if (!normalizedName) {
    return undefined;
  }

  const exactMatch = members.find(
    (member) => normalizeChatMemberName(member.name) === normalizedName,
  );

  if (exactMatch) {
    return exactMatch;
  }

  const prefixMatches = members.filter((member) => {
    const memberName = normalizeChatMemberName(member.name);

    return memberName.startsWith(normalizedName) || normalizedName.startsWith(memberName);
  });

  return prefixMatches.length === 1 ? prefixMatches[0] : undefined;
}

function normalizeChatMemberName(name: string) {
  return name.trim().replace(/\s+/g, "").replace(/님$/, "");
}

function getSenderNameFromRecord(record: UnknownRecord) {
  const directName = getString(record, SENDER_NAME_KEYS);

  if (directName) {
    return directName;
  }

  for (const key of SENDER_RECORD_KEYS) {
    const nestedRecord = getRecord(record, key);
    const nestedName = nestedRecord ? getString(nestedRecord, SENDER_NAME_KEYS) : undefined;

    if (nestedName) {
      return nestedName;
    }
  }

  return undefined;
}

function getProfileImageSrcFromRecord(record: UnknownRecord) {
  const directSrc = getString(record, PROFILE_IMAGE_KEYS);

  if (directSrc) {
    return directSrc;
  }

  for (const key of PROFILE_IMAGE_RECORD_KEYS) {
    const nestedRecord = getRecord(record, key);
    const nestedSrc = nestedRecord ? getString(nestedRecord, PROFILE_IMAGE_KEYS) : undefined;

    if (nestedSrc) {
      return nestedSrc;
    }
  }

  const fallbackSrc = getString(record, AVATAR_IMAGE_KEYS);

  if (fallbackSrc) {
    return fallbackSrc;
  }

  for (const key of PROFILE_IMAGE_RECORD_KEYS) {
    const nestedRecord = getRecord(record, key);
    const nestedSrc = nestedRecord ? getString(nestedRecord, AVATAR_IMAGE_KEYS) : undefined;

    if (nestedSrc) {
      return nestedSrc;
    }
  }

  return undefined;
}

function getRawMessageSenderId(
  message: ChatMessageResponse,
  metadata: ChatMessageMetadata | undefined,
  includeMetadataSender: boolean,
) {
  return getMessageSenderValue(
    message,
    metadata,
    [...DIRECT_TEAM_MEMBER_ID_KEYS, ...DIRECT_SENDER_ID_KEYS, ...DIRECT_MEMBER_ID_KEYS],
    [...METADATA_TEAM_MEMBER_ID_KEYS, ...METADATA_SENDER_ID_KEYS, ...METADATA_MEMBER_ID_KEYS],
    includeMetadataSender,
  );
}

function getMessageSenderValue(
  message: ChatMessageResponse,
  metadata: ChatMessageMetadata | undefined,
  directKeys: string[],
  metadataKeys: string[],
  includeMetadataSender: boolean,
) {
  return (
    getValue(message, directKeys) ??
    (includeMetadataSender && metadata ? getValue(metadata, metadataKeys) : undefined)
  );
}

function isCurrentMemberSender(
  message: ChatMessageResponse,
  members: ChatMember[],
  metadata: ChatMessageMetadata | undefined,
  includeMetadataSender: boolean,
) {
  const currentMember = members.find((member) => member.isMe);

  if (!currentMember) {
    return false;
  }

  const teamMemberId = getMessageSenderValue(
    message,
    metadata,
    DIRECT_TEAM_MEMBER_ID_KEYS,
    METADATA_TEAM_MEMBER_ID_KEYS,
    includeMetadataSender,
  );

  if (teamMemberId !== undefined && currentMember.id === String(teamMemberId)) {
    return true;
  }

  const memberId = getMessageSenderValue(
    message,
    metadata,
    DIRECT_MEMBER_ID_KEYS,
    METADATA_MEMBER_ID_KEYS,
    includeMetadataSender,
  );

  if (
    memberId !== undefined &&
    (currentMember.memberId === String(memberId) || currentMember.id === String(memberId))
  ) {
    return true;
  }

  const senderId = getMessageSenderValue(
    message,
    metadata,
    DIRECT_SENDER_ID_KEYS,
    METADATA_SENDER_ID_KEYS,
    includeMetadataSender,
  );

  return (
    senderId !== undefined &&
    (currentMember.id === String(senderId) || currentMember.memberId === String(senderId))
  );
}

function rememberLocalContestShareSender(teamIds: string[], contestId: number) {
  const sharedAt = Date.now();

  teamIds.forEach((teamId) => {
    localContestShareSenderByTeamId.set(teamId, { contestId, sharedAt });
  });
}

function resolveLocalContestShareSender(
  message: ChatMessageResponse,
  members: ChatMember[],
  metadata: ChatMessageMetadata | undefined,
  teamId: string | undefined,
) {
  if (!teamId) {
    return undefined;
  }

  const localShare = localContestShareSenderByTeamId.get(teamId);

  if (!localShare) {
    return undefined;
  }

  if (Date.now() - localShare.sharedAt > LOCAL_CONTEST_SHARE_SENDER_TTL_MS) {
    localContestShareSenderByTeamId.delete(teamId);
    return undefined;
  }

  const contestId =
    getNumber(message, ["contestId"]) ??
    (metadata ? getNumber(metadata, ["contestId", "sharedContestId"]) : undefined);

  if (contestId !== localShare.contestId) {
    return undefined;
  }

  return members.find((member) => member.isMe);
}

function mapContestCandidate(candidate: ContestCandidateResponse): RecommendedContest {
  const contest = getRecord(candidate, "contest");
  const contestId =
    (contest ? getNumber(contest, ["contestId", "id"]) : undefined) ??
    getNumber(candidate, ["contestId"]);
  const contestCandidateId =
    getNumber(candidate, ["contestCandidateId", "candidateId", "id"]) ?? contestId ?? 0;
  const dday =
    getString(candidate, ["dDay", "dday", "deadlineLabel"]) ??
    (contest ? getString(contest, ["dDay", "dday", "deadlineLabel"]) : undefined) ??
    formatContestDday(
      (contest ? getNumber(contest, ["daysRemaining"]) : undefined) ??
        getNumber(candidate, ["daysRemaining"]),
    );
  const viewCount =
    (contest
      ? getNumber(contest, ["viewCount", "views", "hitCount", "hits", "readCount"])
      : undefined) ??
    getNumber(candidate, ["viewCount", "views", "hitCount", "hits", "readCount"]) ??
    0;
  const imageSrc =
    (contest
      ? getString(contest, ["thumbnailUrl", "posterImageUrl", "imageUrl", "posterUrl"])
      : undefined) ??
    getString(candidate, ["thumbnailUrl", "posterImageUrl", "imageUrl", "posterUrl"]);
  const category =
    (contest
      ? getString(contest, ["category", "contestCategory", "field", "fieldName", "contestField"])
      : undefined) ??
    getString(candidate, ["category", "contestCategory", "field", "fieldName", "contestField"]);

  return {
    id: String(contestCandidateId),
    contestId,
    contestCandidateId,
    candidateDeadlineAt:
      getString(candidate, ["candidateDeadlineAt", "candidateEndsAt", "candidateClosedAt"]) ??
      (contest ? getString(contest, ["candidateDeadlineAt", "candidateEndsAt"]) : undefined),
    category: category ? (contestCategoryLabels[category] ?? category) : "공모전",
    dday,
    imageSrc: getNextImageSafeSrc(imageSrc),
    organizer:
      (contest
        ? getString(contest, [
            "hostName",
            "organizer",
            "organizerName",
            "host",
            "organization",
            "organizationName",
          ])
        : undefined) ??
      getString(candidate, [
        "hostName",
        "organizer",
        "organizerName",
        "host",
        "organization",
        "organizationName",
      ]) ??
      "",
    isRecommended:
      getBoolean(candidate, ["recommended", "isRecommended", "aiRecommended", "isAiRecommended"]) ??
      getString(candidate, ["source", "type"])?.toUpperCase().includes("RECOMMEND") ??
      false,
    title:
      (contest ? getString(contest, ["title", "contestTitle", "name"]) : undefined) ??
      getString(candidate, ["title", "contestTitle", "name"]) ??
      (contestId ? `공모전 #${contestId}` : "공모전"),
    voteDeadlineAt:
      getString(candidate, ["voteDeadlineAt", "voteEndsAt", "voteClosedAt"]) ??
      (contest ? getString(contest, ["voteDeadlineAt", "voteEndsAt"]) : undefined),
    viewCount: viewCount.toLocaleString("ko-KR"),
  };
}

function mapContestVoteStatus(status: ContestVoteStatusResponse): ContestVoteStatus {
  const resultsValue = getValue(status, [
    "results",
    "voteResults",
    "contestCandidates",
    "candidates",
  ]);
  const results = Array.isArray(resultsValue)
    ? resultsValue.filter(isRecord).map(mapContestVoteResultItem)
    : [];
  const participatedVoterCount =
    getNumber(status, ["participatedVoterCount", "participantCount", "voterCount"]) ??
    results.reduce((sum, result) => sum + result.voteCount, 0);
  const requiredVoterCount =
    getNumber(status, ["requiredVoterCount", "totalVoteCount", "totalVotes"]) ??
    participatedVoterCount;
  const myVoted = getBoolean(status, ["myVoted", "hasVoted", "isVoted"]) ?? false;
  const explicitStatus = getString(status, ["result", "status", "voteStatus"])?.toUpperCase();
  const isTie = getBoolean(status, ["tie", "isTie"]) ?? explicitStatus === "TIE";
  const hasVotes =
    getBoolean(status, ["hasVotes"]) ??
    (explicitStatus === "NO_VOTES" || explicitStatus === "NO_VOTE"
      ? false
      : participatedVoterCount > 0 || results.some((result) => result.voteCount > 0));
  const { contestCandidateIds: myContestCandidateIds, contestIds: myContestIds } =
    getMyContestVoteIds(status, results);

  return {
    result: !hasVotes ? "noVotes" : isTie ? "tie" : "normal",
    hasVotes,
    isTie,
    participantCount: participatedVoterCount,
    participatedVoterCount,
    requiredVoterCount,
    myVoted,
    myContestCandidateIds,
    myContestIds,
    results,
  };
}

function formatContestDday(daysRemaining: number | undefined) {
  if (daysRemaining === undefined) {
    return "";
  }

  return daysRemaining <= 0 ? "D-Day" : `D-${daysRemaining}`;
}

function mapContestVoteResultItem(result: UnknownRecord): ContestVoteResultItem {
  const candidate = getRecord(result, "candidate") ?? getRecord(result, "contestCandidate");
  const contest =
    (candidate ? getRecord(candidate, "contest") : undefined) ?? getRecord(result, "contest");

  return {
    contestCandidateId:
      getNumber(result, ["contestCandidateId", "candidateId", "id"]) ??
      (candidate ? getNumber(candidate, ["contestCandidateId", "candidateId", "id"]) : undefined),
    contestId:
      (contest ? getNumber(contest, ["contestId", "id"]) : undefined) ??
      getNumber(result, ["contestId"]),
    voteCount: getNumber(result, ["voteCount", "votes", "count"]) ?? 0,
    percent: getNumber(result, ["percent", "votePercent", "rate"]) ?? 0,
    isWinner: getBoolean(result, ["winner", "isWinner"]) ?? false,
    isMyVote: getBoolean(result, ["myVoted", "isMyVote", "selected", "isSelected"]) ?? false,
  };
}

function getMyContestVoteIds(status: ContestVoteStatusResponse, results: ContestVoteResultItem[]) {
  const contestCandidateIds = new Set<number>();
  const contestIds = new Set<number>();

  getNumberArray(status, [
    "myContestCandidateIds",
    "myVotedContestCandidateIds",
    "votedContestCandidateIds",
    "selectedContestCandidateIds",
    "selectedCandidateIds",
    "myCandidateIds",
  ]).forEach((id) => contestCandidateIds.add(id));

  getNumberArray(status, [
    "myContestIds",
    "myVotedContestIds",
    "votedContestIds",
    "selectedContestIds",
  ]).forEach((id) => contestIds.add(id));

  const nestedMyVote = getRecordByKeys(status, [
    "myVote",
    "myContestVote",
    "currentMemberVote",
    "currentUserVote",
    "vote",
  ]);

  if (nestedMyVote) {
    getMyContestVoteIdsFromRecord(nestedMyVote, contestCandidateIds, contestIds);
  }

  const myVotesValue = getValue(status, [
    "myVotes",
    "myVoteResults",
    "myVotedContests",
    "myVotedCandidates",
    "votedCandidates",
    "selectedCandidates",
    "myContestCandidates",
    "selectedContestCandidates",
  ]);

  if (Array.isArray(myVotesValue)) {
    myVotesValue.filter(isRecord).forEach((vote) => {
      getMyContestVoteIdsFromRecord(vote, contestCandidateIds, contestIds);
    });
  }

  results.forEach((result) => {
    if (!result.isMyVote) {
      return;
    }

    if (result.contestCandidateId !== undefined) {
      contestCandidateIds.add(result.contestCandidateId);
    }

    if (result.contestId !== undefined) {
      contestIds.add(result.contestId);
    }
  });

  return {
    contestCandidateIds: Array.from(contestCandidateIds),
    contestIds: Array.from(contestIds),
  };
}

function getMyContestVoteIdsFromRecord(
  vote: UnknownRecord,
  contestCandidateIds: Set<number>,
  contestIds: Set<number>,
) {
  getNumberArray(vote, [
    "contestCandidateIds",
    "myContestCandidateIds",
    "selectedContestCandidateIds",
    "candidateIds",
  ]).forEach((id) => contestCandidateIds.add(id));
  getNumberArray(vote, ["contestIds", "myContestIds", "selectedContestIds"]).forEach((id) =>
    contestIds.add(id),
  );

  const candidate = getRecord(vote, "candidate") ?? getRecord(vote, "contestCandidate");
  const contest =
    (candidate ? getRecord(candidate, "contest") : undefined) ?? getRecord(vote, "contest");
  const contestCandidateId =
    getNumber(vote, ["contestCandidateId", "candidateId", "id"]) ??
    (candidate ? getNumber(candidate, ["contestCandidateId", "candidateId", "id"]) : undefined);
  const contestId =
    getNumber(vote, ["contestId"]) ??
    (contest ? getNumber(contest, ["contestId", "id"]) : undefined);

  if (contestCandidateId !== undefined) {
    contestCandidateIds.add(contestCandidateId);
  }

  if (contestId !== undefined) {
    contestIds.add(contestId);
  }
}

function mapReviewTarget(target: ReviewTargetResponse): ReviewMember {
  const id = String(
    getValue(target, ["teamMemberId", "revieweeTeamMemberId", "id", "memberId"]) ?? "",
  );
  const role = getString(target, ["role", "teamRole"]);

  return {
    id,
    name: getString(target, ["nickname", "name", "memberName", "profileName"]) ?? "팀원",
    alreadyReviewed: getBoolean(target, ["alreadyReviewed", "reviewed"]) ?? false,
    avatarTone: "green",
    avatarSrc:
      getProfileImageSrcFromRecord(target) ??
      getString(target, ["characterImageUrl", "senderAvatar"]) ??
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

  return Object.values(value).every(isChatMessageMetadataValue);
}

function isChatMessageMetadataValue(value: unknown): boolean {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    (Array.isArray(value) &&
      value.every((arrayItem) => typeof arrayItem === "string" || typeof arrayItem === "number")) ||
    isChatMessageMetadata(value)
  );
}

function getMessageTime(message: ChatMessageResponse) {
  const dateValue = getString(message, ["createdAt", "sentAt", "timestamp"]);
  const time = dateValue ? parseApiDate(dateValue).getTime() : 0;

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

function getRecord(record: UnknownRecord, key: string): UnknownRecord | undefined {
  const value = record[key];

  return isRecord(value) ? value : undefined;
}

function getRecordByKeys(record: UnknownRecord, keys: string[]) {
  const value = getValue(record, keys);

  return isRecord(value) ? value : undefined;
}

function getString(record: UnknownRecord, keys: string[]) {
  const value = getValue(record, keys);

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getNumber(record: UnknownRecord, keys: string[]) {
  const value = getValue(record, keys);

  return toFiniteNumber(value);
}

function toFiniteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
}

function getNumberArray(record: UnknownRecord, keys: string[]) {
  const value = getValue(record, keys);

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "number" ? item : Number(item)))
    .filter((item) => Number.isFinite(item));
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

  const date = parseApiDate(dateValue);

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

  const date = parseApiDate(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: CHAT_TIME_ZONE,
  }).format(date);
}

function formatMessageDateKey(dateValue: string | undefined) {
  const date = parseValidApiDate(dateValue);

  if (!date) {
    return undefined;
  }

  const parts = getKoreanDateParts(date);

  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function formatMessageDateLabel(dateValue: string | undefined) {
  const date = parseValidApiDate(dateValue);

  if (!date) {
    return undefined;
  }

  const parts = getKoreanDateParts(date);
  const todayParts = getKoreanDateParts(new Date());
  const isToday =
    parts.year === todayParts.year &&
    parts.month === todayParts.month &&
    parts.day === todayParts.day;

  if (isToday) {
    return `오늘 ${formatMessageTime(dateValue)}`;
  }

  return `${parts.year}년 ${parts.month}월 ${parts.day}일`;
}

function parseValidApiDate(dateValue: string | undefined) {
  if (!dateValue) {
    return undefined;
  }

  const date = parseApiDate(dateValue);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getKoreanDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: CHAT_TIME_ZONE,
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? "0"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "0"),
    day: Number(parts.find((part) => part.type === "day")?.value ?? "0"),
  };
}

function parseApiDate(dateValue: string) {
  const trimmedDateValue = dateValue.trim();
  const normalizedInputValue = trimmedDateValue.replace(" ", "T");
  const dateTimeValue = /^\d{4}-\d{2}-\d{2}$/.test(trimmedDateValue)
    ? `${trimmedDateValue}T00:00:00`
    : normalizedInputValue;
  const normalizedDateValue = HAS_TIMEZONE_REGEX.test(trimmedDateValue)
    ? normalizedInputValue
    : `${dateTimeValue}${KOREA_TIME_ZONE_OFFSET}`;

  return new Date(normalizedDateValue);
}
