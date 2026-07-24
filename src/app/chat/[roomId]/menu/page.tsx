"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { ChevronLeftIcon } from "../../_components/icons";
import {
  CHAT_MEMBER_COUNT,
  CHAT_ROOM_TITLE,
  MOCK_CHATBOT_MEMBER,
  MOCK_CHAT_MEMBERS,
  type ChatMember,
} from "../../_data/mockMessages";

const memberNameClass = "text-[15px] leading-[1.25] font-semibold text-color-gray-850";
const reportReasons = ["무임승차", "잠수, 연락두절", "욕설, 비하발언", "스팸", "허위 프로필", "기타(직접 입력)"];

const avatarToneClass: Record<ChatMember["avatarTone"], string> = {
  robot: "bg-color-blue-50",
  green: "bg-color-green-100",
  blue: "bg-color-blue-50",
  coral: "bg-color-coral-100",
};

export default function ChatRoomMenuPage() {
  const params = useParams<{ roomId: string }>();
  const [isChatbotEnabled, setIsChatbotEnabled] = useState(true);
  const [reportedMemberIds, setReportedMemberIds] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<ChatMember | null>(null);
  const [reportTarget, setReportTarget] = useState<ChatMember | null>(null);

  const submitReport = (memberId: string) => {
    setReportedMemberIds((currentIds) =>
      currentIds.includes(memberId) ? currentIds : [...currentIds, memberId],
    );
    setReportTarget(null);
  };

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white pt-[env(safe-area-inset-top)]">
      <header className="shrink-0 border-b border-[rgba(97,97,97,0.08)] bg-white">
        <div className="relative flex h-[46px] items-center justify-center px-4">
          <Link
            href={`/chat/${params.roomId}`}
            aria-label="뒤로가기"
            className="absolute left-4 flex size-[38px] items-center justify-center rounded-[14px] text-color-gray-850"
          >
            <ChevronLeftIcon />
          </Link>
          <h1 className="flex max-w-[250px] items-center justify-center gap-2 truncate text-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
            <span className="truncate">{CHAT_ROOM_TITLE}</span>
            <span className="shrink-0">{CHAT_MEMBER_COUNT}</span>
          </h1>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto px-4 pt-4 pb-[120px]" aria-label="채팅방 메뉴">
        <h2 className="flex items-center gap-2 text-[15px] leading-[1.25] font-bold text-color-gray-850">
          <span>대화상대</span>
          <span>{CHAT_MEMBER_COUNT}</span>
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          {MOCK_CHAT_MEMBERS.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isReported={reportedMemberIds.includes(member.id)}
              onOpenProfile={() => setSelectedMember(member)}
              onOpenReport={() => setReportTarget(member)}
            />
          ))}

          <ChatbotRow
            isEnabled={isChatbotEnabled}
            onToggle={() => setIsChatbotEnabled((currentValue) => !currentValue)}
          />
        </div>
      </section>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex flex-col bg-gradient-to-t from-white via-white to-white/0 px-4 pt-8 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Link
          href="/chat"
          className="pointer-events-auto flex h-[51px] w-full items-center justify-center rounded-[14px] bg-color-coral-500 px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
        >
          채팅방 나가기
        </Link>
      </div>

      {selectedMember && (
        <ProfileSheet member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      {reportTarget && (
        <ReportDialog
          member={reportTarget}
          onClose={() => setReportTarget(null)}
          onSubmit={() => submitReport(reportTarget.id)}
        />
      )}
    </main>
  );
}

function MemberRow({
  member,
  isReported,
  onOpenProfile,
  onOpenReport,
}: {
  member: ChatMember;
  isReported: boolean;
  onOpenProfile: () => void;
  onOpenReport: () => void;
}) {
  return (
    <div className="flex h-[83px] items-center justify-between bg-white py-2">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={onOpenProfile}
      >
        <MenuAvatar member={member} />
        <span className={memberNameClass}>{member.isMe ? `(나)${member.name}` : member.name}</span>
      </button>

      {!member.isMe && (
        <button
          type="button"
          className={`flex h-[67px] w-12 shrink-0 flex-col items-center justify-center gap-1 rounded-[16px] ${
            isReported ? "text-color-coral-700" : "text-color-gray-650"
          }`}
          aria-pressed={isReported}
          onClick={onOpenReport}
        >
          <span className="flex size-5 items-center justify-center rounded-[7px] bg-[#BB5260] text-[15px] leading-none font-bold text-white">
            !
          </span>
          <span className="text-center text-[9px] leading-[1.35]">
            {isReported ? "신고됨" : "사용자 신고"}
          </span>
        </button>
      )}
    </div>
  );
}

