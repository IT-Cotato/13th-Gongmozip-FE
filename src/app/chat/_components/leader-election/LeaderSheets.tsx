import type { ReactNode } from "react";

import { MedalIcon, MemberAvatar } from "./LeaderCards";
import type { LeaderCandidate, LeaderChoice } from "./types";

export function LeaderWillingnessSheet({
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

export function LeaderCandidateVoteSheet({
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

export function VoteCompleteSheet({
  isResultReady,
  onShowResult,
}: {
  isResultReady: boolean;
  onShowResult: () => void;
}) {
  return (
    <BottomSheet className="h-[475px] justify-between">
      <div className="flex flex-1 flex-col items-center justify-center">
        <MedalIcon size="large" />
        <h2 className="mt-2 text-center text-[26px] leading-[1.35] font-bold text-color-gray-850">
          투표 완료
        </h2>
        <p className="mt-2 text-center text-[13px] leading-[1.25] font-medium text-color-gray-650/60">
          {isResultReady ? "투표 결과를 확인할 수 있습니다." : "투표 결과를 확인하고 있습니다."}
        </p>
        <CountdownPill className="mt-3" label="투표 마감까지" time="01 : 24 : 30" />
      </div>

      <SheetButton
        disabled={!isResultReady}
        label="결과 확인하기"
        onClick={onShowResult}
        tone={isResultReady ? "brand" : "disabled"}
      />
    </BottomSheet>
  );
}

export function LeaderVoteResultSheet({
  leader,
  onDone,
}: {
  leader: LeaderCandidate;
  onDone: () => void;
}) {
  return (
    <BottomSheet className="min-h-[436px]">
      <div className="flex flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <MedalIcon size="small" />
            <h2 className="text-[20px] leading-[1.35] font-bold text-color-gray-850">
              팀장 투표 결과
            </h2>
          </div>
          <p className="px-2 text-[13px] leading-[1.5] text-color-gray-850">
            <span className="font-semibold text-[#AC4A35]">{leader.name} 님</span>이 팀장으로
            확정되었습니다! 🎉
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <MemberAvatar member={leader} sizeClassName="size-[122px]" />
          <span className="rounded-full bg-color-coral-500 px-3 py-2 text-[15px] leading-[1.25] font-semibold text-white">
            {leader.name}
          </span>
        </div>
      </div>

      <SheetButton label="완료" onClick={onDone} tone="neutral" />
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

function BottomSheet({ children, className = "" }: { children: ReactNode; className?: string }) {
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
  disabled = false,
  label,
  onClick,
  tone,
}: {
  disabled?: boolean;
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
        className={`flex h-[51px] w-full items-center justify-center rounded-[14px] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold ${toneClass} disabled:cursor-not-allowed`}
        disabled={disabled}
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
