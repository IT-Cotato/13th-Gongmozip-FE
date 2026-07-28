"use client";

import Image from "next/image";
import { type ReactNode, useMemo, useState } from "react";

import { MOCK_CHAT_MEMBERS, type ChatMember } from "../_data/mockMessages";
import { ChatInputBar } from "./ChatInputBar";
import { ChatTopBar } from "./ChatTopBar";

type SheetState = "closed" | "willingness" | "candidateVote" | "complete";
type LeaderChoice = "yes" | "no";
type LeaderScenario =
  | "noPreLeaderOrOnlyFlexible"
  | "preLeaderManyPreferred"
  | "preLeaderFewPreferred";
type LeaderEvent =
  | "willingnessRequest"
  | "voteRequest"
  | "elected"
  | "tie"
  | "revote"
  | "temporaryLeader"
  | "leaderNotice";
type LeaderCandidate = Pick<ChatMember, "avatarSrc" | "avatarTone" | "id" | "isMe" | "name">;

const fallbackCandidate = MOCK_CHAT_MEMBERS[0];
const recommendedCandidateIds = new Set(["minjeong", "haeeun"]);
const preferredLeaderIds = ["minjeong", "haeeun"];
// TODO: 팀원 매칭 결과에서 백엔드가 내려주는 사전 팀장 여부/팀장 선호 분포 값으로 교체한다.
const mockLeaderScenario: LeaderScenario = "noPreLeaderOrOnlyFlexible";
const mockAllMembersDeclinedLeader = false;
const recommendedLeaderNames = MOCK_CHAT_MEMBERS.filter((member) =>
  recommendedCandidateIds.has(member.id),
).map((member) => member.name);

const avatarToneClass: Record<ChatMember["avatarTone"], string> = {
  robot: "bg-color-blue-50",
  green: "bg-color-green-100",
  blue: "bg-color-blue-50",
  coral: "bg-color-coral-100",
};

function getInitialLeaderEvent(scenario: LeaderScenario): LeaderEvent {
  if (scenario === "noPreLeaderOrOnlyFlexible") {
    return "willingnessRequest";
  }

  if (scenario === "preLeaderManyPreferred") {
    return "voteRequest";
  }

  return "leaderNotice";
}

function formatRecommendedLeaderNames(names: string[]) {
  if (names.length === 0) {
    return "추천 후보";
  }

  if (names.length === 1) {
    return names[0];
  }

  return `${names.slice(0, -1).join(", ")} 혹은 ${names.at(-1)}`;
}

