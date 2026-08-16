"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/http";
import type { ContestSummary } from "@/app/contests/_types";
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
import { useContestsQuery } from "@/queries/useContestsQuery";

import { type ChatMember, type ChatMessage, type ChatMessageMetadata } from "../_data/chatTypes";
import { ChatInputBar } from "./ChatInputBar";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatProfilePreview } from "./ChatProfilePreview";
import { ChatTopBar } from "./ChatTopBar";
import { MemberReviewStartDialog } from "./member-review";
import {
  BotMessage,
  ChatbotSystemNotice,
  ChatbotTextMessage,
} from "./leader-election/ChatbotMessage";
import {
  ContestCandidateAddListPage,
  ContestCandidateListPage,
  ContestAddedToast,
  ContestRecommendationMessage,
  ContestSharedMessage,
  ContestVoteDetailSheet,
  ContestVoteCompleteSheet,
  ContestVoteNoticeBanner,
  ContestVoteResultSheet,
  ContestVoteResultMessage,
  ContestVoteSheet,
  ProgressCheckBanner,
  ProjectSubmissionReminderBanner,
} from "./leader-election/ContestRecommendation";
import {
  LeaderCandidatePreviewCard,
  LeaderElectedMessage,
  LeaderTieMessage,
} from "./leader-election/LeaderCards";
import {
  LeaderCandidateVoteSheet,
  LeaderVoteResultSheet,
  LeaderWillingnessSheet,
} from "./leader-election/LeaderSheets";
import type {
  LeaderCandidate,
  LeaderChoice,
  RecommendedContest,
  SheetState,
} from "./leader-election/types";

