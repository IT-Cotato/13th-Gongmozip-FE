"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import { ApiError } from "@/lib/http";
import { useAcceptMatchingGroupMutation } from "@/queries/useAcceptMatchingGroupMutation";
import {
  type MatchingReasonTextBlock,
  useCreateMatchingReasonMutation,
  useMatchingReasonQuery,
} from "@/queries/useMatchingReasonQuery";
import type {
  MatchingCharacterType,
  TodayMatchingResult,
  TodayMatchingResultMember,
} from "@/queries/useTodayMatchingResultQuery";
import { useTeamMatchingProposalStore } from "@/stores/teamMatchingProposalStore";

type MatchingReason = {
  label: string;
  value: string;
};

type MatchedMember = {
  avatarBg: string;
  avatarSrc: string;
  badgeTone: "coral" | "blue" | "orange" | "green";
  id: number;
  me: boolean;
  name: string;
  responseStatus: TodayMatchingResultMember["responseStatus"];
  role: string;
};

const characterMeta: Record<
  MatchingCharacterType,
  Pick<MatchedMember, "avatarBg" | "avatarSrc" | "badgeTone" | "role">
> = {
  LEAD_RUNNER: {
    avatarBg: "#FFF1EE",
    avatarSrc: "/images/test/lead.png",
    badgeTone: "coral",
    role: "리드러너",
  },
  FREE_RUNNER: {
    avatarBg: "#EBF7FE",
    avatarSrc: "/images/test/free.png",
    badgeTone: "blue",
    role: "프리러너",
  },
  BOOST_RUNNER: {
    avatarBg: "#FEFDEA",
    avatarSrc: "/images/test/boost.png",
    badgeTone: "orange",
    role: "부스트러너",
  },
  TRACK_RUNNER: {
    avatarBg: "#EEFBF0",
    avatarSrc: "/images/test/track.png",
    badgeTone: "green",
    role: "트랙러너",
  },
};

const memberDescriptions = [
  "신청 당시 프로필 기준",
  "협업 유형 검사 반영",
  "팀장 희망 여부 반영",
  "궁합 점수 기반 매칭",
];

const badgeClassName: Record<MatchedMember["badgeTone"], string> = {
  blue: "bg-[#308CC5]",
  coral: "bg-[#D56046]",
  green: "bg-[#41AD61]",
  orange: "bg-[#FFAD62]",
};

const MATCHING_PROPOSAL_ID = "today-team-matching-proposal";