export function LeaderElectionFlow({ roomId }: { roomId: string }) {
  const [sheetState, setSheetState] = useState<SheetState>("closed");
  const [leaderChoice, setLeaderChoice] = useState<LeaderChoice>("no");
  const [leaderEvent, setLeaderEvent] = useState<LeaderEvent>(() =>
    getInitialLeaderEvent(mockLeaderScenario),
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const candidates = useMemo(
    () =>
      MOCK_CHAT_MEMBERS.filter((member) => {
        if (mockLeaderScenario === "noPreLeaderOrOnlyFlexible") {
          if (member.isMe) {
            return leaderChoice === "yes";
          }

          return recommendedCandidateIds.has(member.id);
        }

        return preferredLeaderIds.includes(member.id);
      }),
    [leaderChoice],
  );

  const safeCandidates = candidates.length > 0 ? candidates : [fallbackCandidate];
  const selectedCandidate =
    safeCandidates.find((candidate) => candidate.id === selectedCandidateId) ?? safeCandidates[0];
  const recommendedLeader = safeCandidates[0] ?? fallbackCandidate;
  const recommendedLeaders = MOCK_CHAT_MEMBERS.filter((member) =>
    recommendedCandidateIds.has(member.id),
  );
  const noticeLeader = preferredLeaderIds
    .map((id) => MOCK_CHAT_MEMBERS.find((member) => member.id === id))
    .find(Boolean) ?? fallbackCandidate;

  const submitWillingness = () => {
    if (mockAllMembersDeclinedLeader) {
      setSelectedCandidateId(fallbackCandidate.id);
      setLeaderEvent("temporaryLeader");
      setSheetState("closed");
      return;
    }

    setSelectedCandidateId((safeCandidates[0] ?? fallbackCandidate).id);
    setLeaderEvent("voteRequest");
    setSheetState("closed");
  };

  const openCandidateVote = () => {
    setSelectedCandidateId((currentId) => currentId ?? safeCandidates[0]?.id ?? fallbackCandidate.id);
    setSheetState("candidateVote");
  };

  const finishLeaderVote = () => {
    setSheetState("complete");
  };

  const showVoteResult = () => {
    setSheetState("closed");
    setLeaderEvent(safeCandidates.length >= 3 ? "tie" : "elected");
  };

  const acceptRecommendedLeader = () => {
    setSelectedCandidateId(recommendedLeader.id);
    setLeaderEvent("elected");
  };

  const requestRevote = () => {
    setLeaderEvent("revote");
    setSelectedCandidateId(recommendedLeader.id);
    setSheetState("candidateVote");
  };

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white pt-[env(safe-area-inset-top)] text-color-gray-850">
      <ChatTopBar roomId={roomId} />

      <section
        aria-label="팀장 선출 채팅"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pt-[29px] pb-6"
      >
        <ChatbotTextMessage body="안녕하세요. 저는 팀 운영을 도와주는 AI 챗봇이에요. 팀 매칭이 완료되었어요. 각자 간단한 자기소개와 인사를 나눠볼까요?" />

        {leaderEvent === "willingnessRequest" ? (
          <BotMessage
            body={`이제, 팀장을 선출해볼게요.
매칭 전에 팀장을 지원해주신 분이 없으셔서 사용자 프로필 및 협업 유형 검사
결과 ${formatRecommendedLeaderNames(recommendedLeaderNames)}님이 리더를 잘하실 수 있을 거라 추천드립니다.
다른 분들도 모두 리더를 하기 충분한
자질을 가지신 분들이니, 팀장 여부를
모두 투표해주세요.`}
            buttonDisabled={false}
            buttonLabel="팀장 여부 투표하기"
            onButtonClick={() => setSheetState("willingness")}
          >
            <LeaderCandidatePreviewCard leaders={recommendedLeaders} />
          </BotMessage>
        ) : null}

        {leaderEvent === "voteRequest" || leaderEvent === "revote" ? (
          <BotMessage
            body={
              leaderEvent === "revote"
                ? "팀원들의 의견에 따라 재투표를 진행합니다. 팀장을 다시 선출해 주세요."
                : `이제, 팀장을 선출해볼게요.
매칭 전에 팀장에 지원해주신 김민정님과
이해은님이 팀장 후보입니다. 팀장
지원자 분들은 되도록이면 프로필을
공개로 돌려, 팀원들이 볼 수 있도록
해주세요.`
            }
            buttonDisabled={false}
            buttonLabel="팀장 투표하기"
            onButtonClick={openCandidateVote}
          />
        ) : null}

        {leaderEvent === "elected" ? (
          <LeaderElectedMessage leader={selectedCandidate} />
        ) : null}

        {leaderEvent === "temporaryLeader" ? (
          <LeaderNoticeMessage
            body={`아직 팀장 후보 지원자가 없어요 :(
원활한 팀 운영을 위해 팀원 중 1명을 임시 팀장으로 무작위 지정했어요. ${fallbackCandidate.name}님이 임시 팀장으로 선정되었습니다. 이후 팀원들과 협의하여 언제든 팀장을
변경할 수 있습니다.
팀장을 변경하게 되면 저에게 꼭 알려주세요! 그래야 새로운 팀장에게도 베네핏을 빠짐없이 드릴 수 있어요. 🎁`}
            leader={fallbackCandidate}
          />
        ) : null}

        {leaderEvent === "leaderNotice" ? (
          <LeaderNoticeMessage
            body={`팀장 투표 과정 없이 ${noticeLeader.name}님이 팀장으로 안내됩니다. 이후 공모전 투표를 진행할게요.`}
            leader={noticeLeader}
          />
        ) : null}

        {leaderEvent === "tie" ? (
          <LeaderTieMessage
            recommendedLeader={recommendedLeader}
            onAccept={acceptRecommendedLeader}
            onRevote={requestRevote}
          />
        ) : null}
      </section>

      <div className="flex flex-col gap-px bg-white pb-[env(safe-area-inset-bottom)]">
        <ChatInputBar />
      </div>

      {sheetState !== "closed" ? (
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
            <VoteCompleteSheet onShowResult={showVoteResult} />
          ) : null}
        </div>
      ) : null}
    </main>
  );
}

