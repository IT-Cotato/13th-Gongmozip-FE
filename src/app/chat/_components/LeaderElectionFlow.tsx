"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";

import { ApiError } from "@/lib/http";
import { getNextImageSafeSrc } from "@/lib/imageSources";
import type { ContestSummary } from "@/app/contests/_types";
import {
  useChatTeamMembersQuery,
  useChatTeamMessagesQuery,
  useChatRealtime,
  useChatTeamsQuery,
  useAcceptLeaderAiRecommendationMutation,
  useAddContestCandidateMutation,
  useCreateLeaderRecommendationMutation,
  useContestCandidatesQuery,
  useContestVoteStatusQuery,
  useDeleteContestCandidateMutation,
  useLeaderRecommendationQuery,
  useMarkChatTeamAsReadMutation,
  useRequestLeaderRevoteMutation,
  useReviewTargetsQuery,
  useUpdateLeaderCandidacyMutation,
  useUpdateTeamSubmissionMutation,
  useUpdateTeamProgressMutation,
  useVoteContestCandidatesMutation,
  useVoteLeaderMutation,
  type ContestVoteStatus,
  type LeaderRecommendation,
} from "@/queries/useChatQueries";
import { contestCategoryLabels, useContestsQuery } from "@/queries/useContestsQuery";
import {
  contestSharePreviewQueryKey,
  fetchContestSharePreview,
} from "@/queries/useContestSharePreviewQuery";

import { type ChatMember, type ChatMessage, type ChatMessageMetadata } from "../_data/chatTypes";
import { ChatInputBar } from "./ChatInputBar";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatProfilePreview } from "./ChatProfilePreview";
import { ChatTopBar } from "./ChatTopBar";
import { MemberReviewStartDialog } from "./member-review";
import {
  BotMessage,
  ChatbotUsageGuideMessage,
  ChatbotSystemNotice,
  ChatbotTextMessage,
} from "./leader-election/ChatbotMessage";
import {
  ContestCandidateAddDialog,
  ContestCandidateAddListPage,
  ContestCandidateUnavailableDialog,
  ContestAddedToast,
  ContestRecommendationMessage,
  ContestSharedMessage,
  ContestVoteDetailSheet,
  ContestVoteCompleteSheet,
  ContestVoteNoticeBanner,
  ContestVoteResultSheet,
  ContestVoteResultMessage,
  ContestVoteSheet,
  LeaderVoteNoticeBanner,
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
  LeaderWillingnessSheet,
  VoteCompleteSheet,
} from "./leader-election/LeaderSheets";
import type {
  LeaderCandidate,
  LeaderChoice,
  RecommendedContest,
  SheetState,
} from "./leader-election/types";

