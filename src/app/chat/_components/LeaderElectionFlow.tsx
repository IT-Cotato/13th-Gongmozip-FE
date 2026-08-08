"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  type ChatbotNotice,
  useChatbotNoticeStore,
} from "@/stores/chatbotNoticeStore";
import {
  useChatTeamMembersQuery,
  useChatTeamMessagesQuery,
  useMarkChatTeamAsReadMutation,
} from "@/queries/useChatQueries";

import { MOCK_CHAT_MEMBERS } from "../_data/mockMessages";
import { ChatInputBar } from "./ChatInputBar";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatTopBar } from "./ChatTopBar";
import { MemberReviewStartDialog } from "./member-review";
import {
  BotMessage,
  ChatbotSystemNotice,
  ChatbotTextMessage,
  ChatbotUsageGuideMessage,
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
  LeaderChoice,
  LeaderEvent,
  LeaderScenario,
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
const EMPTY_CHATBOT_NOTICES: ChatbotNotice[] = [];

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
  const chatbotNotices =
    useChatbotNoticeStore((state) => state.noticesByRoomId[roomId]) ?? EMPTY_CHATBOT_NOTICES;
  const membersQuery = useChatTeamMembersQuery(roomId);
  const chatMembers =
    membersQuery.data && membersQuery.data.chatMembers.length > 0
      ? membersQuery.data.chatMembers
      : MOCK_CHAT_MEMBERS;
  const messagesQuery = useChatTeamMessagesQuery(roomId, chatMembers, {
    enabled: membersQuery.isSuccess,
  });
  const { mutate: markAsRead } = useMarkChatTeamAsReadMutation(roomId);
  const leaderScenario = getLeaderScenario(mockLeaderIntentAnswers);
  const [sheetState, setSheetState] = useState<SheetState>("closed");
  const [leaderChoice, setLeaderChoice] = useState<LeaderChoice>("no");
  const [leaderEvent, setLeaderEvent] = useState<LeaderEvent>(() =>
    getInitialLeaderEvent(leaderScenario),
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
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
  const [deadlineSubmissionStatus, setDeadlineSubmissionStatus] = useState<
    "completed" | "incomplete" | null
  >(null);
  const [isDeadlineReminderBannerShown, setIsDeadlineReminderBannerShown] = useState(false);
  const [candidateRemainingSeconds, setCandidateRemainingSeconds] = useState(10);
  const [candidateContestIds, setCandidateContestIds] = useState<string[]>(
    mockRecommendedContests.slice(0, 3).map((contest) => contest.id),
  );
  const [selectedContestIds, setSelectedContestIds] = useState<string[]>([]);

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

  const safeCandidates = candidates.length > 0 ? candidates : [fallbackCandidate];
  const selectedCandidate =
    safeCandidates.find((candidate) => candidate.id === selectedCandidateId) ?? safeCandidates[0];
  const recommendedLeader = safeCandidates[0] ?? fallbackCandidate;
  const recommendedLeaders = chatMembers.filter((member) =>
    mockAiRecommendedLeaderIds.includes(member.id),
  );
  const currentMember = chatMembers.find((member) => member.isMe) ?? fallbackCandidate;
  const isCurrentMemberLeader = selectedCandidate.id === currentMember.id;
  const recommendedLeaderLabel = formatRecommendedLeaderNames(
    recommendedLeaderNames.map((name) => `${name}님`),
  );
  const leaderCandidateLabel = formatLeaderCandidateNames(
    candidates.map((candidate) => `${candidate.name}님`),
  );

  useEffect(() => {
    if (!messagesQuery.isSuccess) {
      return;
    }

    markAsRead();
  }, [markAsRead, messagesQuery.isSuccess, roomId]);

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

  const submitWillingness = () => {
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

  const openCandidateVote = () => {
    setSelectedCandidateId(
      (currentId) => currentId ?? safeCandidates[0]?.id ?? fallbackCandidate.id,
    );
    setSheetState("candidateVote");
  };

  const finishLeaderVote = () => {
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

  const acceptRecommendedLeader = () => {
    setSelectedCandidateId(recommendedLeader.id);
    setLeaderEvent("elected");
  };

  const requestRevote = () => {
    setLeaderEvent("revote");
    setSelectedCandidateId(recommendedLeader.id);
    setSheetState("closed");
  };

  const startContestVote = () => {
    setIsContestRevoteRequested(false);
    setIsContestVoteSubmitted(false);
    setSelectedContestIds([]);
    setSheetState("contestVote");
  };

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

  const confirmContestAdd = () => {
    const sharedContest = mockRecommendedContests[2];

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

  const submitContestVote = () => {
    if (selectedContestIds.length === 0) {
      return;
    }

    setIsContestResultReady(false);
    setIsContestVoteSubmitted(true);
    setSheetState("contestComplete");
  };

  const showContestVoteResult = () => {
    if (mockContestVoteResult === "tie") {
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

  const submitMidtermCheck = () => {
    setIsMidtermSubmitted(true);
    setDeadlineSubmissionStatus(null);
    setIsDeadlineReminderBannerShown(false);
    setIsMidtermToastShown(true);
  };

  const completeContestSubmission = () => {
    setDeadlineSubmissionStatus("completed");
    setIsDeadlineReminderBannerShown(false);
    setIsMemberReviewStartOpen(true);
  };

  const markContestSubmissionIncomplete = () => {
    setDeadlineSubmissionStatus("incomplete");
    setIsDeadlineReminderBannerShown(false);
  };

  const requestContestSubmissionReminder = () => {
    setDeadlineSubmissionStatus("incomplete");
    setIsDeadlineReminderBannerShown(true);
  };

  const startMemberReview = () => {
    setIsMemberReviewStartOpen(false);
    router.push(`/chat/${roomId}/member-review-preview`);
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
  const selectedContests = mockRecommendedContests.filter((contest) =>
    selectedContestIds.includes(contest.id),
  );
  const candidateContests = mockRecommendedContests.filter((contest) =>
    candidateContestIds.includes(contest.id),
  );
  const sharedContest = mockRecommendedContests[2] ?? mockRecommendedContests[0];
  const winningContest = selectedContests[0] ?? mockRecommendedContests[0];
  const roomTitle = chatMembers
    .filter((member) => !member.isMe && !member.isChatbot)
    .map((member) => member.name)
    .join(", ");

  if (sheetState === "contestList") {
    return (
      <ContestCandidateListPage
        contests={mockRecommendedContests}
        remainingSeconds={candidateRemainingSeconds}
        onBack={() => setSheetState("closed")}
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

      {shouldShowContestVote && isCandidateClosed && !isContestResultShown ? (
        <ContestVoteNoticeBanner
          isVoteSubmitted={isContestVoteSubmitted}
          onAction={isContestVoteSubmitted ? showContestVoteResult : startContestVote}
        />
      ) : null}

      {shouldShowContestVote &&
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
      >
        <ChatbotTextMessage
          body={
            leaderScenario === "singleDefinite"
              ? `안녕하세요. 저는 팀 운영을 도와주는 AI 챗봇이에요. 팀 매칭이 완료되었어요. 이번 팀의 팀장은 ${automaticLeader.name}님입니다. 각자 간단한 자기소개와 인사를 나눠볼까요?`
              : "안녕하세요. 저는 팀 운영을 도와주는 AI 챗봇이에요. 팀 매칭이 완료되었어요. 각자 간단한 자기소개와 인사를 나눠볼까요?"
          }
        />

        {chatbotNotices.map((notice) => (
          <div key={notice.id} className="flex flex-col gap-4">
            <ChatbotSystemNotice action={notice.action} actorName={notice.actorName} />
            {notice.action === "added" ? <ChatbotUsageGuideMessage /> : null}
          </div>
        ))}

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

        {messagesQuery.data?.messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}

        {leaderEvent === "autoLeaderNotice" ? (
          <LeaderNoticeMessage
            body={`${automaticLeader.name}님이 팀장으로 자동 선출되었습니다. 팀장 선출 단계는 건너뛰고 공모전 투표를 진행할게요.`}
            leader={automaticLeader}
          />
        ) : null}

        {leaderEvent === "candidateRegistrationRequest" ? (
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

        {leaderEvent === "voteRequest" || leaderEvent === "revote" ? (
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

        {leaderEvent === "elected" ? <LeaderElectedMessage leader={selectedCandidate} /> : null}

        {leaderEvent === "temporaryLeader" ? (
          <LeaderNoticeMessage
            body={`아직 팀장 후보 지원자가 없어요 :(
원활한 팀 운영을 위해 팀원 중 1명을 임시 팀장으로 무작위 지정했어요. ${fallbackCandidate.name}님이 임시 팀장으로 선정되었습니다. 이후 팀원들과 협의하여 언제든 팀장을
변경할 수 있습니다.
팀장을 변경하게 되면 저에게 꼭 알려주세요! 그래야 새로운 팀장에게도 베네핏을 빠짐없이 드릴 수 있어요. 🎁`}
            leader={fallbackCandidate}
          />
        ) : null}

        {leaderEvent === "tie" ? (
          <LeaderTieMessage
            recommendedLeader={recommendedLeader}
            onAccept={acceptRecommendedLeader}
            onRevote={requestRevote}
          />
        ) : null}

        {shouldShowContestVote ? (
          <>
            <ContestRecommendationMessage
              contests={candidateContests}
              isCandidateClosed={isCandidateClosed}
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

        {shouldShowContestVote && isContestResultShown ? (
          <ContestVoteResultMessage
            contest={winningContest}
            onMidtermSubmit={submitMidtermCheck}
          />
        ) : null}

        {shouldShowContestVote && isContestRevoteRequested ? (
          <BotMessage
            body="동률이 나와서, 동률이 나온 공모전들끼리 재투표를 진행할게요."
            buttonDisabled={false}
            buttonLabel="공모전 투표하기"
            onButtonClick={startContestVote}
          />
        ) : null}

        {shouldShowContestVote && isContestResultShown && isMidtermSubmitted ? (
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
        <ChatInputBar />
      </div>

      {sheetState === "willingness" ||
      sheetState === "candidateVote" ||
      sheetState === "complete" ||
      sheetState === "leaderResult" ? (
        <div className="absolute inset-0 z-40 flex items-end bg-color-gray-850/60">
          {sheetState === "willingness" ? (
            <LeaderWillingnessSheet
              selectedChoice={leaderChoice}
              onSelect={setLeaderChoice}
              onSubmit={submitWillingness}
            />
          ) : null}

          {sheetState === "candidateVote" ? (
            <LeaderCandidateVoteSheet
              candidates={safeCandidates}
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
                hasVotes={mockContestVoteResult !== "noVotes"}
                onShowDetail={showContestVoteDetail}
              />
            ) : null}

            {sheetState === "contestDetail" ? (
              <ContestVoteDetailSheet
                contests={candidateContests}
                onClose={closeContestVoteResult}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {isContestToastShown ? <ContestAddedToast onShortcut={openContestList} /> : null}

      <MemberReviewStartDialog
        completionVariant={isCurrentMemberLeader ? "leader" : "member"}
        member={currentMember}
        onClose={() => setIsMemberReviewStartOpen(false)}
        onStart={startMemberReview}
        open={isMemberReviewStartOpen}
        reviewerName={currentMember.name}
        totalDistance={isCurrentMemberLeader ? 30 : 20}
      />

    </main>
  );
}