function ReportDialog({
  member,
  onClose,
  onSubmit,
}: {
  member: ChatMember;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-color-gray-850/60 p-2.5">
      <section
        aria-label={`${member.name} 신고`}
        className="relative flex max-h-[400px] w-[326px] flex-col items-center rounded-[16px] bg-white px-4 pt-2 pb-4 shadow-[0_53px_15px_rgba(0,0,0,0),0_34px_14px_rgba(0,0,0,0.01),0_19px_12px_rgba(0,0,0,0.05),0_9px_9px_rgba(0,0,0,0.09),0_2px_5px_rgba(0,0,0,0.1)]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex w-full flex-col gap-8 px-1 py-4">
          <h2 className="whitespace-pre-wrap text-[20px] leading-[1.35] font-medium text-color-gray-850">
            {"해당 사용자를 신고하는 이유를\n가장 잘 설명하는 옵션을\n선택해주세요."}
          </h2>

          <div className="relative flex w-full flex-col gap-1">
            <label className="flex px-1 text-[17px] leading-[1.25] font-medium">
              <span className="text-color-gray-850">신고 사유</span>
              <span className="text-color-coral-500">*</span>
            </label>
            <button
              type="button"
              className="flex h-11 w-full items-center rounded-[12px] border border-[rgba(97,97,97,0.08)] bg-white/10 px-5 py-3 text-left"
              onClick={() => setIsReasonOpen((currentValue) => !currentValue)}
              aria-expanded={isReasonOpen}
            >
              <span
                className={`min-w-0 flex-1 truncate text-[13px] leading-[1.5] ${
                  selectedReason ? "text-color-gray-850" : "text-color-gray-500"
                }`}
              >
                {selectedReason ?? "신고 사유를 선택해주세요."}
              </span>
              <ChevronDownIcon isOpen={isReasonOpen} />
            </button>

            {isReasonOpen && (
              <div className="absolute top-[73px] left-0 z-10 flex max-h-[289px] w-full rounded-[12px] bg-white px-5 py-2 shadow-[0_16px_4px_rgba(0,0,0,0),0_10px_4px_rgba(0,0,0,0.01),0_6px_3px_rgba(0,0,0,0.05),0_3px_3px_rgba(0,0,0,0.09),0_1px_1px_rgba(0,0,0,0.1)]">
                <div className="flex w-full flex-col">
                  {reportReasons.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      className={`w-full py-2 text-left text-[17px] leading-[1.5] ${
                        selectedReason === reason
                          ? "font-semibold text-color-coral-700"
                          : "font-medium text-color-gray-650"
                      }`}
                      onClick={() => {
                        setSelectedReason(reason);
                        setIsReasonOpen(false);
                      }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex h-[60px] w-full gap-2 px-2 py-1">
          <button
            type="button"
            className="flex h-full flex-1 items-center justify-center rounded-[12px] border border-[rgba(97,97,97,0.5)] p-2 text-[15px] leading-[1.25] font-semibold text-color-gray-650"
            onClick={onClose}
          >
            나가기
          </button>
          <button
            type="button"
            className="flex h-full flex-1 items-center justify-center rounded-[14px] bg-color-coral-500 px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
            onClick={onSubmit}
          >
            제출
          </button>
        </div>
      </section>
    </div>
  );
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatbotRow({
  isEnabled,
  onToggle,
}: {
  isEnabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-1 flex h-[76px] items-center justify-between rounded-[16px] bg-color-gray-150 px-4 py-2">
      <div className="flex min-w-0 items-center gap-4">
        <MenuAvatar member={MOCK_CHATBOT_MEMBER} sizeClassName="size-[60px]" />
        <span className={memberNameClass}>챗봇</span>
      </div>
      <button
        type="button"
        className={`flex h-7 shrink-0 items-center justify-center rounded-[10px] px-4 text-[13px] leading-[1.25] font-semibold text-white ${
          isEnabled ? "bg-color-gray-650" : "bg-color-coral-500"
        }`}
        onClick={onToggle}
      >
        {isEnabled ? "삭제" : "추가"}
      </button>
    </div>
  );
}

function MenuAvatar({
  member,
  sizeClassName = "size-[67px]",
}: {
  member: ChatMember;
  sizeClassName?: string;
}) {
  const initials = member.isChatbot ? "AI" : member.name.slice(0, 1);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white ${avatarToneClass[member.avatarTone]} ${sizeClassName}`}
    >
      {member.avatarSrc ? (
        <Image src={member.avatarSrc} alt="" fill sizes="67px" className="object-cover" />
      ) : member.isChatbot ? (
        <div className="flex h-[34px] w-[38px] items-center justify-center rounded-[10px] border border-color-blue-200 bg-color-gray-850 text-[9px] font-semibold text-white">
          {initials}
        </div>
      ) : (
        <span className="flex size-[46px] items-center justify-center rounded-full bg-white/60 text-[18px] font-semibold text-color-gray-750">
          {initials}
        </span>
      )}
    </div>
  );
}

function ProfileSheet({ member, onClose }: { member: ChatMember; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex items-end bg-color-gray-850/60" role="presentation">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="닫기" onClick={onClose} />
      <section
        className="relative z-10 w-full rounded-t-[16px] bg-white px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        aria-label={`${member.name} 프로필`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <MenuAvatar member={member} sizeClassName="size-[60px]" />
            <div className="min-w-0">
              <h2 className="truncate text-[20px] leading-[1.35] font-medium text-color-gray-850">
                {member.isMe ? `(나)${member.name}` : member.name}
              </h2>
              <p className="mt-1 text-[13px] leading-[1.5] text-color-gray-650">
                {[member.school, member.major, member.grade].filter(Boolean).join(" · ") || "AI 팀 도우미"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-8 shrink-0 items-center justify-center rounded-[12px] px-2 text-[15px] leading-[1.25] font-semibold text-color-gray-650"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <p className="mt-5 rounded-[12px] bg-color-gray-150 px-4 py-3 text-[13px] leading-[1.5] text-color-gray-850">
          {member.introduction}
        </p>

        {member.strengths && (
          <div className="mt-4 flex flex-wrap gap-2">
            {member.strengths.map((strength) => (
              <span
                key={strength}
                className="rounded-full bg-color-coral-50 px-3 py-1.5 text-[13px] leading-[1.25] font-medium text-color-coral-700"
              >
                {strength}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