function formatScore(score: number | null) {
  if (score === null) {
    return "-";
  }

  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

function getMatchingReasons(todayMatchingResult: TodayMatchingResult): MatchingReason[] {
  const score = formatScore(todayMatchingResult.matchingScore);
  const teamSize = todayMatchingResult.teamSize ?? todayMatchingResult.members.length;

  return [
    { label: "궁합 점수", value: score === "-" ? "계산 완료" : `${score}점` },
    { label: "제안 팀", value: `${teamSize}명 팀` },
  ];
}

function getMatchedMembers(members: TodayMatchingResultMember[]): MatchedMember[] {
  return members.map((member) => {
    const meta = member.characterType
      ? characterMeta[member.characterType]
      : {
          avatarBg: "#F9F8F4",
          avatarSrc: "/images/test/free.png",
          badgeTone: "blue" as const,
          role: "러너",
        };

    return {
      ...meta,
      id: member.memberId,
      me: member.me,
      name: member.nickname,
      responseStatus: member.responseStatus,
    };
  });
}

function formatReasonScore(score: number | null) {
  if (score === null) {
    return null;
  }

  return Number.isInteger(score) ? `${score}점` : `${score.toFixed(1)}점`;
}

function isReasonGenerating(status: string | undefined) {
  return status === "PENDING" || status === "PROCESSING";
}

function MatchingReasonList({
  items,
  title,
}: {
  items: MatchingReasonTextBlock[];
  title: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="font-[Pretendard] text-[13px] font-semibold leading-[135%] text-[#2A2A2A]">
        {title}
      </h4>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li className="rounded-[8px] bg-white px-3 py-2" key={`${title}-${item.title}`}>
            <p className="font-[Pretendard] text-[12px] font-semibold leading-[135%] text-[#1F1F1F]">
              {item.title}
            </p>
            <p className="mt-1 font-[Pretendard] text-[11px] font-normal leading-[145%] text-[#616161]">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchingReasonBulletList({ items, title }: { items: string[]; title: string }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="font-[Pretendard] text-[13px] font-semibold leading-[135%] text-[#2A2A2A]">
        {title}
      </h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li
            className="flex gap-2 font-[Pretendard] text-[11px] font-normal leading-[145%] text-[#616161]"
            key={`${title}-${item}`}
          >
            <span aria-hidden="true">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchingReasonSection({ matchingGroupId }: { matchingGroupId: number | null }) {
  const reasonQuery = useMatchingReasonQuery(matchingGroupId, {
    refetchInterval: (query) =>
      isReasonGenerating(query.state.data?.status) ? 4000 : false,
  });
  const createReasonMutation = useCreateMatchingReasonMutation();
  const reason = reasonQuery.data;
  const isNotFound = reasonQuery.error instanceof ApiError && reasonQuery.error.status === 404;
  const createError =
    createReasonMutation.error instanceof ApiError ? createReasonMutation.error : null;
  const isCreating =
    createReasonMutation.isPending || isReasonGenerating(createReasonMutation.data?.status);
  const isGenerating = isReasonGenerating(reason?.status) || isCreating;
  const totalScore = formatReasonScore(reason?.totalCompatibilityScore ?? null);
  const scoreItems = [
    { label: "목표", value: formatReasonScore(reason?.teamGoalScore ?? null) },
    { label: "성향", value: formatReasonScore(reason?.personalityScore ?? null) },
    { label: "외향 보완", value: formatReasonScore(reason?.extraversionComplementScore ?? null) },
  ].filter((item): item is { label: string; value: string } => item.value !== null);

  function handleCreateReason() {
    if (typeof matchingGroupId !== "number" || createReasonMutation.isPending) {
      return;
    }

    createReasonMutation.mutate(matchingGroupId);
  }

  if (typeof matchingGroupId !== "number") {
    return null;
  }

  return (
    <section className="mx-auto mt-5 w-[358px] max-w-full rounded-[14px] bg-[#F9F8F4] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-[Pretendard] text-[11px] font-medium leading-[135%] text-[#FF7658]">
            AI 추천 사유
          </p>
          <h3 className="mt-1 font-[Pretendard] text-[16px] font-bold leading-[135%] text-[#1F1F1F]">
            {reason?.headline || "팀 궁합 분석을 확인해 보세요"}
          </h3>
        </div>
        <button
          className="h-8 shrink-0 rounded-[9px] bg-[#FF7658] px-3 font-[Pretendard] text-[12px] font-semibold leading-[135%] text-white disabled:bg-[#DFDFDF]"
          disabled={isGenerating}
          onClick={handleCreateReason}
          type="button"
        >
          {reason ? "재생성" : "생성"}
        </button>
      </div>

      {reasonQuery.isLoading ? (
        <p className="mt-3 font-[Pretendard] text-[12px] font-normal leading-[145%] text-[#616161]">
          추천 사유를 불러오고 있어요.
        </p>
      ) : null}

      {isNotFound ? (
        <p className="mt-3 font-[Pretendard] text-[12px] font-normal leading-[145%] text-[#616161]">
          아직 생성된 추천 사유가 없어요.
        </p>
      ) : null}

      {isGenerating ? (
        <p className="mt-3 rounded-[8px] bg-white px-3 py-2 font-[Pretendard] text-[12px] font-medium leading-[145%] text-[#616161]">
          AI가 추천 사유를 생성하고 있어요. 완료되면 자동으로 갱신됩니다.
        </p>
      ) : null}

      {reason?.status === "FAILED" ? (
        <p className="mt-3 rounded-[8px] bg-white px-3 py-2 font-[Pretendard] text-[12px] font-medium leading-[145%] text-[#D56046]">
          {reason.failureMessage || "추천 사유 생성에 실패했어요. 다시 시도해 주세요."}
        </p>
      ) : null}

      {createError ? (
        <p
          role="alert"
          className="mt-3 font-[Pretendard] text-[12px] font-medium leading-[145%] text-[#D56046]"
        >
          {createError.status === 409
            ? "이미 추천 사유 생성이 진행 중이에요. 잠시 후 확인해 주세요."
            : createError.message}
        </p>
      ) : null}

      {reason?.summary ? (
        <p className="mt-3 font-[Pretendard] text-[12px] font-normal leading-[145%] text-[#616161]">
          {reason.summary}
        </p>
      ) : null}

      {totalScore ? (
        <div className="mt-4 rounded-[10px] bg-white px-3 py-3">
          <div className="flex items-center justify-between">
            <span className="font-[Pretendard] text-[12px] font-semibold leading-[135%] text-[#616161]">
              총 궁합 점수
            </span>
            <strong className="font-[Pretendard] text-[18px] font-bold leading-[135%] text-[#FF7658]">
              {totalScore}
            </strong>
          </div>
          {scoreItems.length > 0 ? (
            <dl className="mt-2 grid grid-cols-3 gap-2">
              {scoreItems.map((item) => (
                <div className="min-w-0 text-center" key={item.label}>
                  <dt className="font-[Pretendard] text-[10px] font-medium leading-[135%] text-[#616161]">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 font-[Pretendard] text-[11px] font-semibold leading-[135%] text-[#1F1F1F]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}

      <MatchingReasonList items={reason?.strengths ?? []} title="팀의 강점" />
      <MatchingReasonBulletList items={reason?.commonPoints ?? []} title="공통점" />
      <MatchingReasonList items={reason?.complementaryPoints ?? []} title="보완 포인트" />
      <MatchingReasonBulletList items={reason?.cautions ?? []} title="주의할 점" />
    </section>
  );
}

function MatchingSummaryCard({ todayMatchingResult }: { todayMatchingResult: TodayMatchingResult }) {
  const matchingReasons = getMatchingReasons(todayMatchingResult);

  return (
    <section className="relative mx-auto mt-[30px] flex w-[358px] max-w-full flex-col items-start gap-2 overflow-hidden rounded-2xl bg-[#F9F8F4] p-4">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
        viewBox="0 0 358 159"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M370.351 -70.9449C392.402 -60.1389 407.634 -37.9331 415.585 -14.6725C423.041 7.13796 415.998 30.2323 412.749 53.077C409.624 75.0515 408.544 97.4499 396.945 116.383C384.395 136.871 366.481 153.67 344.804 163.988C321.39 175.133 293.284 187.703 269.744 176.931C245.992 166.062 247.32 130.685 229.758 111.343C212.608 92.4555 176.682 91.1532 169.585 66.6225C162.602 42.4835 183.688 19.303 196.946 -2.08345C208.41 -20.5774 222.921 -36.3126 240.941 -48.4895C258.725 -60.5063 278.526 -67.8195 299.651 -71.4852C323.362 -75.5995 348.764 -81.5235 370.351 -70.9449Z"
          fill="#FFAD9B"
          fillOpacity="0.2"
          fillRule="evenodd"
        />
      </svg>
      <Image
        alt=""
        aria-hidden="true"
        className="absolute left-[229px] top-[46.5px] h-[104px] w-[121px] object-cover"
        height={104}
        priority
        src="/images/team-matching/match.png"
        width={121}
      />

      <div className="relative z-10">
        {todayMatchingResult.publishedAt ? (
          <p className="font-[Pretendard] text-[9px] font-normal leading-[135%] text-[#616161]">
            {new Date(todayMatchingResult.publishedAt).toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
              hour: "2-digit",
              minute: "2-digit",
              month: "long",
              day: "numeric",
            })}{" "}
            공개
          </p>
        ) : null}
        <h2 className="mt-1 font-[Pretendard] text-[17px] font-bold leading-[135%] text-[#2A2A2A]">
          오늘의 팀원 매칭 제안이 도착했어요
        </h2>

        <div className="mt-2 flex h-6 w-[72px] items-center">
          {[0, 1, 2].map((star) => (
            <Image
              alt=""
              aria-hidden="true"
              className="aspect-square w-6 shrink-0 self-stretch object-contain"
              height={24}
              key={star}
              src="/images/team-matching/star.png"
              width={24}
            />
          ))}
        </div>

        <dl className="mt-1 space-y-1">
          {matchingReasons.map(({ label, value }) => (
            <div className="flex items-center gap-1" key={label}>
              <dt className="flex items-center justify-center rounded-[85px] bg-[#616161]/10 px-2 py-1 text-center font-[Pretendard] text-[12px] font-medium leading-[135%] text-[#616161]">
                {label}
              </dt>
              <dd className="font-[Pretendard] text-[12px] font-medium leading-[135%] text-[#1F1F1F]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function MatchedMemberCard({ member }: { member: MatchedMember }) {
  const responseText: Record<TodayMatchingResultMember["responseStatus"], string> = {
    ACCEPTED: "수락",
    EXPIRED: "만료",
    PASSED: "패스",
    PENDING: "대기",
    REJECTED: "거절",
  };

  return (
    <article className="relative flex h-[175px] w-[147px] flex-col items-start justify-center gap-[10px] self-stretch rounded-xl bg-[#F9F8F4] pb-4 pl-4 pr-2 pt-2">
      <div
        className="absolute -top-[31px] left-0 flex aspect-square h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-full border-2 border-white p-[2.818px]"
        style={{ backgroundColor: member.avatarBg }}
      >
        <Image
          alt=""
          className="h-[51.479px] w-[50.915px] shrink-0 scale-[1.18] object-contain"
          height={51}
          src={member.avatarSrc}
          width={51}
        />
      </div>

      <button
        aria-label={`${member.name} 프로필 자세히 보기`}
        className="absolute right-2 top-2 flex h-7 w-7 flex-col items-center justify-center gap-[10px] rounded-[10px] bg-[#616161]/10 p-0"
        type="button"
      >
        <Image
          alt=""
          aria-hidden="true"
          className="absolute left-[7px] top-[7px] flex h-[14px] w-[14px] items-center justify-center"
          height={14}
          src="/icons/contests/tabler_search.svg"
          width={14}
        />
      </button>

      <div className="absolute left-4 top-11 flex min-w-0 items-center gap-1">
        <h3 className="font-[Pretendard] text-[15px] font-semibold leading-[125%] text-[#1F1F1F]">
          {member.name}
        </h3>
        <span
          className={`inline-flex min-h-[15px] shrink-0 items-center justify-center gap-[10px] rounded-full px-1 py-0.5 font-[Pretendard] text-[8px] font-semibold leading-[135%] text-white ${badgeClassName[member.badgeTone]}`}
        >
          <span className="translate-y-px">{member.role}</span>
        </span>
        {member.me ? (
          <Image
            alt=""
            aria-hidden="true"
            className="ml-1 aspect-square h-5 w-5"
            height={20}
            src="/images/team-matching/medal.png"
            width={20}
          />
        ) : null}
      </div>

      <ul className="absolute left-4 top-[85px] space-y-1 font-[Pretendard] text-[9px] font-normal leading-[135%] text-[#616161]">
        {[`응답 상태: ${responseText[member.responseStatus]}`, ...memberDescriptions].map(
          (description, index) => (
            <li className="flex gap-2" key={`${member.name}-${index}`}>
              <span aria-hidden="true">·</span>
              <span>{description}</span>
            </li>
          ),
        )}
      </ul>
    </article>
  );
}

type TeamMatchingStatusResultViewProps = {
  todayMatchingResult: TodayMatchingResult;
};

export default function TeamMatchingStatusResultView({
  todayMatchingResult,
}: TeamMatchingStatusResultViewProps) {
  const router = useRouter();
  const acceptMatchingGroupMutation = useAcceptMatchingGroupMutation();
  const setPendingProposalId = useTeamMatchingProposalStore((state) => state.setPendingProposalId);
  const proposalId = todayMatchingResult.matchingGroupId
    ? String(todayMatchingResult.matchingGroupId)
    : todayMatchingResult.applicationId
      ? String(todayMatchingResult.applicationId)
      : MATCHING_PROPOSAL_ID;
  const matchedMembers = getMatchedMembers(todayMatchingResult.members);

  function handlePassClick() {
    setPendingProposalId(proposalId);
    router.push("/team-matching/status/pass/leave");
  }

  function handleAcceptClick() {
    if (typeof todayMatchingResult.matchingGroupId !== "number") {
      return;
    }

    acceptMatchingGroupMutation.mutate(todayMatchingResult.matchingGroupId, {
      onSuccess: (data) => {
        router.push(data.teamId ? "/team-matching/status" : "/team-matching/status/waiting");
      },
    });
  }

  const acceptErrorMessage =
    acceptMatchingGroupMutation.error instanceof ApiError
      ? acceptMatchingGroupMutation.error.message
      : acceptMatchingGroupMutation.isError
        ? "매칭 결과를 수락하지 못했어요. 잠시 후 다시 시도해 주세요."
        : null;

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader backHref="/team-matching" title="나의 매칭현황" />

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-[116px]">
        <MatchingSummaryCard todayMatchingResult={todayMatchingResult} />
        <MatchingReasonSection matchingGroupId={todayMatchingResult.matchingGroupId} />

        <section className="mt-[41px] grid grid-cols-[147px_147px] gap-x-6 gap-y-[47px] px-5">
          {matchedMembers.map((member) => (
            <MatchedMemberCard key={member.id} member={member} />
          ))}
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white px-4 pb-9 pt-3">
        {acceptErrorMessage ? (
          <p
            role="alert"
            className="mb-2 text-center font-[Pretendard] text-[12px] font-medium leading-[135%] text-[#D56046]"
          >
            {acceptErrorMessage}
          </p>
        ) : null}
        <div className="flex items-stretch gap-4">
          <button
            className="flex h-[50px] min-w-0 flex-1 items-center justify-center self-stretch rounded-[14px] border border-[rgba(97,97,97,0.50)] bg-white px-[10px] py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-[#616161] disabled:opacity-50"
            disabled={acceptMatchingGroupMutation.isPending}
            onClick={handlePassClick}
            type="button"
          >
            패스
          </button>
          <button
            className="flex h-[50px] min-w-0 flex-1 items-center justify-center self-stretch rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-white disabled:opacity-60"
            disabled={
              acceptMatchingGroupMutation.isPending ||
              typeof todayMatchingResult.matchingGroupId !== "number"
            }
            onClick={handleAcceptClick}
            type="button"
          >
            {acceptMatchingGroupMutation.isPending ? "수락 중..." : "수락"}
          </button>
        </div>
      </div>
    </main>
  );
}