const DEFAULT_CONTEST_VOTE_SECONDS = 24 * 60 * 60;
const DEFAULT_LEADER_VOTE_SECONDS = 8 * 60 * 60;
const LOCAL_CONTEST_VOTE_SELECTION_PREFIX = "gongmozip:contest-vote-selection:";
const EMPTY_CHAT_MEMBERS: ChatMember[] = [];
const EMPTY_CONTEST_CANDIDATES: RecommendedContest[] = [];
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
  const teamsQuery = useChatTeamsQuery();
  const chatMembers = membersQuery.data?.chatMembers ?? EMPTY_CHAT_MEMBERS;
  const contestCandidateDeadlineAt = membersQuery.data?.contestCandidateDeadlineAt;
  const leaderCandidacyDeadlineAt = membersQuery.data?.leaderCandidacyDeadlineAt;
  const leaderSelectionDeadlineAt = membersQuery.data?.leaderSelectionDeadlineAt;
  const leaderVoteDeadlineAt = membersQuery.data?.leaderVoteDeadlineAt;
  const roomFromList = useMemo(
    () => teamsQuery.data?.find((room) => room.id === roomId),
    [roomId, teamsQuery.data],
  );
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
  const reviewTargetsQuery = useReviewTargetsQuery(roomId, {
    enabled: membersQuery.isSuccess,
  });
  const { refetch: refetchReviewTargets } = reviewTargetsQuery;
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
  const [pendingContestAdd, setPendingContestAdd] = useState<{
    contest: RecommendedContest;
    contestId: number;
    variant: "confirm" | "unavailable";
  } | null>(null);
  const [localContestCandidates, setLocalContestCandidates] = useState<RecommendedContest[]>([]);
  const [contestActionError, setContestActionError] = useState<string | null>(null);
  const [deadlineSubmissionStatus, setDeadlineSubmissionStatus] = useState<"completed" | null>(
    null,
  );
  const [submittedTeamRoomId, setSubmittedTeamRoomId] = useState<string | null>(null);
  const [dismissedMemberReviewStartRoomId, setDismissedMemberReviewStartRoomId] = useState<
    string | null
  >(null);
  const [profileMember, setProfileMember] = useState<ChatMember | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [activeContestCandidateIds, setActiveContestCandidateIds] = useState<string[] | null>(null);
  const [selectedContestIds, setSelectedContestIds] = useState<string[]>([]);
  const [cachedContestVoteCandidateIds, setCachedContestVoteCandidateIds] = useState<string[]>(() =>
    loadLocalContestVoteSelection(roomId),
  );
  const messageListRef = useRef<HTMLElement>(null);
  const lastReadMarkerRef = useRef<string | null>(null);
  const scrollToLatestFrameRef = useRef<number | null>(null);

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
  const latestLeaderResultMessage = useMemo(
    () =>
      [...serverMessages].reverse().find((message) => message.messageType === "LEADER_RESULT_CARD"),
    [serverMessages],
  );
  const electedLeaderId = latestLeaderResultMessage
    ? String(getMetadataNumber(latestLeaderResultMessage.metadata, "leaderTeamMemberId"))
    : null;
  const isCurrentMemberLeader = currentMember
    ? currentMember.isLeader === true || electedLeaderId === currentMember.id
    : false;
  const hasCompletedMemberReviews = hasCompletedAllMemberReviews(reviewTargetsQuery.data);
  const hasConfirmedCompletedMemberReviews =
    reviewTargetsQuery.isSuccess && hasCompletedMemberReviews;
  const teamStatus = membersQuery.data?.teamStatus ?? roomFromList?.teamStatus ?? null;
  const hasSubmittedTeamStatus = isSubmittedTeamStatus(teamStatus);
  const hasServerTeamSubmissionCompleted = useMemo(
    () => serverMessages.some(isTeamSubmissionCompletedMessage),
    [serverMessages],
  );
  const hasTeamSubmissionCompleted =
    submittedTeamRoomId === roomId || hasSubmittedTeamStatus || hasServerTeamSubmissionCompleted;
  const hasDismissedMemberReviewStart = dismissedMemberReviewStartRoomId === roomId;
  const isMemberReviewStartDialogOpen =
    !hasConfirmedCompletedMemberReviews &&
    (isMemberReviewStartOpen ||
      (hasTeamSubmissionCompleted && !hasDismissedMemberReviewStart));

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

  const scrollMessageListToLatest = useCallback(() => {
    const messageList = messageListRef.current;

    if (!messageList) {
      return;
    }

    messageList.scrollTop = messageList.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    if (!messagesQuery.isSuccess) {
      return;
    }

    scrollMessageListToLatest();

    if (scrollToLatestFrameRef.current !== null) {
      cancelAnimationFrame(scrollToLatestFrameRef.current);
    }

    scrollToLatestFrameRef.current = requestAnimationFrame(() => {
      scrollMessageListToLatest();
      scrollToLatestFrameRef.current = null;
    });

    return () => {
      if (scrollToLatestFrameRef.current === null) {
        return;
      }

      cancelAnimationFrame(scrollToLatestFrameRef.current);
      scrollToLatestFrameRef.current = null;
    };
  }, [latestReadMarker, messagesQuery.isSuccess, scrollMessageListToLatest]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!hasTeamSubmissionCompleted || hasConfirmedCompletedMemberReviews) {
      return;
    }

    void refetchReviewTargets();
  }, [hasConfirmedCompletedMemberReviews, hasTeamSubmissionCompleted, refetchReviewTargets]);

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

    const candidateTeamMemberId = selectedCandidate.id;

    if (candidateTeamMemberId.length === 0) {
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

  const showContestVoteStatus = useCallback((contestCandidateIds?: string[]) => {
    setActiveContestCandidateIds(contestCandidateIds?.length ? contestCandidateIds : null);
    setSelectedContestIds([]);
    setContestActionError(null);
    setSheetState("contestComplete");
  }, []);

  const openContestAddList = () => {
    router.push("/contests");
  };

  const openContestCandidateShortcut = () => {
    setContestActionError(null);

    if (isContestVoteInProgress) {
      startContestVote(candidateContests.map((contest) => contest.id));
      return;
    }

    setPendingContestAdd({
      contest: createPlaceholderContest(0),
      contestId: 0,
      variant: "unavailable",
    });
  };

  const openContestSharedCandidateAdd = (contestId: number, contest?: RecommendedContest) => {
    setContestActionError(null);
    setPendingContestAdd({
      contest: contest ?? createPlaceholderContest(contestId),
      contestId,
      variant: isContestVoteInProgress ? "confirm" : "unavailable",
    });
  };

  const closeContestAddDialog = () => {
    setPendingContestAdd(null);
  };

  const confirmContestCandidateAdd = async () => {
    if (!pendingContestAdd || pendingContestAdd.variant !== "confirm") {
      return;
    }

    const { contest, contestId } = pendingContestAdd;

    setPendingContestAdd(null);
    await addContestCandidateByContestId(contestId, contest);
  };

  const addContestCandidateByContestId = async (
    contestId: number,
    contest?: RecommendedContest,
  ) => {
    setContestActionError(null);

    try {
      await addContestCandidateMutation.mutateAsync(contestId);
      setLocalContestCandidates((currentContests) =>
        mergeContestCandidates(currentContests, [
          contest
            ? { ...contest, contestId, contestCandidateId: undefined, id: String(contestId) }
            : createPlaceholderContest(contestId),
        ]),
      );
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
      if (contest.contestCandidateId === undefined) {
        setLocalContestCandidates((currentContests) =>
          currentContests.filter(
            (currentContest) => getContestIdentity(currentContest) !== getContestIdentity(contest),
          ),
        );
        return;
      }

      await deleteContestCandidateMutation.mutateAsync(contestCandidateId);
      setLocalContestCandidates((currentContests) =>
        currentContests.filter(
          (currentContest) => getContestIdentity(currentContest) !== getContestIdentity(contest),
        ),
      );
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

    await addContestCandidateByContestId(contestId, mapContestSummaryToRecommendedContest(contest));
  };

  const toggleContestVote = (contestId: string) => {
    setSelectedContestIds((currentIds) => {
      const baseIds = currentIds.length > 0 ? currentIds : restoredSelectedContestIds;

      if (baseIds.includes(contestId)) {
        return baseIds.filter((id) => id !== contestId);
      }

      if (baseIds.length >= 2) {
        return baseIds;
      }

      return [...baseIds, contestId];
    });
  };

  const submitContestVote = async () => {
    const nextSelectedContestIds =
      selectedContestIds.length > 0 ? selectedContestIds : restoredSelectedContestIds;

    if (nextSelectedContestIds.length === 0) {
      return;
    }

    const contestCandidateIds = nextSelectedContestIds.map(Number).filter(Number.isFinite);

    if (contestCandidateIds.length === 0) {
      setContestActionError("투표할 공모전 후보 정보를 확인할 수 없습니다.");
      return;
    }

    try {
      setContestActionError(null);
      await voteContestCandidatesMutation.mutateAsync(contestCandidateIds);
      saveLocalContestVoteSelection(roomId, contestCandidateIds);
      setCachedContestVoteCandidateIds(contestCandidateIds.map(String));
      await contestVoteStatusQuery.refetch();
      setIsContestVoteSubmitted(true);
      setSheetState("contestComplete");
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "공모전 투표에 실패했습니다."));
    }
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
      setSubmittedTeamRoomId(roomId);

      const reviewTargetsResult = await refetchReviewTargets();
      const nextHasCompletedMemberReviews = hasCompletedAllMemberReviews(reviewTargetsResult.data);

      setDeadlineSubmissionStatus("completed");
      setIsMemberReviewStartOpen(!nextHasCompletedMemberReviews);
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "프로젝트 제출 완료 처리에 실패했습니다."));
    }
  };

  const markContestSubmissionIncomplete = async () => {
    setContestActionError(null);

    try {
      await updateTeamSubmissionMutation.mutateAsync({ completed: false });
      setSubmittedTeamRoomId(null);
      setDeadlineSubmissionStatus(null);
    } catch (error) {
      setContestActionError(getApiErrorMessage(error, "프로젝트 미완료 처리에 실패했습니다."));
    }
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

  const isLeaderOverlay = sheetState === "leaderComplete";
  const isContestOverlay = sheetState === "contestResult" || sheetState === "contestDetail";
  const apiContestCandidates = contestCandidatesQuery.data ?? EMPTY_CONTEST_CANDIDATES;
  const contestCandidates = useMemo(
    () => mergeContestCandidates(apiContestCandidates, localContestCandidates),
    [apiContestCandidates, localContestCandidates],
  );
  const latestContestVoteReminderMessage = useMemo(
    () => [...serverMessages].reverse().find(isContestVoteReminderMessage),
    [serverMessages],
  );
  const latestContestVoteMessage = useMemo(
    () =>
      [...serverMessages].reverse().find((message) => message.messageType === "CONTEST_VOTE_CARD"),
    [serverMessages],
  );
  const latestProgressCheckMessage = useMemo(
    () => [...serverMessages].reverse().find(isProgressCheckMessage),
    [serverMessages],
  );
  const latestSubmissionCheckMessage = useMemo(
    () => [...serverMessages].reverse().find(isSubmissionCheckMessage),
    [serverMessages],
  );
  const latestContestResultMessage = useMemo(
    () =>
      [...serverMessages]
        .reverse()
        .find((message) => message.messageType === "CONTEST_RESULT_CARD"),
    [serverMessages],
  );
  const hasContestResultMessage = serverMessages.some(
    (message) => message.messageType === "CONTEST_RESULT_CARD",
  );
  const hasLeaderResultMessage = serverMessages.some(
    (message) => message.messageType === "LEADER_RESULT_CARD",
  );
  const latestLeaderVoteMessage = useMemo(
    () =>
      [...serverMessages].reverse().find((message) => message.messageType === "LEADER_VOTE_CARD"),
    [serverMessages],
  );
  const latestLeaderNominationMessage = useMemo(
    () =>
      [...serverMessages]
        .reverse()
        .find((message) => message.messageType === "LEADER_NOMINATION_CARD"),
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
  const shareContestIds = useMemo(() => {
    const ids = serverMessages
      .filter((message) => message.messageType === "CONTEST_SHARE_CARD")
      .map((message) => getMetadataNumber(message.metadata, "contestId"))
      .filter((contestId): contestId is number => contestId !== undefined);
    const resultContestIds = serverMessages
      .filter((message) => message.messageType === "CONTEST_RESULT_CARD")
      .map((message) => getMetadataNumber(message.metadata, "contestId"))
      .filter((contestId): contestId is number => contestId !== undefined);

    return Array.from(new Set([...ids, ...resultContestIds]));
  }, [serverMessages]);
  const shareContestPreviewQueries = useQueries({
    queries: shareContestIds.map((contestId) => ({
      queryKey: contestSharePreviewQueryKey(String(contestId)),
      queryFn: () => fetchContestSharePreview(String(contestId)),
      select: mapContestSharePreviewToRecommendedContest,
      staleTime: 1000 * 60,
    })),
  });
  const shareContestsById = useMemo(() => {
    const contests = new Map<number, RecommendedContest>();

    shareContestPreviewQueries.forEach((query) => {
      if (query.data?.contestId !== undefined) {
        contests.set(query.data.contestId, query.data);
      }
    });

    return contests;
  }, [shareContestPreviewQueries]);
  const selectedContestId = latestContestResultMessage
    ? getMetadataNumber(latestContestResultMessage.metadata, "contestId")
    : undefined;
  const selectedContest = selectedContestId ? shareContestsById.get(selectedContestId) : undefined;
  const projectEndedAt =
    selectedContest?.projectEndAt ??
    membersQuery.data?.projectEndedAt ??
    roomFromList?.projectEndedAt;
  const contestVoteStatus = contestVoteStatusQuery.data;
  const contestVoteResult = contestVoteStatus?.result ?? "normal";
  const hasMyVoted = contestVoteStatus?.myVoted ?? isContestVoteSubmitted;
  const voteCountdownSeconds =
    getRemainingSecondsFromMetadata(
      latestContestVoteMessage?.metadata,
      ["voteDeadlineAt", "voteEndsAt", "voteClosedAt", "deadlineAt", "expiresAt"],
      [],
      now,
    ) ??
    getRemainingSecondsFromMetadata(
      latestContestVoteReminderMessage?.metadata,
      [
        "candidateDeadlineAt",
        "candidateEndsAt",
        "candidateClosedAt",
        "voteDeadlineAt",
        "voteEndsAt",
        "voteClosedAt",
        "deadlineAt",
        "expiresAt",
      ],
      ["candidateRemainingSeconds", "voteRemainingSeconds", "remainingSeconds"],
      now,
      latestContestVoteReminderMessage?.sentAt,
    ) ??
    getRemainingSecondsFromContests(contestCandidates, "voteDeadlineAt", now) ??
    getRemainingSeconds(contestCandidateDeadlineAt ?? undefined, now) ??
    DEFAULT_CONTEST_VOTE_SECONDS;
  const isContestVoteClosed = voteCountdownSeconds <= 0 || hasContestResultMessage;
  const isContestVoteInProgress = !isContestVoteClosed;
  const displayedVoteCountdownSeconds = isContestVoteClosed ? 0 : voteCountdownSeconds;
  const openContestVoteEntry = (contestCandidateIds?: string[]) => {
    if (hasMyVoted) {
      showContestVoteStatus(contestCandidateIds);
      return;
    }

    startContestVote(contestCandidateIds);
  };
  const projectRemainingSeconds = getProjectEndRemainingSeconds(projectEndedAt ?? undefined, now);
  const isProjectDeadlineReached =
    projectRemainingSeconds !== undefined && projectRemainingSeconds <= 0;
  const canShowProjectSubmissionReminder =
    !hasTeamSubmissionCompleted && !hasConfirmedCompletedMemberReviews;
  const leaderCandidacyCountdownSeconds =
    getRemainingSecondsFromMetadata(
      latestLeaderNominationMessage?.metadata,
      [
        "leaderCandidacyDeadlineAt",
        "leaderCandidacyEndsAt",
        "leaderCandidacyClosedAt",
        "nominationDeadlineAt",
        "nominationEndsAt",
        "deadlineAt",
        "expiresAt",
      ],
      [],
      now,
    ) ??
    getRemainingSeconds(leaderCandidacyDeadlineAt ?? undefined, now);
  const leaderVoteCountdownSeconds =
    getRemainingSecondsFromMetadata(
      latestLeaderVoteMessage?.metadata,
      [
        "leaderVoteDeadlineAt",
        "leaderVoteEndsAt",
        "leaderVoteClosedAt",
        "voteDeadlineAt",
        "deadlineAt",
        "expiresAt",
      ],
      [],
      now,
    ) ??
    getRemainingSeconds(leaderVoteDeadlineAt ?? undefined, now) ??
    getRemainingSeconds(leaderSelectionDeadlineAt ?? undefined, now) ??
    getRemainingSecondsFromMetadata(
      latestLeaderVoteMessage?.metadata,
      [],
      ["leaderVoteRemainingSeconds", "voteRemainingSeconds", "remainingSeconds"],
      now,
    ) ??
    DEFAULT_LEADER_VOTE_SECONDS;
  const isLeaderVoteResultReady = isLeaderVoteReadyToShow(
    latestLeaderResultMessage?.metadata ?? latestLeaderVoteMessage?.metadata,
    chatMembers,
    leaderVoteCountdownSeconds,
  );
  const leaderRecommendationStatus = leaderRecommendationQuery.data?.status;
  const isLeaderNominationActionCompleted = latestLeaderNominationMessage
    ? Boolean(latestLeaderVoteMessage) ||
      (hasLeaderResultMessage && isLeaderVoteResultReady) ||
      isLeaderCandidacySubmitted ||
      isLeaderCandidacyActionCompleted(latestLeaderNominationMessage)
    : false;
  const shouldRequestLeaderRecommendation =
    !leaderRecommendationQuery.data || leaderRecommendationStatus === "FAILED";
  const isLeaderNominationBannerDisabled =
    createLeaderRecommendationMutation.isPending ||
    leaderRecommendationStatus === "PENDING" ||
    leaderRecommendationStatus === "PROCESSING" ||
    isLeaderNominationActionCompleted;
  const electedLeader = getLeaderResultMember(latestLeaderResultMessage, chatMembers);
  const activeContestCandidates = activeContestCandidateIds?.length
    ? contestCandidates.filter((contest) => activeContestCandidateIds.includes(contest.id))
    : contestCandidates;
  const userAddedContestCandidates = activeContestCandidateIds?.length
    ? contestCandidates.filter(
        (contest) => !activeContestCandidateIds.includes(contest.id) && !contest.isRecommended,
      )
    : [];
  const candidateContests = mergeContestCandidates(
    activeContestCandidates,
    userAddedContestCandidates,
  );
  const restoredSelectedContestIds = getVotedContestSelectionIds(
    candidateContests,
    contestVoteStatus,
    cachedContestVoteCandidateIds,
  );
  const displayedSelectedContestIds =
    selectedContestIds.length > 0 ? selectedContestIds : restoredSelectedContestIds;
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
        onBack={() => setSheetState("closed")}
      />
    );
  }

  if (sheetState === "contestComplete") {
    return (
      <ContestVoteCompleteSheet
        contests={candidateContests}
        onBack={() => setSheetState("closed")}
        onOpenAdd={openContestAddList}
        onRevote={() =>
          startContestVote(activeContestCandidateIds ?? undefined, { keepSelection: true })
        }
        participantCount={contestVoteStatus?.participantCount}
        remainingSeconds={displayedVoteCountdownSeconds}
        selectedContestIds={displayedSelectedContestIds}
        voteResults={contestVoteStatus?.results}
      />
    );
  }

  if (sheetState === "contestVote") {
    return (
      <ContestVoteSheet
        contests={candidateContests}
        disabled={voteContestCandidatesMutation.isPending || isContestVoteClosed}
        isRevote={hasMyVoted}
        onBack={() => setSheetState("closed")}
        onOpenAdd={openContestAddList}
        onSubmit={submitContestVote}
        onToggle={toggleContestVote}
        participantCount={contestVoteStatus?.participantCount}
        remainingSeconds={displayedVoteCountdownSeconds}
        selectedContestIds={displayedSelectedContestIds}
      />
    );
  }

  return (
    <main
      data-chat-room-shell
      className="relative flex h-full w-full flex-col overflow-hidden bg-white text-color-gray-850"
    >
      <ChatTopBar
        memberCount={chatMembers.filter((member) => !member.isChatbot).length}
        roomId={roomId}
        title={roomTitle || undefined}
      />

      {latestLeaderNominationMessage && !isLeaderNominationActionCompleted ? (
        <LeaderVoteNoticeBanner
          body={latestLeaderNominationMessage.body}
          isActionDisabled={isLeaderNominationBannerDisabled}
          onAction={
            shouldRequestLeaderRecommendation
              ? requestLeaderRecommendation
              : () => {
                  setLeaderActionError(null);
                  setSheetState("willingness");
                }
          }
        />
      ) : null}

      {latestContestVoteReminderMessage && !hasContestResultMessage && !isContestResultShown ? (
        <ContestVoteNoticeBanner
          body={latestContestVoteReminderMessage.body}
          isActionDisabled={isContestVoteClosed}
          isVoteSubmitted={hasMyVoted}
          onAction={() => showContestVoteStatus(latestContestVoteReminderCandidateIds)}
        />
      ) : null}

      {latestProgressCheckMessage && isCurrentMemberLeader && !isMidtermSubmitted ? (
        <ProgressCheckBanner
          disabled={updateTeamProgressMutation.isPending}
          onSubmit={submitMidtermCheck}
        />
      ) : null}

      {(latestSubmissionCheckMessage || isProjectDeadlineReached) &&
      deadlineSubmissionStatus === null &&
      canShowProjectSubmissionReminder ? (
        <ProjectSubmissionReminderBanner
          canComplete
          disabled={updateTeamSubmissionMutation.isPending}
          onComplete={completeContestSubmission}
          onIncomplete={markContestSubmissionIncomplete}
        />
      ) : null}

      <section
        aria-label="팀장 선출 채팅"
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-[29px] pb-[96px]"
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

        {serverMessages.map((message, index) => {
          const previousMessage = serverMessages[index - 1];
          const dateSeparatorLabel =
            message.sentAtDateKey !== previousMessage?.sentAtDateKey
              ? message.sentAtDateLabel
              : undefined;

          return (
            <Fragment key={message.id}>
              {dateSeparatorLabel ? <ChatDateSeparator label={dateSeparatorLabel} /> : null}
              <ChatMessageRenderer
                chatMembers={chatMembers}
                contestCandidates={contestCandidates}
                shareContestsById={shareContestsById}
                hasContestResultMessage={hasContestResultMessage}
                hasLeaderResultMessage={hasLeaderResultMessage}
                hasLeaderVoteMessage={Boolean(latestLeaderVoteMessage)}
                isLeaderRecommendationPending={createLeaderRecommendationMutation.isPending}
                isContestVoteClosed={isContestVoteClosed}
                isLeaderCandidacySubmitted={isLeaderCandidacySubmitted}
                isLeaderVoteFlowEnded={hasLeaderResultMessage && isLeaderVoteResultReady}
                isLeaderVoteSubmitted={isLeaderVoteSubmitted}
                leaderRecommendation={leaderRecommendationQuery.data}
                message={message}
                onAddContestCandidate={openContestSharedCandidateAdd}
                onAcceptRecommendation={acceptRecommendedLeader}
                onRemoveContestCandidate={(contest) => {
                  void removeContestCandidate(contest);
                }}
                onOpenContestVote={openContestVoteEntry}
                onOpenContestCandidateShortcut={openContestCandidateShortcut}
                onOpenCandidateVote={openCandidateVote}
                onOpenMemberProfile={setProfileMember}
                onOpenWillingness={() => {
                  setLeaderActionError(null);
                  setSheetState("willingness");
                }}
                onRequestLeaderRecommendation={requestLeaderRecommendation}
                onRequestRevote={requestRevote}
                onUseChatbot={insertChatbotMention}
                voteRemainingSeconds={displayedVoteCountdownSeconds}
              />
            </Fragment>
          );
        })}

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

      <div className="absolute right-0 bottom-0 left-0 z-20 flex flex-col gap-px bg-white">
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
                remainingSeconds={leaderCandidacyCountdownSeconds}
                selectedChoice={leaderChoice}
                onSelect={setLeaderChoice}
                onSubmit={submitWillingness}
              />
            ) : null}

            {sheetState === "candidateVote" ? (
              <LeaderCandidateVoteSheet
                candidates={safeCandidates}
                disabled={voteLeaderMutation.isPending || !selectedCandidate}
                remainingSeconds={leaderVoteCountdownSeconds}
                selectedCandidateId={selectedCandidate?.id ?? ""}
                onSelect={setSelectedCandidateId}
                onSubmit={finishLeaderVote}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {isLeaderOverlay ? (
        <div
          className="absolute inset-0 z-40 flex items-end bg-color-gray-850/60"
          onClick={closeActiveSheet}
        >
          <div className="w-full" onClick={(event) => event.stopPropagation()}>
            {sheetState === "leaderComplete" ? (
              <VoteCompleteSheet
                isResultReady={hasLeaderResultMessage && Boolean(electedLeader)}
                onShowResult={() => setSheetState("closed")}
                remainingSeconds={leaderVoteCountdownSeconds}
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

      {pendingContestAdd ? (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-color-gray-850/60"
          onClick={closeContestAddDialog}
        >
          <div onClick={(event) => event.stopPropagation()}>
            {pendingContestAdd.variant === "confirm" ? (
              <ContestCandidateAddDialog
                contest={pendingContestAdd.contest}
                onCancel={closeContestAddDialog}
                onConfirm={() => {
                  void confirmContestCandidateAdd();
                }}
              />
            ) : (
              <ContestCandidateUnavailableDialog onClose={closeContestAddDialog} />
            )}
          </div>
        </div>
      ) : null}

      {isContestToastShown ? (
        <ContestAddedToast
          onShortcut={() => startContestVote(candidateContests.map((contest) => contest.id))}
        />
      ) : null}

      {currentMember ? (
        <MemberReviewStartDialog
          completionVariant={isCurrentMemberLeader ? "leader" : "member"}
          member={currentMember}
          onClose={() => {
            setIsMemberReviewStartOpen(false);
            setDismissedMemberReviewStartRoomId(roomId);
          }}
          onStart={startMemberReview}
          open={isMemberReviewStartDialogOpen}
          reviewerName={currentMember.name}
          totalDistance={isCurrentMemberLeader ? 35 : 20}
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
  contestCandidates,
  shareContestsById,
  hasContestResultMessage,
  hasLeaderResultMessage,
  hasLeaderVoteMessage,
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
  onOpenContestCandidateShortcut,
  onOpenContestVote,
  onOpenMemberProfile,
  onOpenWillingness,
  onRequestLeaderRecommendation,
  onRequestRevote,
  onUseChatbot,
  voteRemainingSeconds,
}: {
  chatMembers: LeaderCandidate[];
  contestCandidates: RecommendedContest[];
  shareContestsById: Map<number, RecommendedContest>;
  hasContestResultMessage: boolean;
  hasLeaderResultMessage: boolean;
  hasLeaderVoteMessage: boolean;
  isLeaderCandidacySubmitted: boolean;
  isLeaderVoteFlowEnded: boolean;
  isLeaderRecommendationPending: boolean;
  isLeaderVoteSubmitted: boolean;
  isContestVoteClosed: boolean;
  leaderRecommendation?: LeaderRecommendation;
  message: ChatMessage;
  onAddContestCandidate: (contestId: number, contest?: RecommendedContest) => void;
  onAcceptRecommendation: () => void;
  onRemoveContestCandidate: (contest: RecommendedContest) => void;
  onOpenCandidateVote: (candidateIds?: string[]) => void;
  onOpenContestCandidateShortcut: () => void;
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
    const isNominationActionCompleted =
      hasLeaderVoteMessage ||
      isLeaderVoteFlowEnded ||
      isLeaderCandidacySubmitted ||
      isLeaderCandidacyActionCompleted(message);

    return (
      <BotMessage
        body={getLeaderRecommendationMessage(message.body, leaderRecommendation)}
        buttonDisabled={
          isLeaderRecommendationPending ||
          recommendationStatus === "PENDING" ||
          recommendationStatus === "PROCESSING" ||
          isNominationActionCompleted
        }
        buttonLabel="팀장 여부 투표하기"
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
      hasLeaderResultMessage ||
      isLeaderVoteFlowEnded ||
      isLeaderVoteSubmitted ||
      isLeaderActionCompleted(message);
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
      />
    );
  }

  if (message.messageType === "LEADER_RESULT_CARD") {
    const leader = getLeaderResultMember(message, chatMembers);

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
    const contestIds = getMetadataNumberArray(message.metadata, "contestIds").slice(0, 2);
    const contests = getContestsByIds(contestCandidates, contestIds, "contestId");
    const displayContests = contestIds.map(
      (contestId) =>
        contests.find((contest) => String(contest.contestId ?? contest.id) === String(contestId)) ??
        createPlaceholderContest(contestId),
    );
    return (
      <ContestRecommendationMessage
        body={message.body}
        contests={displayContests}
        isActionDisabled={hasContestResultMessage}
        onRemove={(contest) => {
          onRemoveContestCandidate(contest);
        }}
        onStartVote={() => onOpenContestVote(displayContests.map((contest) => contest.id))}
        remainingSeconds={voteRemainingSeconds}
        sentAt={message.sentAt}
        timerLabel="투표 마감까지"
        title="추천 공모전 리스트"
      />
    );
  }

  if (message.messageType === "CONTEST_SHARE_CARD") {
    const contestId = getMetadataNumber(message.metadata, "contestId");
    const sender = message.senderId
      ? chatMembers.find((member) => member.id === message.senderId)
      : undefined;
    const metadataContest = contestId
      ? createContestFromShareMetadata(contestId, message.metadata)
      : undefined;
    const sharePreviewContest = contestId ? shareContestsById.get(contestId) : undefined;
    const contest =
      contestCandidates.find((candidate) => candidate.contestId === contestId) ??
      (sharePreviewContest
        ? {
            ...sharePreviewContest,
            viewCount: sharePreviewContest.viewCount || metadataContest?.viewCount || "",
          }
        : metadataContest) ??
      (contestId ? createPlaceholderContest(contestId) : undefined);

    return contest && contestId ? (
      <ContestSharedMessage
        avatarSrc={message.avatarSrc}
        avatarTone={message.avatarTone}
        contest={contest}
        direction={message.direction}
        isAdded={Boolean(contestCandidates.find((candidate) => candidate.contestId === contestId))}
        onAdd={() => onAddContestCandidate(contestId, contest)}
        onOpenProfile={
          sender && !sender.isMe && sender.profileId !== undefined
            ? () => onOpenMemberProfile(sender)
            : undefined
        }
        senderName={message.senderName}
        sentAt={message.sentAt}
        unreadLabel={message.unreadLabel}
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

  if (isContestCandidateAddedLog(message)) {
    return (
      <ContestCandidateAddedLog body={message.body} onShortcut={onOpenContestCandidateShortcut} />
    );
  }

  if (isContestVoteReminderMessage(message)) {
    return null;
  }

  if (isProgressCheckMessage(message)) {
    return null;
  }

  if (isSubmissionCheckMessage(message)) {
    return null;
  }

  if (isSubmissionStatusLogMessage(message)) {
    return null;
  }

  if (message.messageType === "CONTEST_VOTE_CARD") {
    const candidateIds = getMetadataNumberArray(message.metadata, "contestCandidateIds").map(
      String,
    );
    const contests = getContestsByIds(contestCandidates, candidateIds, "contestCandidateId");

    return (
      <ContestRecommendationMessage
        body={message.body}
        contests={contests.length > 0 ? contests : contestCandidates}
        isActionDisabled={isContestVoteClosed}
        onRemove={(contest) => {
          onRemoveContestCandidate(contest);
        }}
        onStartVote={() => onOpenContestVote(candidateIds)}
        remainingSeconds={voteRemainingSeconds}
        sentAt={message.sentAt}
        timerLabel="투표 마감까지"
        title="공모전 후보 리스트"
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

  if (message.messageType === "CHATBOT_GUIDE_CARD") {
    return (
      <ChatbotUsageGuideMessage
        body={message.body}
        examples={getMetadataStringArray(message.metadata, "examples")}
        onUseChatbot={onUseChatbot}
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

function getMetadataStringByKeys(metadata: ChatMessageMetadata | undefined, keys: string[]) {
  for (const key of keys) {
    const value = getMetadataString(metadata, key);

    if (value) {
      return value;
    }
  }

  return undefined;
}

function isContestCandidateAddedLog(message: ChatMessage) {
  const messageType = message.messageType ?? "";

  return (
    messageType === "CONTEST_CANDIDATE_CARD" ||
    messageType === "CONTEST_CANDIDATE_ADDED" ||
    messageType === "CONTEST_CANDIDATE_ADDED_LOG" ||
    (message.senderType === "SYSTEM" &&
      message.body.includes("공모전을 후보") &&
      message.body.includes("추가"))
  );
}

function isContestVoteReminderMessage(message: ChatMessage) {
  const messageType = message.messageType?.toUpperCase() ?? "";

  return (
    messageType === "CONTEST_VOTE_REMINDER_CARD" ||
    (messageType.includes("CONTEST") &&
      messageType.includes("VOTE") &&
      messageType.includes("REMINDER"))
  );
}

function isProgressCheckMessage(message: ChatMessage) {
  const messageType = message.messageType?.toUpperCase() ?? "";

  return (
    messageType === "PROGRESS_CHECK_CARD" ||
    messageType === "PROJECT_PROGRESS_CHECK_CARD" ||
    messageType === "MIDTERM_CHECK_CARD" ||
    (messageType.includes("PROGRESS") && messageType.includes("CHECK")) ||
    (messageType.includes("MIDTERM") && messageType.includes("CHECK"))
  );
}

function isSubmissionCheckMessage(message: ChatMessage) {
  const messageType = message.messageType?.toUpperCase() ?? "";

  return (
    messageType === "SUBMISSION_CHECK_CARD" ||
    messageType === "PROJECT_SUBMISSION_CHECK_CARD" ||
    messageType === "PROJECT_DEADLINE_CARD" ||
    (messageType.includes("SUBMISSION") && messageType.includes("CHECK")) ||
    (messageType.includes("PROJECT") && messageType.includes("DEADLINE"))
  );
}

function isSubmissionStatusLogMessage(message: ChatMessage) {
  const messageType = message.messageType?.toUpperCase() ?? "";
  const isSystemLikeMessage =
    message.senderType === "SYSTEM" ||
    message.senderType === "CHATBOT" ||
    message.messageType === "BOT" ||
    messageType.endsWith("_CARD") ||
    messageType.endsWith("_LOG") ||
    messageType.length > 0;

  if (!isSystemLikeMessage) {
    return false;
  }

  const isSubmissionStatusType =
    messageType.includes("SUBMISSION") &&
    !messageType.includes("CHECK") &&
    (messageType.includes("COMPLETE") ||
      messageType.includes("COMPLETED") ||
      messageType.includes("INCOMPLETE") ||
      messageType.includes("STATUS") ||
      messageType.includes("RESULT") ||
      messageType.includes("LOG"));

  const isProjectCompletionType =
    messageType.includes("PROJECT") &&
    (messageType.includes("COMPLETE") ||
      messageType.includes("COMPLETED") ||
      messageType.includes("FINISH") ||
      messageType.includes("FINISHED") ||
      messageType.includes("ENDED"));

  const isProjectCompletionBody =
    message.body.includes("프로젝트") &&
    (message.body.includes("완주") ||
      message.body.includes("진행 완료") ||
      message.body.includes("진행완료") ||
      message.body.includes("종료"));

  return isSubmissionStatusType || isProjectCompletionType || isProjectCompletionBody;
}

function isTeamSubmissionCompletedMessage(message: ChatMessage) {
  const messageType = message.messageType?.toUpperCase() ?? "";
  const teamSubmitted =
    getMetadataBoolean(message.metadata, "teamSubmitted") ??
    getMetadataBoolean(message.metadata, "isTeamSubmitted");

  if (teamSubmitted !== undefined) {
    return teamSubmitted;
  }

  const metadataCompleted =
    messageType.includes("SUBMISSION") || messageType.includes("PROJECT_SUBMISSION")
      ? (getMetadataBoolean(message.metadata, "completed") ??
        getMetadataBoolean(message.metadata, "isCompleted") ??
        getMetadataBoolean(message.metadata, "submitted") ??
        getMetadataBoolean(message.metadata, "isSubmitted"))
      : undefined;

  if (metadataCompleted !== undefined) {
    return metadataCompleted;
  }

  const metadataStatus = (
    getMetadataString(message.metadata, "submissionStatus") ??
    getMetadataString(message.metadata, "teamStatus") ??
    getMetadataString(message.metadata, "status") ??
    getMetadataString(message.metadata, "state")
  )?.toUpperCase();

  if (metadataStatus) {
    return ["SUBMITTED", "COMPLETED", "COMPLETE"].includes(metadataStatus);
  }

  const isCompletedType =
    !messageType.includes("INCOMPLETE") &&
    !messageType.includes("CANCEL") &&
    !messageType.includes("FALSE") &&
    messageType.includes("SUBMISSION") &&
    !messageType.includes("CHECK") &&
    (messageType.includes("SUBMITTED") ||
      messageType.includes("COMPLETE") ||
      messageType.includes("COMPLETED"));

  if (isCompletedType) {
    return true;
  }

  return false;
}

function isSubmittedTeamStatus(status: string | null | undefined) {
  const normalizedStatus = status?.toUpperCase();

  return normalizedStatus === "SUBMITTED";
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

function isLeaderCandidacyActionCompleted(message: ChatMessage) {
  const metadataCompleted =
    getMetadataBoolean(message.metadata, "leaderCandidacySubmitted") ??
    getMetadataBoolean(message.metadata, "isLeaderCandidacySubmitted") ??
    getMetadataBoolean(message.metadata, "candidacySubmitted") ??
    getMetadataBoolean(message.metadata, "isCandidacySubmitted") ??
    getMetadataBoolean(message.metadata, "leaderCandidacyCompleted") ??
    getMetadataBoolean(message.metadata, "isLeaderCandidacyCompleted");

  return metadataCompleted ?? isLeaderActionCompleted(message);
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

function isLeaderVoteReadyToShow(
  metadata: ChatMessageMetadata | undefined,
  members: ChatMember[],
  remainingSeconds: number,
) {
  if (remainingSeconds <= 0) {
    return true;
  }

  const metadataReady =
    getMetadataBoolean(metadata, "allVoted") ??
    getMetadataBoolean(metadata, "isAllVoted") ??
    getMetadataBoolean(metadata, "everyoneVoted") ??
    getMetadataBoolean(metadata, "isEveryoneVoted") ??
    getMetadataBoolean(metadata, "voteCompleted") ??
    getMetadataBoolean(metadata, "isVoteCompleted");

  if (metadataReady !== undefined) {
    return metadataReady;
  }

  const metadataStatus = (
    getMetadataString(metadata, "leaderVoteStatus") ??
    getMetadataString(metadata, "voteStatus") ??
    getMetadataString(metadata, "status") ??
    getMetadataString(metadata, "state")
  )?.toUpperCase();

  if (
    metadataStatus === "CLOSED" ||
    metadataStatus === "ENDED" ||
    metadataStatus === "COMPLETED" ||
    metadataStatus === "COMPLETE" ||
    metadataStatus === "ALL_VOTED"
  ) {
    return true;
  }

  const votedCount =
    getMetadataNumber(metadata, "votedCount") ??
    getMetadataNumber(metadata, "completedVoterCount") ??
    getMetadataNumber(metadata, "votedMemberCount") ??
    getMetadataNumber(metadata, "votedTeamMemberCount") ??
    getMetadataNumber(metadata, "voteCount") ??
    getMetadataNumber(metadata, "participantCount") ??
    getMetadataNumber(metadata, "leaderVoteParticipantCount");
  const votedMemberIds = getMetadataNumberArrayByKeys(metadata, [
    "votedMemberIds",
    "votedTeamMemberIds",
    "participantIds",
    "participantTeamMemberIds",
    "leaderVoteParticipantIds",
    "leaderVoteParticipantTeamMemberIds",
  ]);
  const totalCount =
    getMetadataNumber(metadata, "totalVoterCount") ??
    getMetadataNumber(metadata, "totalVoteCount") ??
    getMetadataNumber(metadata, "totalMemberCount") ??
    getMetadataNumber(metadata, "totalTeamMemberCount") ??
    getMetadataNumber(metadata, "voterCount") ??
    getMetadataNumber(metadata, "teamMemberCount") ??
    getMetadataNumber(metadata, "memberCount") ??
    members.filter((member) => !member.isChatbot).length;

  return (
    totalCount > 0 &&
    ((votedCount !== undefined && votedCount >= totalCount) || votedMemberIds.length >= totalCount)
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

function getLeaderResultMember(message: ChatMessage | undefined, members: ChatMember[]) {
  const metadata = message?.metadata;
  const leaderTeamMemberId =
    getMetadataNumber(metadata, "leaderTeamMemberId") ??
    getMetadataNumber(metadata, "electedLeaderTeamMemberId") ??
    getMetadataNumber(metadata, "electedTeamMemberId") ??
    getMetadataNumber(metadata, "selectedTeamMemberId") ??
    getMetadataNumber(metadata, "candidateTeamMemberId") ??
    getMetadataNumber(metadata, "leaderMemberId") ??
    getMetadataNumber(metadata, "memberId") ??
    getMetadataNumber(metadata, "teamMemberId") ??
    getMetadataNumber(metadata, "id");

  const leaderById = leaderTeamMemberId
    ? members.find((member) => member.id === String(leaderTeamMemberId))
    : undefined;

  if (leaderById) {
    return leaderById;
  }

  const leaderName =
    getMetadataString(metadata, "leaderNickname") ??
    getMetadataString(metadata, "leaderName") ??
    getMetadataString(metadata, "electedLeaderNickname") ??
    getMetadataString(metadata, "electedLeaderName") ??
    getMetadataString(metadata, "nickname") ??
    getMetadataString(metadata, "name");

  const leaderByName = leaderName
    ? members.find((member) => member.name === leaderName)
    : undefined;

  if (leaderByName) {
    return leaderByName;
  }

  const body = message?.body ?? "";

  return members.find(
    (member) => !member.isChatbot && member.name.length > 0 && body.includes(member.name),
  ) ?? createFallbackLeaderMember(message, leaderTeamMemberId, leaderName);
}

function createFallbackLeaderMember(
  message: ChatMessage | undefined,
  leaderTeamMemberId: number | undefined,
  leaderName: string | undefined,
): ChatMember | undefined {
  const fallbackName = leaderName ?? getLeaderNameFromMessageBody(message?.body);

  if (!fallbackName) {
    return undefined;
  }

  return {
    id: leaderTeamMemberId ? String(leaderTeamMemberId) : `leader-result-${fallbackName}`,
    name: fallbackName,
    isLeader: true,
    avatarTone: "green",
  };
}

function getLeaderNameFromMessageBody(body: string | undefined) {
  return body?.match(/([^\s,]+)님이/)?.[1];
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

  return body;
}

function hasCompletedAllMemberReviews(
  reviewTargets: ReturnType<typeof useReviewTargetsQuery>["data"],
) {
  if (!reviewTargets) {
    return false;
  }

  const reviewableMembers = reviewTargets.filter((member) => !member.isMe);

  return (
    reviewableMembers.length > 0 && reviewableMembers.every((member) => member.alreadyReviewed)
  );
}

function getContestsByIds(
  contests: RecommendedContest[],
  ids: Array<number | string>,
  idField: "contestId" | "contestCandidateId",
) {
  const idSet = new Set(ids.map(String));

  return contests.filter((contest) => idSet.has(String(contest[idField] ?? contest.id)));
}

function getVotedContestSelectionIds(
  contests: RecommendedContest[],
  voteStatus: ContestVoteStatus | undefined,
  cachedContestCandidateIds: string[],
) {
  if (!voteStatus && cachedContestCandidateIds.length === 0) {
    return [];
  }

  const votedContestCandidateIdSet = new Set([
    ...cachedContestCandidateIds,
    ...(voteStatus?.myContestCandidateIds.map(String) ?? []),
  ]);
  const votedContestIdSet = new Set(voteStatus?.myContestIds.map(String) ?? []);

  return contests
    .filter((contest) => {
      const contestCandidateId = contest.contestCandidateId ?? Number(contest.id);
      const contestId = contest.contestId ?? Number(contest.id);

      return (
        (Number.isFinite(contestCandidateId) &&
          votedContestCandidateIdSet.has(String(contestCandidateId))) ||
        (Number.isFinite(contestId) && votedContestIdSet.has(String(contestId)))
      );
    })
    .map((contest) => contest.id);
}

function getLocalContestVoteSelectionKey(roomId: string) {
  return `${LOCAL_CONTEST_VOTE_SELECTION_PREFIX}${roomId}`;
}

function loadLocalContestVoteSelection(roomId: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(getLocalContestVoteSelectionKey(roomId));
    const parsedValue: unknown = value ? JSON.parse(value) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.map(String).filter((id) => id.length > 0)
      : [];
  } catch {
    return [];
  }
}

function saveLocalContestVoteSelection(roomId: string, contestCandidateIds: number[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getLocalContestVoteSelectionKey(roomId),
      JSON.stringify(contestCandidateIds),
    );
  } catch {
    // 로컬 복원 캐시 저장 실패는 투표 API 성공 흐름을 막지 않는다.
  }
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

function createContestFromShareMetadata(
  contestId: number,
  metadata: ChatMessageMetadata | undefined,
): RecommendedContest | undefined {
  const category = getMetadataStringByKeys(metadata, [
    "category",
    "contestCategory",
    "field",
    "fieldName",
    "contestField",
  ]);
  const title = getMetadataStringByKeys(metadata, ["title", "contestTitle", "name"]);
  const organizer = getMetadataStringByKeys(metadata, [
    "hostName",
    "organizer",
    "organizerName",
    "host",
    "organization",
    "organizationName",
  ]);
  const dday =
    getMetadataStringByKeys(metadata, ["dDay", "dday", "deadlineLabel"]) ??
    formatContestDday(getMetadataNumber(metadata, "daysRemaining"));

  if (!category && !title && !organizer && !dday) {
    return undefined;
  }

  return {
    id: String(contestId),
    contestId,
    category: category ? (contestCategoryLabels[category] ?? category) : "공모전",
    dday,
    imageSrc: getNextImageSafeSrc(
      getMetadataStringByKeys(metadata, [
        "thumbnailUrl",
        "posterImageUrl",
        "imageUrl",
        "posterUrl",
      ]),
    ),
    organizer: organizer ?? "",
    projectEndAt: getMetadataStringByKeys(metadata, [
      "applyEndAt",
      "applicationEndAt",
      "projectEndAt",
      "projectEndedAt",
      "endAt",
      "endDate",
    ]),
    title: title ?? `공모전 #${contestId}`,
    viewCount: (
      getMetadataNumber(metadata, "viewCount") ??
      getMetadataNumber(metadata, "views") ??
      getMetadataNumber(metadata, "hitCount") ??
      0
    ).toLocaleString("ko-KR"),
  };
}

function mapContestSummaryToRecommendedContest(contest: ContestSummary): RecommendedContest {
  const contestId = Number(contest.id);

  return {
    id: contest.id,
    contestId: Number.isFinite(contestId) ? contestId : undefined,
    category: contest.category,
    dday: contest.dDay,
    imageSrc: getNextImageSafeSrc(contest.posterImageUrl),
    organizer: contest.organizer,
    title: contest.title,
    viewCount: contest.viewCount.toLocaleString("ko-KR"),
  };
}

function mapContestSharePreviewToRecommendedContest(
  contest: Awaited<ReturnType<typeof fetchContestSharePreview>>,
): RecommendedContest {
  const contestId = Number(contest.contestId);

  return {
    id: contest.contestId,
    contestId: Number.isFinite(contestId) ? contestId : undefined,
    category: contest.category,
    dday: contest.dDay,
    imageSrc: getNextImageSafeSrc(contest.thumbnailUrl ?? undefined),
    organizer: contest.hostName,
    projectEndAt: contest.applyEndAt,
    title: contest.title,
    viewCount: "",
  };
}

function mergeContestCandidates(
  baseContests: RecommendedContest[],
  nextContests: RecommendedContest[],
) {
  const contestByIdentity = new Map<string, RecommendedContest>();

  baseContests.forEach((contest) => {
    contestByIdentity.set(getContestIdentity(contest), contest);
  });

  nextContests.forEach((contest) => {
    const identity = getContestIdentity(contest);

    if (!contestByIdentity.has(identity)) {
      contestByIdentity.set(identity, contest);
    }
  });

  return Array.from(contestByIdentity.values());
}

function getContestIdentity(contest: RecommendedContest) {
  return String(contest.contestId ?? contest.id);
}

function formatContestDday(daysRemaining: number | undefined) {
  if (daysRemaining === undefined) {
    return "";
  }

  return daysRemaining <= 0 ? "D-Day" : `D-${daysRemaining}`;
}

function getRemainingSecondsFromMetadata(
  metadata: ChatMessageMetadata | undefined,
  deadlineKeys: string[],
  remainingKeys: string[],
  now: number,
  baseTime?: string,
) {
  for (const key of remainingKeys) {
    const remainingSeconds = getMetadataNumber(metadata, key);

    if (remainingSeconds !== undefined) {
      const baseTimestamp = baseTime ? new Date(baseTime).getTime() : undefined;

      // remainingKeys 값은 메시지를 보낸 시점 기준 "남은 초"라, 그 이후 흐른 시간만큼
      // 빼줘야 실시간 카운트다운이 된다. baseTime이 없으면(과거 호출 호환) 고정값으로 둔다.
      if (baseTimestamp !== undefined && Number.isFinite(baseTimestamp)) {
        const elapsedSeconds = Math.max(0, (now - baseTimestamp) / 1000);
        return Math.max(0, remainingSeconds - elapsedSeconds);
      }

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

function getProjectEndRemainingSeconds(projectEndedAt: string | undefined, now: number) {
  if (!projectEndedAt) {
    return undefined;
  }

  const dateOnlyMatch = projectEndedAt.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const endOfDay = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
    const endOfDayTime = endOfDay.getTime();

    return Number.isFinite(endOfDayTime)
      ? Math.max(0, Math.ceil((endOfDayTime - now) / 1000))
      : undefined;
  }

  return getRemainingSeconds(projectEndedAt, now);
}

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof ApiError ? error.message : fallbackMessage;
}

function ChatDateSeparator({ label }: { label: string }) {
  return (
    <div
      aria-label={`${label} 날짜 구분`}
      className="flex w-full items-center text-[10px] leading-[1.2] font-medium text-color-gray-500"
    >
      <div className="h-px flex-1 bg-color-gray-200" />
      <span className="shrink-0 px-2">{label}</span>
      <div className="h-px flex-1 bg-color-gray-200" />
    </div>
  );
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

function ContestCandidateAddedLog({ body, onShortcut }: { body: string; onShortcut: () => void }) {
  return (
    <div className="flex w-full justify-center">
      <div className="flex max-w-[358px] items-center gap-4 rounded-full bg-[rgba(97,97,97,0.10)] px-2 py-1 text-center text-[12px] leading-[1.35] font-semibold whitespace-nowrap text-color-gray-650">
        <span className="min-w-0 truncate">{body}</span>
        <button
          className="shrink-0 underline underline-offset-2"
          onClick={onShortcut}
          type="button"
        >
          바로가기
        </button>
      </div>
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
