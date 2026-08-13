"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/http";
import {
  useChatTeamMembersQuery,
  useChatTeamMessagesQuery,
  useChatRealtime,
  useAcceptLeaderAiRecommendationMutation,
  useAddContestCandidateMutation,
  useCreateLeaderRecommendationMutation,
  useContestCandidatesQuery,
  useContestVoteStatusQuery,
  useDeleteContestCandidateMutation,
  useLeaderRecommendationQuery,
  useMarkChatTeamAsReadMutation,
  useRequestLeaderRevoteMutation,
  useUpdateLeaderCandidacyMutation,
  useUpdateTeamProgressMutation,
  useUpdateTeamSubmissionMutation,
  useVoteContestCandidatesMutation,
  useVoteLeaderMutation,
  type LeaderRecommendation,
} from "@/queries/useChatQueries";

import {
  MOCK_CHAT_MEMBERS,
  type ChatMember,
  type ChatMessage,
  type ChatMessageMetadata,
} from "../_data/mockMessages";
import { ChatInputBar } from "./ChatInputBar";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatProfilePreview } from "./ChatProfilePreview";
import { ChatTopBar } from "./ChatTopBar";
import { MemberReviewStartDialog } from "./member-review";
import {
  BotMessage,
  ChatbotSystemNotice,
  ChatbotTextMessage,
  ContestDeadlineReminderMessage,
} from "./leader-election/ChatbotMessage";
import {
  ContestCandidateAddDialog,
  ContestCandidateListPage,
  ContestAddedToast,
  ContestRecommendationMessage,
  ContestSharedMessage,
  ContestVoteCompleteSheet,
  ContestVoteDetailSheet,
  ContestVoteNoticeBanner,
  ContestVoteResultSheet,
  ContestVoteResultMessage,
  ContestVoteSheet,
  ProjectSubmissionReminderBanner,
} from "./leader-election/ContestRecommendation";
import {
  LeaderCandidatePreviewCard,
  LeaderElectedMessage,
  LeaderNoticeMessage,
  LeaderTieMessage,
} from "./leader-election/LeaderCards";
import {
  LeaderCandidateVoteSheet,
  LeaderVoteResultSheet,
  LeaderWillingnessSheet,
  VoteCompleteSheet,
} from "./leader-election/LeaderSheets";
import {
  fallbackCandidate,
  mockContestVoteResult,
  mockAiRecommendedLeaderIds,
  mockIsTieResult,
  mockLeaderIntentAnswers,
  mockRecommendedContests,
} from "./leader-election/mock";
import type {
  LeaderCandidate,
  LeaderChoice,
  LeaderEvent,
  LeaderScenario,
  RecommendedContest,
  SheetState,
} from "./leader-election/types";
import {
  findMembersByIds,
  formatLeaderCandidateNames,
  formatRecommendedLeaderNames,
  getLeaderCandidates,
  getLeaderScenario,
} from "./leader-election/utils";

const recommendedLeaderNames = MOCK_CHAT_MEMBERS.filter((member) =>
  mockAiRecommendedLeaderIds.includes(member.id),
).map((member) => member.name);
const DEADLINE_RESPONSE_REMINDER_DELAY_MS = 2 * 60 * 60 * 1000;
const EMPTY_CHAT_MEMBERS: ChatMember[] = [];

function getInitialLeaderEvent(scenario: LeaderScenario): LeaderEvent {
  if (scenario === "singleDefinite") {
    return "autoLeaderNotice";
  }

  if (scenario === "multipleDefinite") {
    return "voteRequest";
  }

  return "candidateRegistrationRequest";
}