function ChatbotTextMessage({ body }: { body: string }) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {body}
          </p>
          <MessageMeta />
        </div>
      </div>
    </article>
  );
}

function BotMessage({
  body,
  buttonDisabled = false,
  buttonLabel,
  children,
  onButtonClick,
}: {
  body: string;
  buttonDisabled?: boolean;
  buttonLabel: string;
  children?: ReactNode;
  onButtonClick: () => void;
}) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {body}
          </p>
          <MessageMeta />
        </div>
        {children}
        <button
          className={`mt-1 flex h-9 w-[230px] items-center justify-center rounded-[10px] px-2 text-[13px] leading-[1.25] font-semibold ${
            buttonDisabled
              ? "bg-color-gray-200 text-color-gray-350"
              : "bg-color-coral-500 text-white"
          }`}
          disabled={buttonDisabled}
          onClick={onButtonClick}
          type="button"
        >
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}

function LeaderCandidatePreviewCard({ leaders }: { leaders: LeaderCandidate[] }) {
  return (
    <div className="mt-1 flex h-[170px] w-[230px] flex-col items-center rounded-[8px] border border-color-gray-200 bg-white px-5 pt-5">
      <div className="flex items-center gap-1 text-[13px] leading-[1.35] font-bold text-color-coral-500">
        <Image src="/icons/chat/medal.svg" alt="" width={18} height={18} />
        <span>팀장 후보</span>
      </div>

      <div className="mt-6 flex w-full items-start justify-center gap-[34px]">
        {leaders.map((leader) => (
          <LeaderCandidatePreviewProfile key={leader.id} leader={leader} />
        ))}
      </div>
    </div>
  );
}

function LeaderCandidatePreviewProfile({ leader }: { leader: LeaderCandidate }) {
  return (
    <div className="flex w-[64px] flex-col items-center gap-3">
      <MemberAvatar member={leader} sizeClassName="size-[60px]" />
      <span className="max-w-[64px] rounded-full bg-color-gray-200 px-2 py-1 text-center text-[12px] leading-[1.25] font-semibold text-color-gray-650">
        {leader.name}
      </span>
    </div>
  );
}

function LeaderNoticeMessage({ body, leader }: { body: string; leader: LeaderCandidate }) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {body}
          </p>
          <MessageMeta />
        </div>
        <LeaderProfileCard leader={leader} />
      </div>
    </article>
  );
}

function LeaderElectedMessage({ leader }: { leader: LeaderCandidate }) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="max-w-[230px] rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            투표 결과, {leader.name}님이 이번 공모전 출품의 팀장으로 선출되셨습니다.
            이제 팀원들과 함께 공모전 준비를 시작해 보세요.
          </p>
          <MessageMeta />
        </div>
        <LeaderProfileCard leader={leader} />
      </div>
    </article>
  );
}

function LeaderTieMessage({
  onAccept,
  onRevote,
  recommendedLeader,
}: {
  onAccept: () => void;
  onRevote: () => void;
  recommendedLeader: LeaderCandidate;
}) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {`투표 결과 동률이 발생했습니다.
팀의 시너지를 고려한 분석 결과, ${recommendedLeader.name}님을 팀장으로 추천합니다.
팀원들의 성향과 역할 조합을 바탕으로 가장 높은 협업 시너지가
기대됩니다. 추천을 수락하시나요?`}
          </p>
          <MessageMeta />
        </div>
        <div className="mt-1 flex h-9 w-[230px] gap-2">
          <button
            className="flex flex-1 items-center justify-center rounded-[10px] bg-color-gray-650 px-3 text-[13px] leading-[1.25] font-semibold text-white"
            onClick={onRevote}
            type="button"
          >
            재투표하기
          </button>
          <button
            className="flex flex-1 items-center justify-center rounded-[10px] bg-color-coral-500 px-3 text-[13px] leading-[1.25] font-semibold text-white"
            onClick={onAccept}
            type="button"
          >
            추천 수락
          </button>
        </div>
      </div>
    </article>
  );
}

