import Image from "next/image";

import type { ChatMember } from "../../_data/chatTypes";
import { ChatbotAvatar, MessageMeta } from "./ChatbotMessage";
import type { LeaderCandidate } from "./types";

const avatarToneClass: Record<ChatMember["avatarTone"], string> = {
  robot: "bg-color-blue-50",
  green: "bg-color-green-100",
  blue: "bg-color-blue-50",
  coral: "bg-color-coral-100",
};
const LEADER_PROFILE_CARD_WIDTH = 210;

export function LeaderCandidatePreviewCard({
  leaders,
  title = "팀장 후보",
}: {
  leaders: LeaderCandidate[];
  title?: string;
}) {
  return (
    <div className="mt-1 flex min-h-[170px] w-full max-w-[230px] flex-col items-center rounded-[8px] border border-color-gray-200 bg-white px-5 py-5">
      <div className="flex items-center gap-1 text-[13px] leading-[1.35] font-bold text-color-coral-500">
        <Image src="/icons/chat/medal.svg" alt="" width={18} height={18} />
        <span>{title}</span>
      </div>

      <div className="mt-6 grid w-full grid-cols-2 justify-items-center gap-x-[34px] gap-y-5">
        {leaders.map((leader, index) => (
          <LeaderCandidatePreviewProfile
            className={leaders.length % 2 === 1 && index === leaders.length - 1 ? "col-span-2" : ""}
            key={leader.id}
            leader={leader}
          />
        ))}
      </div>
    </div>
  );
}

function LeaderCandidatePreviewProfile({
  className = "",
  leader,
}: {
  className?: string;
  leader: LeaderCandidate;
}) {
  return (
    <div className={`flex w-[64px] flex-col items-center gap-3 ${className}`}>
      <MemberAvatar member={leader} sizeClassName="size-[60px]" />
      <span className="max-w-[64px] rounded-full bg-color-gray-200 px-2 py-1 text-center text-[12px] leading-[1.25] font-semibold text-color-gray-650">
        {leader.name}
      </span>
    </div>
  );
}

export function LeaderNoticeMessage({
  body,
  leader,
  onOpenProfile,
  sentAt,
}: {
  body: string;
  leader: LeaderCandidate;
  onOpenProfile?: () => void;
  sentAt?: string;
}) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {body}
          </p>
          <MessageMeta sentAt={sentAt} />
        </div>
        <LeaderProfileCard leader={leader} onOpenProfile={onOpenProfile} />
      </div>
    </article>
  );
}

export function LeaderElectedMessage({
  body,
  leader,
  onOpenProfile,
  sentAt,
}: {
  body?: string;
  leader: LeaderCandidate;
  onOpenProfile?: () => void;
  sentAt?: string;
}) {
  const message =
    body?.trim() || `${leader.name}님이 팀장으로 확정되었습니다. 이제 공모전을 골라볼까요?`;

  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {message}
          </p>
          <MessageMeta sentAt={sentAt} />
        </div>
        <LeaderProfileCard leader={leader} onOpenProfile={onOpenProfile} />
      </div>
    </article>
  );
}

export function LeaderTieMessage({
  onAccept,
  onOpenProfile,
  onRevote,
  recommendationReason,
  recommendedLeader,
  sentAt,
}: {
  onAccept: () => void;
  onOpenProfile?: () => void;
  onRevote: () => void;
  recommendationReason?: string | null;
  recommendedLeader: LeaderCandidate;
  sentAt?: string;
}) {
  const reason =
    recommendationReason ??
    `팀의 시너지를 고려한 분석 결과, ${recommendedLeader.name}님을 팀장으로 추천합니다.
팀원들의 성향과 역할 조합을 바탕으로 가장 높은 협업 시너지가
기대됩니다.`;

  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {`투표 결과 동률이 발생했습니다.
${reason} 추천을 수락하시겠어요?`}
          </p>
          <MessageMeta sentAt={sentAt} />
        </div>
        <LeaderProfileCard leader={recommendedLeader} onOpenProfile={onOpenProfile} />
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

export function LeaderProfileCard({
  leader,
  onOpenProfile,
}: {
  leader: LeaderCandidate;
  onOpenProfile?: () => void;
}) {
  const leaderName = leader.name.trim() || "팀장";

  return (
    <button
      className="mt-1 flex h-[68px] w-[210px] shrink-0 items-center gap-4 overflow-hidden rounded-[14px] bg-color-orange-50 p-2 text-left disabled:cursor-default"
      disabled={!onOpenProfile}
      onClick={onOpenProfile}
      style={{ width: LEADER_PROFILE_CARD_WIDTH }}
      type="button"
    >
      <span className="relative flex w-[66px] shrink-0 items-start">
        <span className="relative z-10 mr-[-16px] flex size-[31px] items-center justify-center">
          <Image src="/icons/chat/medal.svg" alt="" width={31} height={31} />
        </span>
        <MemberAvatar member={leader} sizeClassName="size-[52px]" />
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-between">
        <span className="min-w-0 truncate text-[13px] leading-[1.25] font-semibold text-color-coral-500">
          {leaderName}
        </span>
        <span className="flex size-8 shrink-0 items-center justify-center text-color-coral-500" aria-hidden="true">
          <span
            className="block size-4 bg-current"
            style={{
              mask: "url('/icons/common/tabler_chevron-right.svg') center / contain no-repeat",
              WebkitMask: "url('/icons/common/tabler_chevron-right.svg') center / contain no-repeat",
            }}
          />
        </span>
      </span>
    </button>
  );
}

export function MemberAvatar({
  member,
  sizeClassName,
}: {
  member: LeaderCandidate;
  sizeClassName: string;
}) {
  const memberName = member.name.trim() || "팀장";

  return (
    <span
      className={`relative shrink-0 overflow-hidden rounded-full border-2 border-white ${avatarToneClass[member.avatarTone]} ${sizeClassName}`}
    >
      {member.avatarSrc ? (
        <Image src={member.avatarSrc} alt="" fill sizes="122px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[17px] font-semibold text-color-gray-750">
          {memberName.slice(0, 1)}
        </span>
      )}
    </span>
  );
}

export function MedalIcon({ size }: { size: "small" | "large" }) {
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