export function LeaderElectionFlow({ roomId }: { roomId: string }) {
  const router = useRouter();
  const membersQuery = useChatTeamMembersQuery(roomId);
  const chatMembers = membersQuery.data?.chatMembers ?? EMPTY_CHAT_MEMBERS;
  const projectEndedAt = membersQuery.data?.projectEndedAt;
  const messagesQuery = useChatTeamMessagesQuery(roomId, chatMembers, {
    enabled: membersQuery.isSuccess,
  });
  const serverMessages = useMemo(
    () => messagesQuery.data?.messages ?? [],
    [messagesQuery.data?.messages],
  );
  const hasServerMessages = messagesQuery.isSuccess;
  const chatRealtime = useChatRealtime(roomId, {
    enabled: messagesQuery.isSuccess,
  });
  const contestCandidatesQuery = useContestCandidatesQuery(roomId, {
    enabled: hasServerMessages,
  });
  const contestVoteStatusQuery = useContestVoteStatusQuery(roomId, {
    enabled: hasServerMessages,
  });
  const leaderRecommendationQuery = useLeaderRecommendationQuery(roomId, {
    enabled: hasServerMessages,
  });
  const { mutate: markAsRead } = useMarkChatTeamAsReadMutation(roomId);
  const updateLeaderCandidacyMutation = useUpdateLeaderCandidacyMutation(roomId);
  const voteLeaderMutation = useVoteLeaderMutation(roomId);
  const acceptLeaderRecommendationMutation = useAcceptLeaderAiRecommendationMutation(roomId);
  const createLeaderRecommendationMutation = useCreateLeaderRecommendationMutation(roomId);
  const requestLeaderRevoteMutation = useRequestLeaderRevoteMutation(roomId);
  const addContestCandidateMutation = useAddContestCandidateMutation(roomId);
  const deleteContestCandidateMutation = useDeleteContestCandidateMutation(roomId);
  const voteContestCandidatesMutation = useVoteContestCandidatesMutation(roomId);
  const updateTeamProgressMutation = useUpdateTeamProgressMutation(roomId);
  const updateTeamSubmissionMutation = useUpdateTeamSubmissionMutation(roomId);
  const leaderScenario = getLeaderScenario(mockLeaderIntentAnswers);
  const [sheetState, setSheetState] = useState<SheetState>("closed");
  const [leaderChoice, setLeaderChoice] = useState<LeaderChoice>("no");
  const [leaderActionError, setLeaderActionError] = useState<string | null>(null);
  const [leaderEvent, setLeaderEvent] = useState<LeaderEvent>(() =>
    getInitialLeaderEvent(leaderScenario),
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [activeLeaderCandidateIds, setActiveLeaderCandidateIds] = useState<string[] | null>(null);
  const [isLeaderResultReady, setIsLeaderResultReady] = useState(false);
  const [isContestResultShown, setIsContestResultShown] = useState(false);
  const [isContestResultReady, setIsContestResultReady] = useState(false);
  const [isContestRevoteRequested, setIsContestRevoteRequested] = useState(false);
  const [isContestVoteSubmitted, setIsContestVoteSubmitted] = useState(false);
  // TODO: API 연동 후 선택된 공모전 D-1 조건으로 대체한다.
  const [isMidtermSubmitted, setIsMidtermSubmitted] = useState(false);
  const [isMidtermToastShown, setIsMidtermToastShown] = useState(false);
  const [isMemberReviewStartOpen, setIsMemberReviewStartOpen] = useState(false);
  const [isContestToastShown, setIsContestToastShown] = useState(false);
  const [isSharedContestAdded, setIsSharedContestAdded] = useState(false);
  const [contestActionError, setContestActionError] = useState<string | null>(null);
  const [deadlineSubmissionStatus, setDeadlineSubmissionStatus] = useState<
    "completed" | "incomplete" | null
  >(null);
  const [isDeadlineReminderBannerShown, setIsDeadlineReminderBannerShown] = useState(false);
  const [profileMember, setProfileMember] = useState<ChatMember | null>(null);
  const [candidateRemainingSeconds, setCandidateRemainingSeconds] = useState(10);
  const [candidateContestIds, setCandidateContestIds] = useState<string[]>(
    mockRecommendedContests.slice(0, 3).map((contest) => contest.id),
  );
  const [activeContestCandidateIds, setActiveContestCandidateIds] = useState<string[] | null>(null);
  const [selectedContestIds, setSelectedContestIds] = useState<string[]>([]);
  const messageListRef = useRef<HTMLElement>(null);
  const lastReadMarkerRef = useRef<string | null>(null);

  const singleDefiniteLeader = findMembersByIds(
    mockLeaderIntentAnswers
      .filter((answer) => answer.intent === "definite")
      .map((answer) => answer.memberId),
  )[0];
  const automaticLeader = singleDefiniteLeader ?? fallbackCandidate;

  const candidates = useMemo(
    () => getLeaderCandidates(leaderScenario, leaderChoice),
    [leaderChoice, leaderScenario],
  );

  const apiCandidates = useMemo(() => {
    if (!activeLeaderCandidateIds?.length) {
      return [];
    }

    return activeLeaderCandidateIds
      .map((candidateId) => chatMembers.find((member) => member.id === candidateId))
      .filter((member): member is NonNullable<typeof member> => Boolean(member));
  }, [activeLeaderCandidateIds, chatMembers]);
  const safeCandidates = apiCandidates.length > 0 ? apiCandidates : candidates.length > 0 ? candidates : [fallbackCandidate];
  const selectedCandidate =
    safeCandidates.find((candidate) => candidate.id === selectedCandidateId) ?? safeCandidates[0];
  const recommendedLeader = safeCandidates[0] ?? fallbackCandidate;
  const recommendedLeaders = chatMembers.filter((member) =>
    mockAiRecommendedLeaderIds.includes(member.id),
  );
  const currentMember = chatMembers.find((member) => member.isMe);
  const isCurrentMemberLeader = currentMember ? selectedCandidate.id === currentMember.id : false;
  const recommendedLeaderLabel = formatRecommendedLeaderNames(
    recommendedLeaderNames.map((name) => `${name}님`),
  );
  const leaderCandidateLabel = formatLeaderCandidateNames(
    candidates.map((candidate) => `${candidate.name}님`),
  );

  const latestReadMarker = useMemo(() => {
    const latestMessage = serverMessages.at(-1);

    return latestMessage ? `${roomId}:${latestMessage.id}:${latestMessage.sentAt}` : `${roomId}:empty`;
  }, [roomId, serverMessages]);

  useEffect(() => {
    if (!messagesQuery.isSuccess || lastReadMarkerRef.current === latestReadMarker) {
      return;
    }

    lastReadMarkerRef.current = latestReadMarker;
    markAsRead();
  }, [latestReadMarker, markAsRead, messagesQuery.isSuccess, roomId]);

  useEffect(() => {
    const shouldRunCandidateTimer =
      leaderEvent === "autoLeaderNotice" ||
      leaderEvent === "elected" ||
      leaderEvent === "temporaryLeader";

    if (!shouldRunCandidateTimer) {
      return;
    }

    if (candidateRemainingSeconds <= 0) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setCandidateRemainingSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [candidateRemainingSeconds, leaderEvent]);

  useEffect(() => {
    if (sheetState !== "complete") {
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsLeaderResultReady(true);
    }, 3000);

    return () => window.clearTimeout(timerId);
  }, [sheetState]);

  useEffect(() => {
    if (sheetState !== "contestComplete") {
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsContestResultReady(true);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [sheetState]);

  useEffect(() => {
    if (!isContestToastShown) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsContestToastShown(false);
    }, 1800);

    return () => window.clearTimeout(timerId);
  }, [isContestToastShown]);

  useEffect(() => {
    if (!isMidtermToastShown) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsMidtermToastShown(false);
    }, 3000);

    return () => window.clearTimeout(timerId);
  }, [isMidtermToastShown]);

  useEffect(() => {
    if (!isMidtermSubmitted || deadlineSubmissionStatus !== null) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsDeadlineReminderBannerShown(true);
    }, DEADLINE_RESPONSE_REMINDER_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [deadlineSubmissionStatus, isMidtermSubmitted]);

  const submitWillingness = async () => {
    setLeaderActionError(null);

    if (hasServerMessages) {
      try {
        await updateLeaderCandidacyMutation.mutateAsync({ wants: leaderChoice === "yes" });
        setSheetState("closed");
      } catch (error) {
        setLeaderActionError(getApiErrorMessage(error, "팀장 여부 투표에 실패했습니다."));
      }

      return;
    }

    const registeredCandidates = getLeaderCandidates(leaderScenario, leaderChoice);

    if (registeredCandidates.length === 0) {
      setSelectedCandidateId(fallbackCandidate.id);
      setLeaderEvent("temporaryLeader");
      setSheetState("closed");
      return;
    }

    setSelectedCandidateId((registeredCandidates[0] ?? fallbackCandidate).id);
    setLeaderEvent("voteRequest");
    setSheetState("closed");
  };

  const openCandidateVote = (candidateIds?: string[]) => {
    const nextCandidateIds = candidateIds?.filter((candidateId) => candidateId.length > 0) ?? null;

    setActiveLeaderCandidateIds(nextCandidateIds);
    setSelectedCandidateId(
      (currentId) => currentId ?? nextCandidateIds?.[0] ?? safeCandidates[0]?.id ?? fallbackCandidate.id,
    );
    setLeaderActionError(null);
    setSheetState("candidateVote");
  };

  const finishLeaderVote = async () => {
    setLeaderActionError(null);

    if (hasServerMessages) {
      const candidateTeamMemberId = Number(selectedCandidate.id);

      if (!Number.isFinite(candidateTeamMemberId)) {
        setLeaderActionError("팀장 후보 정보를 확인할 수 없습니다.");
        return;
      }

      try {
        await voteLeaderMutation.mutateAsync({ candidateTeamMemberId });
        setSheetState("closed");
      } catch (error) {
        setLeaderActionError(getApiErrorMessage(error, "팀장 투표에 실패했습니다."));
      }

      return;
    }

    setIsLeaderResultReady(false);
    setSheetState("complete");
  };

  const showVoteResult = () => {
    if (mockIsTieResult) {
      setSheetState("closed");
      setLeaderEvent("tie");
      return;
    }

    setSheetState("leaderResult");
  };

  const finishLeaderResult = () => {
    setSheetState("closed");
    setLeaderEvent("elected");
  };

  const acceptRecommendedLeader = async () => {
    setLeaderActionError(null);

    if (hasServerMessages) {
      try {
        await acceptLeaderRecommendationMutation.mutateAsync();
      } catch (error) {
        setLeaderActionError(getApiErrorMessage(error, "AI 추천 수락에 실패했습니다."));
      }

      return;
    }

    setSelectedCandidateId(recommendedLeader.id);
    setLeaderEvent("elected");
  };

  const requestRevote = async () => {
    setLeaderActionError(null);

    if (hasServerMessages) {
      try {
        await requestLeaderRevoteMutation.mutateAsync();
      } catch (error) {
        setLeaderActionError(getApiErrorMessage(error, "재투표 요청에 실패했습니다."));
      }

      return;
    }

    setLeaderEvent("revote");
    setSelectedCandidateId(recommendedLeader.id);
    setSheetState("closed");
  };

  const requestLeaderRecommendation = async () => {
    setLeaderActionError(null);

    try {
      await createLeaderRecommendationMutation.mutateAsync();
    } catch (error) {
      setLeaderActionError(getApiErrorMessage(error, "AI 팀장 추천 생성에 실패했습니다."));
    }
  };

  const startContestVote = useCallback((contestCandidateIds?: string[]) => {
    setIsContestRevoteRequested(false);
    setIsContestVoteSubmitted(false);
    setActiveContestCandidateIds(contestCandidateIds?.length ? contestCandidateIds : null);
    setSelectedContestIds([]);
    setContestActionError(null);
    setSheetState("contestVote");
  }, []);

  const handleContestCardAction = () => {
    if (candidateRemainingSeconds > 0) {
      openContestList();
      return;
    }

    startContestVote();
  };

  const openContestList = () => {
    setSheetState("contestList");
  };

  const openContestAddConfirm = () => {
    setSheetState("contestAddConfirm");
  };

  const cancelContestAdd = () => {
    setSheetState("closed");
  };

  const addContestCandidateByContestId = async (contestId: number) => {
    setContestActionError(null);

    try {
      await addContestCandidateMutation.mutateAsync(contestId);
      setIsSharedContestAdded(true);
      setIsContestToastShown(true);
      setSheetState("closed");
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "후보 공모전 추가에 실패했습니다."));
    }
  };

  const removeContestCandidate = async (contest: RecommendedContest) => {
    setContestActionError(null);

    if (!hasServerMessages) {
      setCandidateContestIds((currentIds) =>
        currentIds.filter((contestId) => contestId !== contest.id),
      );
      return;
    }

    const contestCandidateId = contest.contestCandidateId ?? Number(contest.id);

    if (!Number.isFinite(contestCandidateId)) {
      return;
    }

    try {
      await deleteContestCandidateMutation.mutateAsync(contestCandidateId);
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "후보 공모전 삭제에 실패했습니다."));
    }
  };

  const confirmContestAdd = async () => {
    const sharedContest = mockRecommendedContests[2];

    if (hasServerMessages && sharedContest?.contestId) {
      await addContestCandidateByContestId(sharedContest.contestId);
      return;
    }

    if (sharedContest) {
      setCandidateContestIds((currentIds) =>
        currentIds.includes(sharedContest.id) ? currentIds : [...currentIds, sharedContest.id],
      );
    }

    setIsSharedContestAdded(true);
    setIsContestToastShown(true);
    setSheetState("closed");
  };

  const toggleContestVote = (contestId: string) => {
    setSelectedContestIds((currentIds) => {
      if (currentIds.includes(contestId)) {
        return currentIds.filter((id) => id !== contestId);
      }

      if (currentIds.length >= 2) {
        return currentIds;
      }

      return [...currentIds, contestId];
    });
  };

  const submitContestVote = async () => {
    if (selectedContestIds.length === 0) {
      return;
    }

    if (hasServerMessages) {
      const contestCandidateIds = selectedContestIds.map(Number).filter(Number.isFinite);

      if (contestCandidateIds.length === 0) {
        setContestActionError("투표할 공모전 후보 정보를 확인할 수 없습니다.");
        return;
      }

      setContestActionError(null);

      try {
        await voteContestCandidatesMutation.mutateAsync(contestCandidateIds);
        setIsContestVoteSubmitted(true);
        setSheetState("closed");
      } catch (error) {
        setContestActionError(getApiErrorMessage(error, "공모전 투표에 실패했습니다."));
      }

      return;
    }

    setIsContestResultReady(false);
    setIsContestVoteSubmitted(true);
    setSheetState("contestComplete");
  };

  const showContestVoteResult = () => {
    if (contestVoteResult === "tie") {
      setIsContestRevoteRequested(true);
      setSheetState("closed");
      return;
    }

    setSheetState("contestResult");
  };

  const showContestVoteDetail = () => {
    setIsContestResultShown(true);
    setSheetState("contestDetail");
  };

  const closeContestVoteResult = () => {
    setIsContestResultShown(true);
    setSheetState("closed");
  };

  const closeActiveSheet = () => {
    setSheetState("closed");
  };

  const submitMidtermCheck = async (progressPercent = 100) => {
    if (hasServerMessages) {
      setContestActionError(null);

      try {
        await updateTeamProgressMutation.mutateAsync({ progressPercent });
      } catch (error) {
        setContestActionError(getApiErrorMessage(error, "중간점검 응답에 실패했습니다."));
        return;
      }
    }

    setIsMidtermSubmitted(true);
    setDeadlineSubmissionStatus(null);
    setIsDeadlineReminderBannerShown(false);
    setIsMidtermToastShown(true);
  };

  const completeContestSubmission = async () => {
    if (hasServerMessages) {
      setContestActionError(null);

      try {
        await updateTeamSubmissionMutation.mutateAsync({ completed: true });
      } catch (error) {
        setContestActionError(getApiErrorMessage(error, "제출 확인에 실패했습니다."));
        return;
      }
    }

    setDeadlineSubmissionStatus("completed");
    setIsDeadlineReminderBannerShown(false);
    setIsMemberReviewStartOpen(true);
  };

  const markContestSubmissionIncomplete = async () => {
    if (hasServerMessages) {
      setContestActionError(null);

      try {
        await updateTeamSubmissionMutation.mutateAsync({ completed: false });
      } catch (error) {
        setContestActionError(getApiErrorMessage(error, "제출 미완료 응답에 실패했습니다."));
        return;
      }
    }

    setDeadlineSubmissionStatus("incomplete");
    setIsDeadlineReminderBannerShown(false);
  };

  const requestContestSubmissionReminder = async () => {
    await markContestSubmissionIncomplete();
    setDeadlineSubmissionStatus("incomplete");
    setIsDeadlineReminderBannerShown(true);
  };

  const startMemberReview = () => {
    setIsMemberReviewStartOpen(false);
    router.push(`/chat/${roomId}/member-review-preview`);
  };

  const loadPreviousMessages = async () => {
    if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage) {
      return;
    }

    const messageList = messageListRef.current;

    if (!messageList) {
      await messagesQuery.fetchNextPage();
      return;
    }

    const previousScrollHeight = messageList.scrollHeight;
    const previousScrollTop = messageList.scrollTop;

    await messagesQuery.fetchNextPage();

    const restoreScrollPosition = () => {
      const currentMessageList = messageListRef.current;

      if (!currentMessageList) {
        return false;
      }

      const scrollHeightIncrease = currentMessageList.scrollHeight - previousScrollHeight;

      if (scrollHeightIncrease <= 0) {
        return false;
      }

      currentMessageList.scrollTop = previousScrollTop + scrollHeightIncrease;
      return true;
    };

    if (!restoreScrollPosition()) {
      requestAnimationFrame(restoreScrollPosition);
    }
  };

  const handleMessageListScroll = () => {
    const messageList = messageListRef.current;

    if (!messageList || messageList.scrollTop > 48) {
      return;
    }

    void loadPreviousMessages();
  };

  const shouldShowContestVote =
    leaderEvent === "autoLeaderNotice" ||
    leaderEvent === "elected" ||
    leaderEvent === "temporaryLeader";
  const isCandidateClosed = candidateRemainingSeconds <= 0;
  const isContestOverlay =
    sheetState === "contestAddConfirm" ||
    sheetState === "contestVote" ||
    sheetState === "contestComplete" ||
    sheetState === "contestResult" ||
    sheetState === "contestDetail";
  const apiContestCandidates = contestCandidatesQuery.data ?? [];
  const latestContestVoteReminderMessage = useMemo(
    () =>
      [...serverMessages]
        .reverse()
        .find((message) => message.messageType === "CONTEST_VOTE_REMINDER_CARD"),
    [serverMessages],
  );
  const latestContestVoteReminderCandidateIds = useMemo(
    () =>
      latestContestVoteReminderMessage
        ? getMetadataNumberArray(
            latestContestVoteReminderMessage.metadata,
            "contestCandidateIds",
          ).map(String)
        : [],
    [latestContestVoteReminderMessage],
  );
  const contestVoteStatus = contestVoteStatusQuery.data;
  const contestVoteResult = hasServerMessages
    ? (contestVoteStatus?.result ?? "normal")
    : mockContestVoteResult;
  const activeContestCandidates = activeContestCandidateIds?.length
    ? apiContestCandidates.filter((contest) => activeContestCandidateIds.includes(contest.id))
    : apiContestCandidates;
  const candidateContests =
    hasServerMessages
      ? activeContestCandidates
      : mockRecommendedContests.filter((contest) => candidateContestIds.includes(contest.id));
  const selectedContests = candidateContests.filter((contest) =>
    selectedContestIds.includes(contest.id),
  );
  const sharedContest = mockRecommendedContests[2] ?? mockRecommendedContests[0];
  const winningContest = selectedContests[0] ?? mockRecommendedContests[0];
  const roomTitle = chatMembers
    .filter((member) => !member.isMe && !member.isChatbot)
    .map((member) => member.name)
    .join(", ");

  if (membersQuery.isLoading) {
    return <ChatRoomState roomId={roomId} message="대화상대를 불러오는 중입니다." />;
  }

  if (membersQuery.isError) {
    return (
      <ChatRoomState
        roomId={roomId}
        message={
          membersQuery.error instanceof ApiError
            ? membersQuery.error.message
            : "대화상대를 불러오지 못했습니다."
        }
      />
    );
  }

  if (membersQuery.isSuccess && chatMembers.length === 0) {
    return <ChatRoomState roomId={roomId} message="표시할 대화상대가 없습니다." />;
  }

  if (sheetState === "contestList") {
    return (
      <ContestCandidateListPage
        contests={candidateContests}
        deletingContestId={
          deleteContestCandidateMutation.variables === undefined
            ? undefined
            : String(deleteContestCandidateMutation.variables)
        }
        remainingSeconds={candidateRemainingSeconds}
        onBack={() => setSheetState("closed")}
        onRemove={(contest) => {
          void removeContestCandidate(contest);
        }}
      />
    );
  }

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white pt-[env(safe-area-inset-top)] text-color-gray-850">
      <ChatTopBar
        memberCount={chatMembers.filter((member) => !member.isChatbot).length}
        roomId={roomId}
        title={roomTitle || undefined}
      />

      {hasServerMessages && latestContestVoteReminderMessage ? (
        <ContestVoteNoticeBanner
          body={latestContestVoteReminderMessage.body}
          isVoteSubmitted={isContestVoteSubmitted}
          onAction={
            isContestVoteSubmitted
              ? showContestVoteResult
              : () => startContestVote(latestContestVoteReminderCandidateIds)
          }
        />
      ) : null}

      {!hasServerMessages && shouldShowContestVote && isCandidateClosed && !isContestResultShown ? (
        <ContestVoteNoticeBanner
          isVoteSubmitted={isContestVoteSubmitted}
          onAction={isContestVoteSubmitted ? showContestVoteResult : startContestVote}
        />
      ) : null}

      {!hasServerMessages &&
      shouldShowContestVote &&
      isContestResultShown &&
      isMidtermSubmitted &&
      isDeadlineReminderBannerShown ? (
        <ProjectSubmissionReminderBanner
          onComplete={completeContestSubmission}
          onIncomplete={markContestSubmissionIncomplete}
        />
      ) : null}

      <section
        aria-label="팀장 선출 채팅"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pt-[29px] pb-6"
        ref={messageListRef}
        onScroll={handleMessageListScroll}
      >
        {!hasServerMessages ? (
          <ChatbotTextMessage
            body={
              leaderScenario === "singleDefinite"
                ? `안녕하세요. 저는 팀 운영을 도와주는 AI 챗봇이에요. 팀 매칭이 완료되었어요. 이번 팀의 팀장은 ${automaticLeader.name}님입니다. 각자 간단한 자기소개와 인사를 나눠볼까요?`
                : "안녕하세요. 저는 팀 운영을 도와주는 AI 챗봇이에요. 팀 매칭이 완료되었어요. 각자 간단한 자기소개와 인사를 나눠볼까요?"
            }
          />
        ) : null}

        {messagesQuery.isLoading ? (
          <p className="text-center text-[13px] leading-[1.5] text-color-gray-650">
            이전 메시지를 불러오는 중입니다.
          </p>
        ) : null}

        {messagesQuery.isError ? (
          <p className="text-center text-[13px] leading-[1.5] text-color-gray-650">
            이전 메시지를 불러오지 못했습니다.
          </p>
        ) : null}

        {messagesQuery.hasNextPage ? (
          <button
            className="mx-auto flex h-8 items-center justify-center rounded-full bg-color-gray-150 px-4 text-[12px] leading-[1.35] font-semibold text-color-gray-650 disabled:opacity-50"
            disabled={messagesQuery.isFetchingNextPage}
            onClick={loadPreviousMessages}
            type="button"
          >
            {messagesQuery.isFetchingNextPage ? "이전 메시지를 불러오는 중" : "이전 메시지 더 보기"}
          </button>
        ) : null}

        {serverMessages.map((message) => (
          <ChatMessageRenderer
            chatMembers={chatMembers}
            contestCandidates={apiContestCandidates}
            isLeaderRecommendationPending={createLeaderRecommendationMutation.isPending}
            leaderRecommendation={leaderRecommendationQuery.data}
            key={message.id}
            message={message}
            onAddContestCandidate={addContestCandidateByContestId}
            onAcceptRecommendation={acceptRecommendedLeader}
            onRemoveContestCandidate={(contest) => {
              void removeContestCandidate(contest);
            }}
            onOpenContestList={() => {
              setContestActionError(null);
              setSheetState("contestList");
            }}
            onOpenContestVote={startContestVote}
            onOpenCandidateVote={openCandidateVote}
            onOpenMemberProfile={setProfileMember}
            onOpenWillingness={() => {
              setLeaderActionError(null);
              setSheetState("willingness");
            }}
            onRequestLeaderRecommendation={requestLeaderRecommendation}
            onRequestRevote={requestRevote}
          />
        ))}

        {leaderActionError ? (
          <p className="text-center text-[13px] leading-[1.5] text-color-coral-500">
            {leaderActionError}
          </p>
        ) : null}

        {contestActionError ? (
          <p className="text-center text-[13px] leading-[1.5] text-color-coral-500">
            {contestActionError}
          </p>
        ) : null}

        {!hasServerMessages && leaderEvent === "autoLeaderNotice" ? (
          <LeaderNoticeMessage
            body={`${automaticLeader.name}님이 팀장으로 자동 선출되었습니다. 팀장 선출 단계는 건너뛰고 공모전 투표를 진행할게요.`}
            leader={automaticLeader}
          />
        ) : null}

        {!hasServerMessages && leaderEvent === "candidateRegistrationRequest" ? (
          <BotMessage
            body={`이제, 팀장을 선출해볼게요.
매칭 전에 팀장을 지원해주신 분이 없으셔서 사용자 프로필 및 협업 유형 검사 결과 ${recommendedLeaderLabel}이 리더를 잘하실 수 있을 거라 추천드립니다.
다른 분들도 모두 리더를 하기 충분한 자질을 가지신 분들이니, 팀장 여부를 모두 투표해주세요.`}
            buttonDisabled={false}
            buttonLabel="팀장 여부 투표하기"
            onButtonClick={() => setSheetState("willingness")}
          >
            <LeaderCandidatePreviewCard leaders={recommendedLeaders} title="AI 팀장 추천" />
          </BotMessage>
        ) : null}

        {!hasServerMessages && (leaderEvent === "voteRequest" || leaderEvent === "revote") ? (
          <BotMessage
            body={
              leaderEvent === "revote"
                ? "팀원들의 의견에 따라 재투표를 진행합니다. 팀장을 다시 선출해 주세요."
                : leaderScenario === "multipleDefinite"
                  ? `이제, 팀장을 선출해볼게요.
매칭 전에 팀장에 지원해주신 ${leaderCandidateLabel}이 팀장 후보입니다. 팀장
지원자 분들은 되도록이면 프로필을
공개로 돌려, 팀원들이 볼 수 있도록
해주세요.`
                  : `바로 팀장 선출 투표를 하도록 하겠습니다. 팀장 지원자 분들은 되도록이면 프로필을 공개로 돌려, 팀원들이 볼 수 있도록
해주세요.`
            }
            buttonDisabled={false}
            buttonLabel="팀장 투표하기"
            onButtonClick={openCandidateVote}
          >
            {leaderScenario === "multipleDefinite" && leaderEvent === "voteRequest" ? (
              <LeaderCandidatePreviewCard leaders={safeCandidates} />
            ) : null}
          </BotMessage>
        ) : null}

        {!hasServerMessages && leaderEvent === "elected" ? (
          <LeaderElectedMessage leader={selectedCandidate} />
        ) : null}

        {!hasServerMessages && leaderEvent === "temporaryLeader" ? (
          <LeaderNoticeMessage
            body={`아직 팀장 후보 지원자가 없어요 :(
원활한 팀 운영을 위해 팀원 중 1명을 임시 팀장으로 무작위 지정했어요. ${fallbackCandidate.name}님이 임시 팀장으로 선정되었습니다. 이후 팀원들과 협의하여 언제든 팀장을
변경할 수 있습니다.
팀장을 변경하게 되면 저에게 꼭 알려주세요! 그래야 새로운 팀장에게도 베네핏을 빠짐없이 드릴 수 있어요. 🎁`}
            leader={fallbackCandidate}
          />
        ) : null}

        {!hasServerMessages && leaderEvent === "tie" ? (
          <LeaderTieMessage
            recommendedLeader={recommendedLeader}
            onAccept={acceptRecommendedLeader}
            onRevote={requestRevote}
          />
        ) : null}

        {!hasServerMessages && shouldShowContestVote ? (
          <>
            <ContestRecommendationMessage
              contests={candidateContests}
              isCandidateClosed={isCandidateClosed}
              onRemove={(contest) => {
                void removeContestCandidate(contest);
              }}
              onShowAll={openContestList}
              onStartVote={handleContestCardAction}
              remainingSeconds={candidateRemainingSeconds}
            />
            {!isCandidateClosed ? (
              <ContestSharedMessage
                contest={sharedContest}
                isAdded={isSharedContestAdded}
                onAdd={openContestAddConfirm}
              />
            ) : null}
          </>
        ) : null}

        {!hasServerMessages && shouldShowContestVote && isContestResultShown ? (
          <ContestVoteResultMessage
            contest={winningContest}
            onMidtermSubmit={submitMidtermCheck}
          />
        ) : null}

        {!hasServerMessages && shouldShowContestVote && isContestRevoteRequested ? (
          <BotMessage
            body="동률이 나와서, 동률이 나온 공모전들끼리 재투표를 진행할게요."
            buttonDisabled={false}
            buttonLabel="공모전 투표하기"
            onButtonClick={startContestVote}
          />
        ) : null}

        {!hasServerMessages && shouldShowContestVote && isContestResultShown && isMidtermSubmitted ? (
          <ContestDeadlineReminderMessage
            onComplete={completeContestSubmission}
            onIncomplete={requestContestSubmissionReminder}
          />
        ) : null}
      </section>

      <div className="relative flex flex-col gap-px bg-white pb-[env(safe-area-inset-bottom)]">
        {isMidtermToastShown ? (
          <div className="pointer-events-none absolute right-[24px] bottom-[calc(100%+18px)] left-[24px] z-50 flex h-8 items-center justify-center rounded-full bg-[rgba(17,17,17,0.6)] px-5 py-2">
            <p className="text-center text-[13px] leading-[1.25] font-medium text-white">
              진행률에 응답해주셔서 협업거리가 5m 증가했습니다.
            </p>
          </div>
        ) : null}
        {chatRealtime.errorMessage ? (
          <p className="px-4 pt-2 text-center text-[12px] leading-[1.35] text-color-coral-500">
            {chatRealtime.errorMessage}
          </p>
        ) : null}
        <ChatInputBar
          disabled={!messagesQuery.isSuccess || !chatRealtime.isConnected}
          onSendMessage={chatRealtime.sendMessage}
        />
      </div>

      {sheetState === "willingness" ||
      sheetState === "candidateVote" ||
      sheetState === "complete" ||
      sheetState === "leaderResult" ? (
        <div className="absolute inset-0 z-40 flex items-end bg-color-gray-850/60">
          {sheetState === "willingness" ? (
            <LeaderWillingnessSheet
              disabled={updateLeaderCandidacyMutation.isPending}
              selectedChoice={leaderChoice}
              onSelect={setLeaderChoice}
              onSubmit={submitWillingness}
            />
          ) : null}

          {sheetState === "candidateVote" ? (
            <LeaderCandidateVoteSheet
              candidates={safeCandidates}
              disabled={voteLeaderMutation.isPending}
              selectedCandidateId={selectedCandidate.id}
              onSelect={setSelectedCandidateId}
              onSubmit={finishLeaderVote}
            />
          ) : null}

          {sheetState === "complete" ? (
            <VoteCompleteSheet isResultReady={isLeaderResultReady} onShowResult={showVoteResult} />
          ) : null}

          {sheetState === "leaderResult" ? (
            <LeaderVoteResultSheet leader={selectedCandidate} onDone={finishLeaderResult} />
          ) : null}
        </div>
      ) : null}

      {isContestOverlay ? (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-color-gray-850/60"
          onClick={closeActiveSheet}
        >
          <div onClick={(event) => event.stopPropagation()}>
            {sheetState === "contestAddConfirm" ? (
              <ContestCandidateAddDialog
                contest={sharedContest}
                onCancel={cancelContestAdd}
                onConfirm={confirmContestAdd}
              />
            ) : null}

            {sheetState === "contestVote" ? (
              <ContestVoteSheet
                contests={candidateContests}
                disabled={voteContestCandidatesMutation.isPending}
                onSubmit={submitContestVote}
                onToggle={toggleContestVote}
                selectedContestIds={selectedContestIds}
              />
            ) : null}

            {sheetState === "contestComplete" ? (
              <ContestVoteCompleteSheet
                isResultReady={isContestResultReady}
                onShowResult={showContestVoteResult}
              />
            ) : null}

            {sheetState === "contestResult" ? (
              <ContestVoteResultSheet
                hasVotes={contestVoteResult !== "noVotes"}
                onShowDetail={showContestVoteDetail}
                participantCount={contestVoteStatus?.participantCount}
              />
            ) : null}

            {sheetState === "contestDetail" ? (
              <ContestVoteDetailSheet
                contests={candidateContests}
                onClose={closeContestVoteResult}
                participantCount={contestVoteStatus?.participantCount}
                voteResults={contestVoteStatus?.results}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {isContestToastShown ? <ContestAddedToast onShortcut={openContestList} /> : null}

      {currentMember ? (
        <MemberReviewStartDialog
          completionVariant={isCurrentMemberLeader ? "leader" : "member"}
          member={currentMember}
          onClose={() => setIsMemberReviewStartOpen(false)}
          onStart={startMemberReview}
          open={isMemberReviewStartOpen}
          reviewerName={currentMember.name}
          totalDistance={isCurrentMemberLeader ? 30 : 20}
        />
      ) : null}

      {profileMember ? (
        <ChatProfilePreview
          member={profileMember}
          onClose={() => setProfileMember(null)}
          projectEndedAt={projectEndedAt}
          roomId={roomId}
        />
      ) : null}

    </main>
  );
}

function ChatRoomState({ message, roomId }: { message: string; roomId: string }) {
  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white pt-[env(safe-area-inset-top)] text-color-gray-850">
      <ChatTopBar roomId={roomId} title="채팅방" />
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="text-[13px] leading-[1.5] text-color-gray-650">{message}</p>
      </div>
    </main>
  );
}

function ChatMessageRenderer({
  chatMembers,
  contestCandidates,
  isLeaderRecommendationPending,
  leaderRecommendation,
  message,
  onAddContestCandidate,
  onAcceptRecommendation,
  onRemoveContestCandidate,
  onOpenCandidateVote,
  onOpenContestList,
  onOpenContestVote,
  onOpenMemberProfile,
  onOpenWillingness,
  onRequestLeaderRecommendation,
  onRequestRevote,
}: {
  chatMembers: LeaderCandidate[];
  contestCandidates: RecommendedContest[];
  isLeaderRecommendationPending: boolean;
  leaderRecommendation?: LeaderRecommendation;
  message: ChatMessage;
  onAddContestCandidate: (contestId: number) => void;
  onAcceptRecommendation: () => void;
  onRemoveContestCandidate: (contest: RecommendedContest) => void;
  onOpenCandidateVote: (candidateIds?: string[]) => void;
  onOpenContestList: () => void;
  onOpenContestVote: (contestCandidateIds?: string[]) => void;
  onOpenMemberProfile: (member: ChatMember) => void;
  onOpenWillingness: () => void;
  onRequestLeaderRecommendation: () => void;
  onRequestRevote: () => void;
}) {
  if (message.messageType === "LEADER_NOMINATION_CARD") {
    const metadataRecommendedLeaders = getMembersByMetadataIds(
      chatMembers,
      getMetadataNumberArray(message.metadata, "aiRecommendedTeamMemberIds"),
    );
    const apiRecommendedLeaders = getMembersByLeaderRecommendation(chatMembers, leaderRecommendation);
    const recommendedLeaders =
      apiRecommendedLeaders.length > 0 ? apiRecommendedLeaders : metadataRecommendedLeaders;
    const recommendationStatus = leaderRecommendation?.status;
    const shouldRequestRecommendation =
      !leaderRecommendation || recommendationStatus === "FAILED";
    const buttonLabel = shouldRequestRecommendation
      ? recommendationStatus === "FAILED"
        ? "AI 추천 다시 생성하기"
        : "AI 추천 생성하기"
      : "팀장 여부 투표하기";

    return (
      <BotMessage
        body={getLeaderRecommendationMessage(message.body, leaderRecommendation)}
        buttonDisabled={
          isLeaderRecommendationPending ||
          recommendationStatus === "PENDING" ||
          recommendationStatus === "PROCESSING"
        }
        buttonLabel={isLeaderRecommendationPending ? "AI 추천 생성 중" : buttonLabel}
        onButtonClick={shouldRequestRecommendation ? onRequestLeaderRecommendation : onOpenWillingness}
      >
        {recommendedLeaders.length > 0 ? (
          <LeaderCandidatePreviewCard leaders={recommendedLeaders} title="AI 팀장 추천" />
        ) : null}
      </BotMessage>
    );
  }

  if (message.messageType === "LEADER_VOTE_CARD") {
    const candidateIds = getLeaderVoteCandidateIds(message.metadata, chatMembers, leaderRecommendation);
    const aiRecommendedTeamMemberId =
      getMetadataNumber(message.metadata, "aiRecommendedTeamMemberId") ??
      leaderRecommendation?.recommendedMemberId ??
      undefined;
    const aiRecommendedLeader = getLeaderRecommendedMember(
      chatMembers,
      aiRecommendedTeamMemberId,
      leaderRecommendation,
    );

    if (isLeaderTieMessage(message) && aiRecommendedLeader) {
      return (
        <LeaderTieMessage
          recommendedLeader={aiRecommendedLeader}
          recommendationReason={leaderRecommendation?.recommendationReason}
          onAccept={onAcceptRecommendation}
          onRevote={onRequestRevote}
        />
      );
    }

    return (
      <BotMessage
        body={message.body}
        buttonDisabled={candidateIds.length === 0}
        buttonLabel="팀장 투표하기"
        onButtonClick={() => onOpenCandidateVote(candidateIds)}
      >
        <LeaderCandidatePreviewCard
          leaders={getMembersByMetadataIds(chatMembers, candidateIds)}
          title="팀장 후보"
        />
      </BotMessage>
    );
  }

  if (message.messageType === "LEADER_RESULT_CARD") {
    const leaderTeamMemberId = getMetadataNumber(message.metadata, "leaderTeamMemberId");
    const leader = chatMembers.find((member) => member.id === String(leaderTeamMemberId));

    return leader ? (
      <LeaderElectedMessage body={message.body} leader={leader} />
    ) : (
      <CardChatMessage body={message.body} label="팀장 선출" metadata={message.metadata} />
    );
  }

  if (message.messageType?.startsWith("LEADER_")) {
    return <CardChatMessage body={message.body} label="팀장 선출" metadata={message.metadata} />;
  }

  if (message.messageType === "CONTEST_RECOMMEND_CARD") {
    const contestIds = getMetadataNumberArray(message.metadata, "contestIds");
    const contests = getContestsByIds(contestCandidates, contestIds, "contestId");

    return (
      <ContestRecommendationMessage
        contests={contests.length > 0 ? contests : contestIds.map(createPlaceholderContest)}
        isCandidateClosed={false}
        onRemove={(contest) => {
          onRemoveContestCandidate(contest);
        }}
        onShowAll={onOpenContestList}
        onStartVote={onOpenContestList}
        remainingSeconds={0}
      />
    );
  }

  if (message.messageType === "CONTEST_SHARE_CARD") {
    const contestId = getMetadataNumber(message.metadata, "contestId");
    const contest =
      contestCandidates.find((candidate) => candidate.contestId === contestId) ??
      (contestId ? createPlaceholderContest(contestId) : undefined);

    return contest && contestId ? (
      <ContestSharedMessage
        contest={contest}
        isAdded={Boolean(contestCandidates.find((candidate) => candidate.contestId === contestId))}
        onAdd={() => onAddContestCandidate(contestId)}
      />
    ) : (
      <CardChatMessage body={message.body} label="공모전" metadata={message.metadata} />
    );
  }

  if (message.messageType === "CONTEST_VOTE_REMINDER_CARD") {
    return null;
  }

  if (message.messageType === "CONTEST_VOTE_CARD") {
    const candidateIds = getMetadataNumberArray(message.metadata, "contestCandidateIds").map(String);
    const contests = getContestsByIds(contestCandidates, candidateIds, "contestCandidateId");

    return (
      <ContestRecommendationMessage
        contests={contests.length > 0 ? contests : contestCandidates}
        isCandidateClosed
        onRemove={(contest) => {
          onRemoveContestCandidate(contest);
        }}
        onShowAll={onOpenContestList}
        onStartVote={() => onOpenContestVote(candidateIds)}
        remainingSeconds={0}
      />
    );
  }

  if (message.messageType === "CONTEST_RESULT_CARD") {
    const contestId = getMetadataNumber(message.metadata, "contestId");
    const contest =
      contestCandidates.find((candidate) => candidate.contestId === contestId) ??
      (contestId ? createPlaceholderContest(contestId) : undefined);

    return contest ? (
      <ContestVoteResultMessage contest={contest} onMidtermSubmit={() => undefined} />
    ) : (
      <CardChatMessage body={message.body} label="공모전" metadata={message.metadata} />
    );
  }

  if (message.messageType?.startsWith("CONTEST_")) {
    return <CardChatMessage body={message.body} label="공모전" metadata={message.metadata} />;
  }

  if (message.senderType === "CHATBOT" || message.messageType === "BOT") {
    return <ChatbotTextMessage body={message.body} />;
  }

  if (message.senderType === "SYSTEM" || message.messageType === "SYSTEM") {
    const chatbotNoticeAction = getChatbotNoticeAction(message.body);

    if (chatbotNoticeAction) {
      return (
        <ChatbotSystemNotice
          action={chatbotNoticeAction}
          actorName={message.senderName}
          body={message.body.replace("제거했습니다", "삭제했습니다")}
        />
      );
    }

    return <SystemChatMessage body={message.body} />;
  }

  if (!message.messageType || message.messageType === "TALK" || message.messageType === "TEXT") {
    const sender = message.senderId
      ? chatMembers.find((member) => member.id === message.senderId)
      : undefined;

    return (
      <ChatMessageBubble
        message={message}
        onOpenProfile={
          sender && !sender.isMe && sender.profileId !== undefined
            ? () => onOpenMemberProfile(sender)
            : undefined
        }
      />
    );
  }

  return <ChatbotTextMessage body={message.body} />;
}

function getMetadataNumber(metadata: ChatMessageMetadata | undefined, key: string) {
  const value = metadata?.[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
}

function getMetadataBoolean(metadata: ChatMessageMetadata | undefined, key: string) {
  const value = metadata?.[key];

  return typeof value === "boolean" ? value : undefined;
}

function getMetadataString(metadata: ChatMessageMetadata | undefined, key: string) {
  const value = metadata?.[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isLeaderTieMessage(message: ChatMessage) {
  const messageType = message.messageType?.toUpperCase();

  if (messageType?.includes("TIE")) {
    return true;
  }

  const metadataTie =
    getMetadataBoolean(message.metadata, "isTie") ??
    getMetadataBoolean(message.metadata, "tie") ??
    getMetadataBoolean(message.metadata, "isLeaderVoteTie") ??
    getMetadataBoolean(message.metadata, "leaderVoteTie");

  if (metadataTie !== undefined) {
    return metadataTie;
  }

  const metadataStatus = (
    getMetadataString(message.metadata, "leaderVoteStatus") ??
    getMetadataString(message.metadata, "voteStatus") ??
    getMetadataString(message.metadata, "result") ??
    getMetadataString(message.metadata, "status")
  )?.toUpperCase();

  return metadataStatus === "TIE" || metadataStatus === "TIED" || metadataStatus === "LEADER_VOTE_TIE";
}

function getChatbotNoticeAction(body: string): "added" | "removed" | null {
  if (!body.includes("챗봇")) {
    return null;
  }

  if (body.includes("추가했습니다")) {
    return "added";
  }

  if (body.includes("삭제했습니다") || body.includes("제거했습니다")) {
    return "removed";
  }

  return null;
}

function getMetadataNumberArray(metadata: ChatMessageMetadata | undefined, key: string) {
  const value = metadata?.[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "number" ? item : Number(item)))
    .filter((item) => Number.isFinite(item));
}

function getLeaderVoteCandidateIds(
  metadata: ChatMessageMetadata | undefined,
  members: LeaderCandidate[],
  leaderRecommendation?: LeaderRecommendation,
) {
  const metadataCandidateIds = getMetadataNumberArray(metadata, "candidateTeamMemberIds").map(String);

  if (metadataCandidateIds.length > 0) {
    return metadataCandidateIds;
  }

  return getMembersByLeaderRecommendation(members, leaderRecommendation).map((member) => member.id);
}

function getMembersByLeaderRecommendation(
  members: LeaderCandidate[],
  leaderRecommendation?: LeaderRecommendation,
) {
  const candidateIds = leaderRecommendation?.candidates.map((candidate) => candidate.memberId) ?? [];

  if (candidateIds.length > 0) {
    const matchedMembers = getMembersByMetadataIds(members, candidateIds);

    if (matchedMembers.length > 0) {
      return matchedMembers;
    }
  }

  const candidateNicknames = leaderRecommendation?.candidates.map((candidate) => candidate.nickname) ?? [];

  if (candidateNicknames.length > 0) {
    return members.filter((member) => candidateNicknames.includes(member.name));
  }

  if (leaderRecommendation?.recommendedMemberId) {
    const matchedMembers = getMembersByMetadataIds(members, [leaderRecommendation.recommendedMemberId]);

    if (matchedMembers.length > 0) {
      return matchedMembers;
    }
  }

  return leaderRecommendation?.recommendedMemberNickname
    ? members.filter((member) => member.name === leaderRecommendation.recommendedMemberNickname)
    : [];
}

function getLeaderRecommendedMember(
  members: LeaderCandidate[],
  recommendedMemberId?: number,
  leaderRecommendation?: LeaderRecommendation,
) {
  const matchedMember = recommendedMemberId
    ? members.find((member) => member.id === String(recommendedMemberId))
    : undefined;

  if (matchedMember) {
    return matchedMember;
  }

  return leaderRecommendation?.recommendedMemberNickname
    ? members.find((member) => member.name === leaderRecommendation.recommendedMemberNickname)
    : undefined;
}

function getMembersByMetadataIds(members: LeaderCandidate[], ids: Array<number | string>) {
  const idSet = new Set(ids.map(String));

  return members.filter((member) => idSet.has(member.id));
}

function getLeaderRecommendationMessage(body: string, leaderRecommendation?: LeaderRecommendation) {
  if (!leaderRecommendation) {
    return body;
  }

  if (leaderRecommendation.status === "FAILED") {
    return leaderRecommendation.failureMessage ?? "AI 팀장 추천 결과를 생성하지 못했습니다.";
  }

  if (leaderRecommendation.status === "PENDING" || leaderRecommendation.status === "PROCESSING") {
    return "AI가 팀원의 성향과 외향성 분포를 바탕으로 팀장 추천을 생성하고 있습니다.";
  }

  return body;
}

function getContestsByIds(
  contests: RecommendedContest[],
  ids: Array<number | string>,
  idField: "contestId" | "contestCandidateId",
) {
  const idSet = new Set(ids.map(String));

  return contests.filter((contest) => idSet.has(String(contest[idField] ?? contest.id)));
}

function createPlaceholderContest(contestId: number): RecommendedContest {
  return {
    id: String(contestId),
    contestId,
    category: "공모전",
    dday: "",
    organizer: "",
    title: `공모전 #${contestId}`,
    viewCount: "",
  };
}

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof ApiError ? error.message : fallbackMessage;
}

function SystemChatMessage({ body }: { body: string }) {
  return (
    <div className="flex w-full justify-center">
      <p className="max-w-[280px] rounded-full bg-color-gray-150 px-3 py-1.5 text-center text-[12px] leading-[1.35] font-medium text-color-gray-650">
        {body}
      </p>
    </div>
  );
}

function CardChatMessage({
  body,
  label,
  metadata,
}: {
  body: string;
  label: string;
  metadata?: ChatMessageMetadata;
}) {
  return (
    <BotMessage
      body={body || `${label} 카드가 도착했습니다.`}
      buttonDisabled
      buttonLabel="준비 중"
      onButtonClick={() => undefined}
    >
      {metadata ? (
        <div className="w-[230px] rounded-[12px] bg-color-gray-150 px-3 py-2 text-[12px] leading-[1.5] text-color-gray-650">
          {label} 카드 데이터를 확인했습니다.
        </div>
      ) : null}
    </BotMessage>
  );
}