function LeaderProfileCard({ leader }: { leader: LeaderCandidate }) {
  return (
    <button
      className="mt-1 flex h-[68px] w-[220px] items-center gap-4 rounded-[14px] bg-color-orange-50 p-2 text-left"
      type="button"
    >
      <span className="relative flex w-[66px] shrink-0 items-start">
        <span className="relative z-10 mr-[-16px] flex size-[31px] items-center justify-center">
          <Image src="/icons/chat/medal.svg" alt="" width={31} height={31} />
        </span>
        <MemberAvatar member={leader} sizeClassName="size-[52px]" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] leading-[1.25] font-semibold text-color-coral-500">
        {leader.name}
      </span>
      <span className="text-[20px] leading-none text-color-coral-500" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

function LeaderWillingnessSheet({
  onSelect,
  onSubmit,
  selectedChoice,
}: {
  onSelect: (choice: LeaderChoice) => void;
  onSubmit: () => void;
  selectedChoice: LeaderChoice;
}) {
  return (
    <BottomSheet className="min-h-[288px]">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <MedalIcon size="small" />
          <h2 className="text-[20px] leading-[1.35] font-bold text-color-gray-850">
            팀장 여부 투표
          </h2>
        </div>
        <CountdownPill label="공모전 마감까지" time="03 : 00 : 00" />
      </div>

      <div className="mt-4 flex h-[60px] gap-2 px-4">
        <ChoiceButton
          isSelected={selectedChoice === "yes"}
          label="팀장 할래요"
          onClick={() => onSelect("yes")}
        />
        <ChoiceButton
          isSelected={selectedChoice === "no"}
          label="팀장 안할래요"
          onClick={() => onSelect("no")}
        />
      </div>

      <SheetButton label="제출하기" onClick={onSubmit} tone="brand" />
    </BottomSheet>
  );
}

function LeaderCandidateVoteSheet({
  candidates,
  onSelect,
  onSubmit,
  selectedCandidateId,
}: {
  candidates: LeaderCandidate[];
  onSelect: (candidateId: string) => void;
  onSubmit: () => void;
  selectedCandidateId: string;
}) {
  return (
    <BottomSheet className="min-h-[388px]">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <MedalIcon size="small" />
          <h2 className="text-[20px] leading-[1.35] font-bold text-color-gray-850">팀장 투표</h2>
        </div>
        <CountdownPill label="투표 마감까지" time="01 : 24 : 30" />
      </div>

      <p className="mt-2 px-6 text-[13px] leading-[1.35] text-color-gray-650">
        팀장이 되면 좋을 것 같은 팀원에게 투표해보세요!
      </p>

      <div
        className="mt-8 flex flex-wrap items-center justify-center gap-8 px-4"
        role="radiogroup"
        aria-label="팀장 후보"
      >
        {candidates.map((candidate) => (
          <CandidateProfileCard
            candidate={candidate}
            isSelected={candidate.id === selectedCandidateId}
            key={candidate.id}
            onSelect={() => onSelect(candidate.id)}
          />
        ))}
      </div>

      <SheetButton label="투표하기" onClick={onSubmit} tone="brand" />
    </BottomSheet>
  );
}

function CandidateProfileCard({
  candidate,
  isSelected,
  onSelect,
}: {
  candidate: LeaderCandidate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-checked={isSelected}
      className={`flex size-[100px] shrink-0 flex-col items-center justify-center gap-2.5 rounded-[16px] px-[22px] pb-1.5 pt-3 ${
        isSelected
          ? "bg-[linear-gradient(45deg,#FF7658_0%,#FFAD62_100%)] text-white"
          : "border border-[rgba(97,97,97,0.16)] bg-white text-color-gray-650"
      }`}
      onClick={onSelect}
      role="radio"
      type="button"
    >
      <MemberAvatar member={candidate} sizeClassName="size-11" />
      <span className="max-w-[72px] truncate text-[20px] leading-[1.35] font-bold">
        {candidate.name}
      </span>
    </button>
  );
}

function VoteCompleteSheet({ onShowResult }: { onShowResult: () => void }) {
  return (
    <BottomSheet className="h-[475px] justify-between">
      <div className="flex flex-1 flex-col items-center justify-center">
        <MedalIcon size="large" />
        <h2 className="mt-2 text-center text-[26px] leading-[1.35] font-bold text-color-gray-850">
          투표 완료
        </h2>
        <p className="mt-2 text-center text-[13px] leading-[1.25] font-medium text-color-gray-650/60">
          투표 결과를 확인하고 있습니다.
        </p>
        <CountdownPill className="mt-3" label="투표 마감까지" time="01 : 24 : 30" />
      </div>

      <SheetButton label="결과 확인하기" onClick={onShowResult} tone="disabled" />
    </BottomSheet>
  );
}

function BottomSheet({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex w-full flex-col rounded-t-[16px] bg-white ${className}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex h-11 items-center justify-center pb-6 pt-4">
        <span className="h-1 w-12 rounded-full bg-[rgba(97,97,97,0.22)]" />
      </div>
      {children}
      <div className="h-[34px] shrink-0 bg-white">
        <div className="mx-auto mt-[21px] h-[5px] w-[134px] rounded-full bg-black" />
      </div>
    </section>
  );
}

function ChoiceButton({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-full flex-1 items-center justify-center rounded-[14px] text-[15px] leading-[1.25] font-semibold ${
        isSelected
          ? "border border-color-gray-650 bg-color-gray-650 text-white"
          : "border border-[rgba(97,97,97,0.50)] bg-white text-color-gray-650"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function SheetButton({
  label,
  onClick,
  tone,
}: {
  label: string;
  onClick: () => void;
  tone: "brand" | "disabled" | "neutral";
}) {
  const toneClass = {
    brand: "bg-color-coral-500 text-white",
    disabled: "bg-color-gray-200 text-color-gray-350",
    neutral: "bg-[rgba(97,97,97,0.10)] text-color-gray-650",
  }[tone];

  return (
    <div className="mt-4 bg-gradient-to-t from-white from-[38%] to-white/0 p-4">
      <button
        className={`flex h-[51px] w-full items-center justify-center rounded-[14px] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold ${toneClass}`}
        onClick={onClick}
        type="button"
      >
        {label}
      </button>
    </div>
  );
}

function CountdownPill({
  className = "",
  label,
  time,
}: {
  className?: string;
  label: string;
  time: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl bg-color-gray-150 px-2 py-1 text-center text-[12px] leading-[1.35] font-semibold text-color-gray-650 ${className}`}
    >
      {label}
      <span className="ml-1">{time}</span>
    </span>
  );
}

function MedalIcon({ size }: { size: "small" | "large" }) {
  const className = size === "small" ? "size-[37px]" : "size-[62px]";
  const imageSize = size === "small" ? 37 : 62;

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-color-coral-50 ${className}`}
    >
      <Image src="/icons/chat/medal.svg" alt="" width={imageSize} height={imageSize} />
    </span>
  );
}

function ChatbotAvatar() {
  return (
    <div className="relative mt-0.5 size-[46px] shrink-0 overflow-hidden rounded-full border-2 border-white bg-color-blue-50">
      <Image src="/icons/chat/chat_bot.svg" alt="" fill sizes="46px" className="object-cover" />
    </div>
  );
}

function MemberAvatar({
  member,
  sizeClassName,
}: {
  member: LeaderCandidate;
  sizeClassName: string;
}) {
  return (
    <span
      className={`relative shrink-0 overflow-hidden rounded-full border-2 border-white ${avatarToneClass[member.avatarTone]} ${sizeClassName}`}
    >
      {member.avatarSrc ? (
        <Image src={member.avatarSrc} alt="" fill sizes="122px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[17px] font-semibold text-color-gray-750">
          {member.name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}

function MessageMeta() {
  return (
    <span className="flex shrink-0 items-end gap-2 text-[12px] leading-[1.35]">
      <span className="text-color-gray-650">오후 8:28</span>
      <span className="text-color-coral-500">1</span>
    </span>
  );
}