const DEFAULT_CONTEST_VOTE_SECONDS = 2 * 60 * 60;
const EMPTY_CHAT_MEMBERS: ChatMember[] = [];
const LEADER_RECOMMENDATION_ID_KEYS = [
  "aiRecommendedTeamMemberIds",
  "recommendedTeamMemberIds",
  "recommendedMemberIds",
  "candidateTeamMemberIds",
  "leaderCandidateTeamMemberIds",
  "teamMemberIds",
  "candidateIds",
];
const LEADER_RECOMMENDATION_NAME_KEYS = [
  "aiRecommendedNicknames",
  "recommendedMemberNicknames",
  "recommendedNicknames",
  "candidateNicknames",
  "nicknames",
];

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
  const [sheetState, setSheetState] = useState<SheetState>("closed");
  const contestAddListQuery = useContestsQuery(
    {
      page: 0,
      size: 30,
      sort: "deadlineDesc",
      status: "OPEN",
    },
    {
      enabled: sheetState === "contestAddList",
    },
  );
  const [leaderChoice, setLeaderChoice] = useState<LeaderChoice>("no");
  const [chatDraft, setChatDraft] = useState("");
  const [chatFocusToken, setChatFocusToken] = useState(0);
  const [leaderActionError, setLeaderActionError] = useState<string | null>(null);
  const [isLeaderCandidacySubmitted, setIsLeaderCandidacySubmitted] = useState(false);
  const [isLeaderVoteSubmitted, setIsLeaderVoteSubmitted] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [activeLeaderCandidateIds, setActiveLeaderCandidateIds] = useState<string[] | null>(null);
  const [isContestResultShown, setIsContestResultShown] = useState(false);
  const [isContestVoteSubmitted, setIsContestVoteSubmitted] = useState(false);
  const [isMidtermSubmitted, setIsMidtermSubmitted] = useState(false);
  const [isMidtermToastShown, setIsMidtermToastShown] = useState(false);
  const [isMemberReviewStartOpen, setIsMemberReviewStartOpen] = useState(false);
  const [isContestToastShown, setIsContestToastShown] = useState(false);
  const [contestActionError, setContestActionError] = useState<string | null>(null);
  const [deadlineSubmissionStatus, setDeadlineSubmissionStatus] = useState<
    "completed" | "incomplete" | null
  >(null);
  const [profileMember, setProfileMember] = useState<ChatMember | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [activeContestCandidateIds, setActiveContestCandidateIds] = useState<string[] | null>(null);
  const [selectedContestIds, setSelectedContestIds] = useState<string[]>([]);
  const messageListRef = useRef<HTMLElement>(null);
  const lastReadMarkerRef = useRef<string | null>(null);

  const apiCandidates = useMemo(() => {
    if (!activeLeaderCandidateIds?.length) {
      return [];
    }

    return activeLeaderCandidateIds
      .map((candidateId) => chatMembers.find((member) => member.id === candidateId))
      .filter((member): member is NonNullable<typeof member> => Boolean(member));
  }, [activeLeaderCandidateIds, chatMembers]);
  const safeCandidates = apiCandidates;
  const selectedCandidate =
    safeCandidates.find((candidate) => candidate.id === selectedCandidateId) ?? safeCandidates[0];
  const currentMember = chatMembers.find((member) => member.isMe);
  const isCurrentMemberLeader = currentMember
    ? currentMember.isLeader === true || selectedCandidate?.id === currentMember.id
    : false;

  const latestReadMarker = useMemo(() => {
    const latestMessage = serverMessages.at(-1);

    return latestMessage
      ? `${roomId}:${latestMessage.id}:${latestMessage.sentAt}`
      : `${roomId}:empty`;
  }, [roomId, serverMessages]);

  useEffect(() => {
    if (!messagesQuery.isSuccess || lastReadMarkerRef.current === latestReadMarker) {
      return;
    }

    lastReadMarkerRef.current = latestReadMarker;
    markAsRead();
  }, [latestReadMarker, markAsRead, messagesQuery.isSuccess, roomId]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

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

  const submitWillingness = async () => {
    setLeaderActionError(null);

    try {
      await updateLeaderCandidacyMutation.mutateAsync({ wants: leaderChoice === "yes" });
      setIsLeaderCandidacySubmitted(true);
      setSheetState("closed");
    } catch (error) {
      setLeaderActionError(getApiErrorMessage(error, "팀장 여부 투표에 실패했습니다."));
    }
  };

  const openCandidateVote = (candidateIds?: string[]) => {
    const nextCandidateIds = candidateIds?.filter((candidateId) => candidateId.length > 0) ?? null;

    setActiveLeaderCandidateIds(nextCandidateIds);
    setSelectedCandidateId((currentId) => currentId ?? nextCandidateIds?.[0] ?? null);
    setLeaderActionError(null);
    setSheetState("candidateVote");
  };

  const finishLeaderVote = async () => {
    setLeaderActionError(null);

    if (!selectedCandidate) {
      setLeaderActionError("팀장 후보 정보를 확인할 수 없습니다.");
      return;
    }

    const candidateTeamMemberId = Number(selectedCandidate.id);

    if (!Number.isFinite(candidateTeamMemberId)) {
      setLeaderActionError("팀장 후보 정보를 확인할 수 없습니다.");
      return;
    }

    try {
      await voteLeaderMutation.mutateAsync({ candidateTeamMemberId });
      setIsLeaderVoteSubmitted(true);
      setSheetState("leaderComplete");
    } catch (error) {
      setLeaderActionError(getApiErrorMessage(error, "팀장 투표에 실패했습니다."));
    }
  };

  const acceptRecommendedLeader = async () => {
    setLeaderActionError(null);

    try {
      await acceptLeaderRecommendationMutation.mutateAsync();
    } catch (error) {
      setLeaderActionError(getApiErrorMessage(error, "AI 추천 수락에 실패했습니다."));
    }
  };

  const requestRevote = async () => {
    setLeaderActionError(null);

    try {
      await requestLeaderRevoteMutation.mutateAsync();
      setIsLeaderVoteSubmitted(false);
    } catch (error) {
      setLeaderActionError(getApiErrorMessage(error, "재투표 요청에 실패했습니다."));
    }
  };

  const requestLeaderRecommendation = async () => {
    setLeaderActionError(null);

    try {
      await createLeaderRecommendationMutation.mutateAsync();
    } catch (error) {
      setLeaderActionError(getApiErrorMessage(error, "AI 팀장 추천 생성에 실패했습니다."));
    }
  };

  const insertChatbotMention = useCallback(() => {
    setChatDraft((currentDraft) => {
      if (currentDraft.trimStart().startsWith("@챗봇")) {
        return currentDraft;
      }

      return currentDraft.length > 0 ? `@챗봇 ${currentDraft}` : "@챗봇 ";
    });
    setChatFocusToken((token) => token + 1);
  }, []);

  const startContestVote = useCallback(
    (contestCandidateIds?: string[], options?: { keepSelection?: boolean }) => {
      setIsContestVoteSubmitted(false);
      setActiveContestCandidateIds(contestCandidateIds?.length ? contestCandidateIds : null);

      if (!options?.keepSelection) {
        setSelectedContestIds([]);
      }

      setContestActionError(null);
      setSheetState("contestVote");
    },
    [],
  );

  const openContestList = () => {
    setSheetState("contestList");
  };

  const openContestAddList = () => {
    if (isCandidateClosed) {
      setContestActionError("후보 공모전 추가 시간이 종료되었습니다.");
      return;
    }

    setContestActionError(null);
    setSheetState("contestAddList");
  };

  const addContestCandidateByContestId = async (contestId: number) => {
    setContestActionError(null);

    try {
      await addContestCandidateMutation.mutateAsync(contestId);
      setIsContestToastShown(true);
      setSheetState("closed");
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "후보 공모전 추가에 실패했습니다."));
    }
  };

  const removeContestCandidate = async (contest: RecommendedContest) => {
    setContestActionError(null);

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

  const addContestFromList = async (contest: ContestSummary) => {
    const contestId = Number(contest.id);

    if (!Number.isFinite(contestId)) {
      setContestActionError("공모전 정보를 확인할 수 없습니다.");
      return;
    }

    await addContestCandidateByContestId(contestId);
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

    const contestCandidateIds = selectedContestIds.map(Number).filter(Number.isFinite);

    if (contestCandidateIds.length === 0) {
      setContestActionError("투표할 공모전 후보 정보를 확인할 수 없습니다.");
      return;
    }

    setContestActionError(null);
    setIsContestVoteSubmitted(true);
    setSheetState("contestComplete");

    try {
      await voteContestCandidatesMutation.mutateAsync(contestCandidateIds);
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "공모전 투표에 실패했습니다."));
    }
  };

  const showContestVoteResult = () => {
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
    setContestActionError(null);

    try {
      await updateTeamProgressMutation.mutateAsync({ progressPercent });
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "중간점검 응답에 실패했습니다."));
      return;
    }

    setIsMidtermSubmitted(true);
    setDeadlineSubmissionStatus(null);
    setIsMidtermToastShown(true);
  };

  const completeContestSubmission = async () => {
    setContestActionError(null);

    try {
      await updateTeamSubmissionMutation.mutateAsync({ completed: true });
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "제출 확인에 실패했습니다."));
      return;
    }

    setDeadlineSubmissionStatus("completed");
    setIsMemberReviewStartOpen(true);
  };

  const markContestSubmissionIncomplete = async () => {
    setContestActionError(null);

    try {
      await updateTeamSubmissionMutation.mutateAsync({ completed: false });
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "제출 미완료 응답에 실패했습니다."));
      return;
    }

    setDeadlineSubmissionStatus("incomplete");
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

  const isContestOverlay =
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
  const latestProgressCheckMessage = useMemo(
    () =>
      [...serverMessages]
        .reverse()
        .find((message) => message.messageType === "PROGRESS_CHECK_CARD"),
    [serverMessages],
  );
  const latestSubmissionCheckMessage = useMemo(
    () =>
      [...serverMessages]
        .reverse()
        .find((message) => message.messageType === "SUBMISSION_CHECK_CARD"),
    [serverMessages],
  );
  const hasContestResultMessage = serverMessages.some(
    (message) => message.messageType === "CONTEST_RESULT_CARD",
  );
  const hasLeaderResultMessage = serverMessages.some(
    (message) => message.messageType === "LEADER_RESULT_CARD",
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
  const contestVoteResult = contestVoteStatus?.result ?? "normal";
  const candidateCountdownSeconds =
    getRemainingSecondsFromMetadata(
      latestContestVoteReminderMessage?.metadata,
      ["candidateDeadlineAt", "candidateEndsAt", "candidateClosedAt"],
      ["candidateRemainingSeconds", "remainingSeconds"],
      now,
    ) ??
    getRemainingSecondsFromContests(apiContestCandidates, "candidateDeadlineAt", now) ??
    0;
  const voteCountdownSeconds =
    getRemainingSecondsFromMetadata(
      latestContestVoteReminderMessage?.metadata,
      ["voteDeadlineAt", "voteEndsAt", "voteClosedAt", "deadlineAt", "expiresAt"],
      ["voteRemainingSeconds", "remainingSeconds"],
      now,
    ) ??
    getRemainingSecondsFromContests(apiContestCandidates, "voteDeadlineAt", now) ??
    DEFAULT_CONTEST_VOTE_SECONDS;
  const isCandidateClosed = candidateCountdownSeconds <= 0;
  const isContestVoteClosed = voteCountdownSeconds <= 0;
  const activeContestCandidates = activeContestCandidateIds?.length
    ? apiContestCandidates.filter((contest) => activeContestCandidateIds.includes(contest.id))
    : apiContestCandidates;
  const candidateContests = activeContestCandidates;
  const addedContestIds = candidateContests.map((contest) =>
    String(contest.contestId ?? contest.id),
  );
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

  if (sheetState === "contestAddList") {
    return (
      <ContestCandidateAddListPage
        addedContestIds={addedContestIds}
        contests={contestAddListQuery.data?.contests ?? []}
        isAdding={addContestCandidateMutation.isPending}
        isLoading={contestAddListQuery.isLoading}
        onAdd={(contest) => {
          void addContestFromList(contest);
        }}
        onBack={() => setSheetState("contestList")}
      />
    );
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
        isAddDisabled={isCandidateClosed}
        remainingSeconds={candidateCountdownSeconds}
        onBack={() => setSheetState("closed")}
        onOpenAdd={openContestAddList}
        onRemove={(contest) => {
          void removeContestCandidate(contest);
        }}
      />
    );
  }

  if (sheetState === "contestComplete") {
    return (
      <ContestVoteCompleteSheet
        contests={candidateContests}
        onBack={() => setSheetState("contestList")}
        onRevote={() =>
          startContestVote(activeContestCandidateIds ?? undefined, { keepSelection: true })
        }
        remainingSeconds={voteCountdownSeconds}
        selectedContestIds={selectedContestIds}
      />
    );
  }

  if (sheetState === "leaderComplete" && selectedCandidate) {
    return <LeaderVoteResultSheet leader={selectedCandidate} onDone={() => setSheetState("closed")} />;
  }

  if (sheetState === "contestVote") {
    return (
      <ContestVoteSheet
        contests={candidateContests}
        disabled={voteContestCandidatesMutation.isPending || isContestVoteClosed}
        onBack={() => setSheetState("closed")}
        onOpenAdd={openContestAddList}
        onSubmit={submitContestVote}
        onToggle={toggleContestVote}
        remainingSeconds={voteCountdownSeconds}
        selectedContestIds={selectedContestIds}
      />
    );
  }

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-850">
      <ChatTopBar
        memberCount={chatMembers.filter((member) => !member.isChatbot).length}
        roomId={roomId}
        title={roomTitle || undefined}
      />

      {latestContestVoteReminderMessage && !hasContestResultMessage && !isContestResultShown ? (
        <ContestVoteNoticeBanner
          body={latestContestVoteReminderMessage.body}
          isActionDisabled={isContestVoteClosed}
          isVoteSubmitted={isContestVoteSubmitted}
          onAction={
            isContestVoteSubmitted
              ? showContestVoteResult
              : () => startContestVote(latestContestVoteReminderCandidateIds)
          }
        />
      ) : null}

      {latestProgressCheckMessage && isCurrentMemberLeader && !isMidtermSubmitted ? (
        <ProgressCheckBanner
          disabled={updateTeamProgressMutation.isPending}
          onSubmit={submitMidtermCheck}
        />
      ) : null}

      {latestSubmissionCheckMessage &&
      isCurrentMemberLeader &&
      deadlineSubmissionStatus === null ? (
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
            candidateRemainingSeconds={candidateCountdownSeconds}
            contestCandidates={apiContestCandidates}
            isLeaderRecommendationPending={createLeaderRecommendationMutation.isPending}
            isContestVoteClosed={isContestVoteClosed}
            isLeaderCandidacySubmitted={isLeaderCandidacySubmitted}
            isLeaderVoteFlowEnded={hasLeaderResultMessage}
            isLeaderVoteSubmitted={isLeaderVoteSubmitted}
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
            onUseChatbot={insertChatbotMention}
            voteRemainingSeconds={voteCountdownSeconds}
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
          focusToken={chatFocusToken}
          onChange={setChatDraft}
          onSendMessage={chatRealtime.sendMessage}
          value={chatDraft}
        />
      </div>

      {sheetState === "willingness" || sheetState === "candidateVote" ? (
        <div
          className="absolute inset-0 z-40 flex items-end bg-color-gray-850/60"
          onClick={closeActiveSheet}
        >
          <div className="w-full" onClick={(event) => event.stopPropagation()}>
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
                disabled={voteLeaderMutation.isPending || !selectedCandidate}
                selectedCandidateId={selectedCandidate?.id ?? ""}
                onSelect={setSelectedCandidateId}
                onSubmit={finishLeaderVote}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {isContestOverlay ? (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-color-gray-850/60"
          onClick={closeActiveSheet}
        >
          <div onClick={(event) => event.stopPropagation()}>
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
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-850">
      <ChatTopBar roomId={roomId} title="채팅방" />
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="text-[13px] leading-[1.5] text-color-gray-650">{message}</p>
      </div>
    </main>
  );
}

function ChatMessageRenderer({
  chatMembers,
  candidateRemainingSeconds,
  contestCandidates,
  isLeaderCandidacySubmitted,
  isLeaderVoteFlowEnded,
  isLeaderRecommendationPending,
  isLeaderVoteSubmitted,
  isContestVoteClosed,
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
  onUseChatbot,
  voteRemainingSeconds,
}: {
  chatMembers: LeaderCandidate[];
  candidateRemainingSeconds: number;
  contestCandidates: RecommendedContest[];
  isLeaderCandidacySubmitted: boolean;
  isLeaderVoteFlowEnded: boolean;
  isLeaderRecommendationPending: boolean;
  isLeaderVoteSubmitted: boolean;
  isContestVoteClosed: boolean;
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
  onUseChatbot: () => void;
  voteRemainingSeconds: number;
}) {
  if (message.messageType === "LEADER_NOMINATION_CARD") {
    const metadataRecommendedLeaders = getMembersByMetadataIdsAndNames(
      chatMembers,
      getMetadataNumberArrayByKeys(message.metadata, LEADER_RECOMMENDATION_ID_KEYS),
      getMetadataStringArrayByKeys(message.metadata, LEADER_RECOMMENDATION_NAME_KEYS),
    );
    const apiRecommendedLeaders = getMembersByLeaderRecommendation(
      chatMembers,
      leaderRecommendation,
    );
    const recommendedLeaders = getUniqueMembers([
      ...metadataRecommendedLeaders,
      ...apiRecommendedLeaders,
    ]);
    const recommendationStatus = leaderRecommendation?.status;
    const shouldRequestRecommendation = !leaderRecommendation || recommendationStatus === "FAILED";
    const buttonLabel = shouldRequestRecommendation
      ? recommendationStatus === "FAILED"
        ? "AI 추천 다시 생성하기"
        : "AI 추천 생성하기"
      : "팀장 여부 투표하기";
    const isNominationActionCompleted =
      isLeaderVoteFlowEnded || isLeaderCandidacySubmitted || isLeaderActionCompleted(message);

    return (
      <BotMessage
        body={getLeaderRecommendationMessage(message.body, leaderRecommendation)}
        buttonDisabled={
          isLeaderRecommendationPending ||
          recommendationStatus === "PENDING" ||
          recommendationStatus === "PROCESSING" ||
          isNominationActionCompleted
        }
        buttonLabel={isLeaderRecommendationPending ? "AI 추천 생성 중" : buttonLabel}
        onButtonClick={
          shouldRequestRecommendation ? onRequestLeaderRecommendation : onOpenWillingness
        }
        sentAt={message.sentAt}
      >
        {recommendedLeaders.length > 0 ? (
          <LeaderCandidatePreviewCard leaders={recommendedLeaders} title="AI 팀장 추천" />
        ) : null}
      </BotMessage>
    );
  }

  if (message.messageType === "LEADER_VOTE_CARD") {
    const candidateIds = getLeaderVoteCandidateIds(
      message.metadata,
      chatMembers,
      leaderRecommendation,
    );
    const isVoteActionCompleted =
      isLeaderVoteFlowEnded || isLeaderVoteSubmitted || isLeaderActionCompleted(message);
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
          onOpenProfile={() => onOpenMemberProfile(aiRecommendedLeader)}
          onRevote={onRequestRevote}
          sentAt={message.sentAt}
        />
      );
    }

    return (
      <BotMessage
        body={message.body}
        buttonDisabled={candidateIds.length === 0 || isVoteActionCompleted}
        buttonLabel="팀장 투표하기"
        onButtonClick={() => onOpenCandidateVote(candidateIds)}
        sentAt={message.sentAt}
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
      <LeaderElectedMessage
        body={message.body}
        leader={leader}
        onOpenProfile={() => onOpenMemberProfile(leader)}
        sentAt={message.sentAt}
      />
    ) : (
      <CardChatMessage
        body={message.body}
        label="팀장 선출"
        metadata={message.metadata}
        sentAt={message.sentAt}
      />
    );
  }

  if (message.messageType?.startsWith("LEADER_")) {
    return (
      <CardChatMessage
        body={message.body}
        label="팀장 선출"
        metadata={message.metadata}
        sentAt={message.sentAt}
      />
    );
  }

  if (message.messageType === "CONTEST_RECOMMEND_CARD") {
    const contestIds = getMetadataNumberArray(message.metadata, "contestIds");
    const contests = getContestsByIds(contestCandidates, contestIds, "contestId");
    const displayContests =
      contests.length > 0 ? contests : contestIds.map(createPlaceholderContest);
    const isContestCandidateClosed = candidateRemainingSeconds <= 0;

    return (
      <ContestRecommendationMessage
        contests={displayContests}
        isActionDisabled={isContestCandidateClosed && isContestVoteClosed}
        isCandidateClosed={isContestCandidateClosed}
        onRemove={(contest) => {
          onRemoveContestCandidate(contest);
        }}
        onShowAll={onOpenContestList}
        onStartVote={
          isContestCandidateClosed
            ? () => onOpenContestVote(displayContests.map((contest) => contest.id))
            : onOpenContestList
        }
        remainingSeconds={candidateRemainingSeconds}
        sentAt={message.sentAt}
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
        sentAt={message.sentAt}
      />
    ) : (
      <CardChatMessage
        body={message.body}
        label="공모전"
        metadata={message.metadata}
        sentAt={message.sentAt}
      />
    );
  }

  if (message.messageType === "CONTEST_VOTE_REMINDER_CARD") {
    return null;
  }

  if (message.messageType === "PROGRESS_CHECK_CARD") {
    return null;
  }

  if (message.messageType === "SUBMISSION_CHECK_CARD") {
    return null;
  }

  if (message.messageType === "CONTEST_VOTE_CARD") {
    const candidateIds = getMetadataNumberArray(message.metadata, "contestCandidateIds").map(
      String,
    );
    const contests = getContestsByIds(contestCandidates, candidateIds, "contestCandidateId");

    return (
      <ContestRecommendationMessage
        contests={contests.length > 0 ? contests : contestCandidates}
        isActionDisabled={isContestVoteClosed}
        isCandidateClosed
        onRemove={(contest) => {
          onRemoveContestCandidate(contest);
        }}
        onShowAll={onOpenContestList}
        onStartVote={() => onOpenContestVote(candidateIds)}
        remainingSeconds={voteRemainingSeconds}
        sentAt={message.sentAt}
      />
    );
  }

  if (message.messageType === "CONTEST_RESULT_CARD") {
    const contestId = getMetadataNumber(message.metadata, "contestId");
    const contest =
      contestCandidates.find((candidate) => candidate.contestId === contestId) ??
      (contestId ? createPlaceholderContest(contestId) : undefined);

    return contest ? (
      <ContestVoteResultMessage
        contest={contest}
        onUseChatbot={onUseChatbot}
        sentAt={message.sentAt}
      />
    ) : (
      <CardChatMessage
        body={message.body}
        label="공모전"
        metadata={message.metadata}
        sentAt={message.sentAt}
      />
    );
  }

  if (message.messageType?.startsWith("CONTEST_")) {
    return (
      <CardChatMessage
        body={message.body}
        label="공모전"
        metadata={message.metadata}
        sentAt={message.sentAt}
      />
    );
  }

  if (message.senderType === "CHATBOT" || message.messageType === "BOT") {
    return <ChatbotTextMessage body={message.body} sentAt={message.sentAt} />;
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

  return <ChatbotTextMessage body={message.body} sentAt={message.sentAt} />;
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

function isLeaderActionCompleted(message: ChatMessage) {
  const metadataCompleted =
    getMetadataBoolean(message.metadata, "completed") ??
    getMetadataBoolean(message.metadata, "isCompleted") ??
    getMetadataBoolean(message.metadata, "submitted") ??
    getMetadataBoolean(message.metadata, "isSubmitted") ??
    getMetadataBoolean(message.metadata, "voted") ??
    getMetadataBoolean(message.metadata, "hasVoted") ??
    getMetadataBoolean(message.metadata, "alreadyVoted") ??
    getMetadataBoolean(message.metadata, "participated") ??
    getMetadataBoolean(message.metadata, "isParticipated");

  if (metadataCompleted !== undefined) {
    return metadataCompleted;
  }

  const metadataStatus = (
    getMetadataString(message.metadata, "leaderVoteStatus") ??
    getMetadataString(message.metadata, "voteStatus") ??
    getMetadataString(message.metadata, "status") ??
    getMetadataString(message.metadata, "state")
  )?.toUpperCase();

  return (
    metadataStatus === "COMPLETED" ||
    metadataStatus === "COMPLETE" ||
    metadataStatus === "CLOSED" ||
    metadataStatus === "ENDED" ||
    metadataStatus === "SUBMITTED" ||
    metadataStatus === "VOTED" ||
    metadataStatus === "PARTICIPATED"
  );
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

  return (
    metadataStatus === "TIE" || metadataStatus === "TIED" || metadataStatus === "LEADER_VOTE_TIE"
  );
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

function getMetadataNumberArrayByKeys(metadata: ChatMessageMetadata | undefined, keys: string[]) {
  return keys.flatMap((key) => getMetadataNumberArray(metadata, key));
}

function getMetadataStringArray(metadata: ChatMessageMetadata | undefined, key: string) {
  const value = metadata?.[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function getMetadataStringArrayByKeys(metadata: ChatMessageMetadata | undefined, keys: string[]) {
  return keys.flatMap((key) => getMetadataStringArray(metadata, key));
}

function getLeaderVoteCandidateIds(
  metadata: ChatMessageMetadata | undefined,
  members: LeaderCandidate[],
  leaderRecommendation?: LeaderRecommendation,
) {
  const metadataCandidates = getMembersByMetadataIdsAndNames(
    members,
    getMetadataNumberArrayByKeys(metadata, LEADER_RECOMMENDATION_ID_KEYS),
    getMetadataStringArrayByKeys(metadata, LEADER_RECOMMENDATION_NAME_KEYS),
  );
  const apiCandidates = getMembersByLeaderRecommendation(members, leaderRecommendation);
  const candidateIds = getUniqueMembers([...metadataCandidates, ...apiCandidates]).map(
    (member) => member.id,
  );

  return candidateIds;
}

function getMembersByLeaderRecommendation(
  members: LeaderCandidate[],
  leaderRecommendation?: LeaderRecommendation,
) {
  const candidateIds =
    leaderRecommendation?.candidates
      .map((candidate) => getLeaderRecommendationCandidateId(candidate))
      .filter((candidateId): candidateId is number => candidateId !== undefined) ?? [];

  if (candidateIds.length > 0) {
    const matchedMembers = getMembersByMetadataIds(members, candidateIds);

    if (matchedMembers.length > 0) {
      return matchedMembers;
    }
  }

  const candidateNicknames =
    leaderRecommendation?.candidates.map((candidate) => candidate.nickname) ?? [];

  if (candidateNicknames.length > 0) {
    return members.filter((member) => candidateNicknames.includes(member.name));
  }

  if (leaderRecommendation?.recommendedMemberId) {
    const matchedMembers = getMembersByMetadataIds(members, [
      leaderRecommendation.recommendedMemberId,
    ]);

    if (matchedMembers.length > 0) {
      return matchedMembers;
    }
  }

  return leaderRecommendation?.recommendedMemberNickname
    ? members.filter((member) => member.name === leaderRecommendation.recommendedMemberNickname)
    : [];
}

function getLeaderRecommendationCandidateId(candidate: LeaderRecommendation["candidates"][number]) {
  const candidateRecord = candidate as unknown as Record<string, unknown>;
  const value =
    candidateRecord.memberId ??
    candidateRecord.teamMemberId ??
    candidateRecord.candidateTeamMemberId ??
    candidateRecord.id;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
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

function getMembersByMetadataIdsAndNames(
  members: LeaderCandidate[],
  ids: Array<number | string>,
  names: string[],
) {
  const idSet = new Set(ids.map(String));
  const nameSet = new Set(names);

  return members.filter((member) => idSet.has(member.id) || nameSet.has(member.name));
}

function getUniqueMembers(members: LeaderCandidate[]) {
  const seenIds = new Set<string>();

  return members.filter((member) => {
    if (seenIds.has(member.id)) {
      return false;
    }

    seenIds.add(member.id);
    return true;
  });
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

function getRemainingSecondsFromMetadata(
  metadata: ChatMessageMetadata | undefined,
  deadlineKeys: string[],
  remainingKeys: string[],
  now: number,
) {
  for (const key of remainingKeys) {
    const remainingSeconds = getMetadataNumber(metadata, key);

    if (remainingSeconds !== undefined) {
      return Math.max(0, remainingSeconds);
    }
  }

  for (const key of deadlineKeys) {
    const deadlineAt = getMetadataString(metadata, key);
    const remainingSeconds = getRemainingSeconds(deadlineAt, now);

    if (remainingSeconds !== undefined) {
      return remainingSeconds;
    }
  }

  return undefined;
}

function getRemainingSecondsFromContests(
  contests: RecommendedContest[],
  deadlineKey: "candidateDeadlineAt" | "voteDeadlineAt",
  now: number,
) {
  const remainingSeconds = contests
    .map((contest) => getRemainingSeconds(contest[deadlineKey], now))
    .filter((value): value is number => value !== undefined);

  return remainingSeconds.length > 0 ? Math.min(...remainingSeconds) : undefined;
}

function getRemainingSeconds(deadlineAt: string | undefined, now: number) {
  if (!deadlineAt) {
    return undefined;
  }

  const deadlineTime = new Date(deadlineAt).getTime();

  if (!Number.isFinite(deadlineTime)) {
    return undefined;
  }

  return Math.max(0, Math.ceil((deadlineTime - now) / 1000));
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
  sentAt,
}: {
  body: string;
  label: string;
  metadata?: ChatMessageMetadata;
  sentAt?: string;
}) {
  return (
    <BotMessage
      body={body || `${label} 카드가 도착했습니다.`}
      buttonDisabled
      buttonLabel="준비 중"
      onButtonClick={() => undefined}
      sentAt={sentAt}
    >
      {metadata ? (
        <div className="w-[230px] rounded-[12px] bg-color-gray-150 px-3 py-2 text-[12px] leading-[1.5] text-color-gray-650">
          {label} 카드 데이터를 확인했습니다.
        </div>
      ) : null}
    </BotMessage>
  );
}
