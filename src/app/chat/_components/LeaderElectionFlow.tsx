"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";

import { ApiError } from "@/lib/http";
import { getNextImageSafeSrc } from "@/lib/imageSources";
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
  const chatMembers = membersQuery.data?.chatMembers ?? EMPTY_CHAT_MEMBERS;
  const contestCandidateDeadlineAt = membersQuery.data?.contestCandidateDeadlineAt;
  const leaderSelectionDeadlineAt = membersQuery.data?.leaderSelectionDeadlineAt;
  const leaderVoteDeadlineAt = membersQuery.data?.leaderVoteDeadlineAt;
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
  const [pendingContestAdd, setPendingContestAdd] = useState<{
    contest: RecommendedContest;
    contestId: number;
    variant: "confirm" | "unavailable";
  } | null>(null);
  const [localContestCandidates, setLocalContestCandidates] = useState<RecommendedContest[]>([]);
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

    try {
      setContestActionError(null);
      await voteContestCandidatesMutation.mutateAsync(contestCandidateIds);
      await contestVoteStatusQuery.refetch();
      setIsContestVoteSubmitted(true);
      setSheetState("contestComplete");
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

  const isLeaderOverlay = sheetState === "leaderComplete";
  const isContestOverlay = sheetState === "contestResult" || sheetState === "contestDetail";
  const apiContestCandidates = contestCandidatesQuery.data ?? EMPTY_CONTEST_CANDIDATES;
  const contestCandidates = useMemo(
    () => mergeContestCandidates(apiContestCandidates, localContestCandidates),
    [apiContestCandidates, localContestCandidates],
  );
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
  const latestLeaderVoteMessage = useMemo(
    () =>
      [...serverMessages].reverse().find((message) => message.messageType === "LEADER_VOTE_CARD"),
    [serverMessages],
  );
  const latestLeaderResultMessage = useMemo(
    () =>
      [...serverMessages].reverse().find((message) => message.messageType === "LEADER_RESULT_CARD"),
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

    return Array.from(new Set(ids));
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
  const contestVoteStatus = contestVoteStatusQuery.data;
  const contestVoteResult = contestVoteStatus?.result ?? "normal";
  const hasMyVoted = contestVoteStatus?.myVoted ?? isContestVoteSubmitted;
  const voteCountdownSeconds =
    getRemainingSecondsFromMetadata(
      latestContestVoteReminderMessage?.metadata,
      ["voteDeadlineAt", "voteEndsAt", "voteClosedAt", "deadlineAt", "expiresAt"],
      [],
      now,
    ) ??
    getRemainingSecondsFromContests(contestCandidates, "voteDeadlineAt", now) ??
    getRemainingSeconds(contestCandidateDeadlineAt ?? undefined, now) ??
    getRemainingSecondsFromMetadata(
      latestContestVoteReminderMessage?.metadata,
      [],
      ["voteRemainingSeconds", "remainingSeconds"],
      now,
    ) ??
    DEFAULT_CONTEST_VOTE_SECONDS;
  const isContestVoteClosed = voteCountdownSeconds <= 0 || hasContestResultMessage;
  const isContestVoteInProgress =
    Boolean(latestContestVoteReminderMessage) && !isContestVoteClosed && !hasContestResultMessage;
  const displayedVoteCountdownSeconds = isContestVoteClosed ? 0 : voteCountdownSeconds;
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
        onRevote={() =>
          startContestVote(activeContestCandidateIds ?? undefined, { keepSelection: true })
        }
        participantCount={contestVoteStatus?.participantCount}
        remainingSeconds={displayedVoteCountdownSeconds}
        selectedContestIds={selectedContestIds}
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
        remainingSeconds={displayedVoteCountdownSeconds}
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
          isVoteSubmitted={hasMyVoted}
          onAction={
            hasMyVoted
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
                onOpenContestVote={startContestVote}
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
  contestCandidates,
  shareContestsById,
  hasContestResultMessage,
  hasLeaderResultMessage,
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
      >
        <LeaderCandidatePreviewCard
          leaders={getMembersByMetadataIds(chatMembers, candidateIds)}
          title="팀장 후보"
        />
      </BotMessage>
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
        timerLabel="후보 마감까지"
        title="추천 공모전 리스트"
      />
    );
  }

  if (message.messageType === "CONTEST_SHARE_CARD") {
    const contestId = getMetadataNumber(message.metadata, "contestId");
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
        contest={contest}
        isAdded={Boolean(contestCandidates.find((candidate) => candidate.contestId === contestId))}
        onAdd={() => onAddContestCandidate(contestId, contest)}
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

  if (isContestCandidateAddedLog(message)) {
    return (
      <ContestCandidateAddedLog body={message.body} onShortcut={onOpenContestCandidateShortcut} />
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
  );
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
