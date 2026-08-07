"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import type { TodayMatchingApplication } from "@/queries/useTodayMatchingApplicationQuery";
import { useTeamMatchingProposalStore } from "@/stores/teamMatchingProposalStore";

type MatchingReason = {
  label: string;
  value: string;
};

type MatchedMember = {
  avatarBg: string;
  avatarSrc: string;
  badgeTone: "coral" | "blue" | "orange" | "green";
  name: string;
  role: string;
};

const matchingReasons: MatchingReason[] = [
  { label: "매칭 이유", value: "공통된 분야 전공" },
  { label: "팀의 강점", value: "프로젝트 완주율 높음" },
];

const matchedMembers: MatchedMember[] = [
  {
    avatarBg: "#FFF1EE",
    avatarSrc: "/images/test/lead.png",
    badgeTone: "coral",
    name: "김민정",
    role: "리드러너",
  },
  {
    avatarBg: "#EBF7FE",
    avatarSrc: "/images/test/free.png",
    badgeTone: "blue",
    name: "이해은",
    role: "프리러너",
  },
  {
    avatarBg: "#FEFDEA",
    avatarSrc: "/images/test/boost.png",
    badgeTone: "orange",
    name: "이철수",
    role: "부스트러너",
  },
  {
    avatarBg: "#EEFBF0",
    avatarSrc: "/images/test/track.png",
    badgeTone: "green",
    name: "박준수",
    role: "트랙러너",
  },
];

const memberDescriptions = [
  "서울권 대학 재학중 (4학년)",
  "사회과학 분야 전공",
  "주요 프로젝트",
  "주요 프로젝트",
  "주요 프로젝트",
];

const badgeClassName: Record<MatchedMember["badgeTone"], string> = {
  blue: "bg-[#308CC5]",
  coral: "bg-[#D56046]",
  green: "bg-[#41AD61]",
  orange: "bg-[#FFAD62]",
};

const MATCHING_PROPOSAL_ID = "today-team-matching-proposal";

function MatchingSummaryCard() {
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
        <p className="font-[Pretendard] text-[9px] font-normal leading-[135%] text-[#616161]">
          15분 전
        </p>
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
        {member.badgeTone === "coral" ? (
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
        {memberDescriptions.map((description, index) => (
          <li className="flex gap-2" key={`${member.name}-${index}`}>
            <span aria-hidden="true">·</span>
            <span>{description}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

type TeamMatchingStatusResultViewProps = {
  todayApplication?: TodayMatchingApplication;
};

export default function TeamMatchingStatusResultView({
  todayApplication,
}: TeamMatchingStatusResultViewProps) {
  const router = useRouter();
  const acceptProposal = useTeamMatchingProposalStore((state) => state.acceptProposal);
  const setPendingProposalId = useTeamMatchingProposalStore((state) => state.setPendingProposalId);
  const proposalId = todayApplication?.applicationId
    ? String(todayApplication.applicationId)
    : MATCHING_PROPOSAL_ID;

  function handlePassClick() {
    setPendingProposalId(proposalId);
    router.push("/team-matching/status/pass/leave");
  }

  function handleAcceptClick() {
    acceptProposal(proposalId);
    router.push("/team-matching/status/waiting");
  }

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader backHref="/team-matching" title="나의 매칭현황" />

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-[116px]">
        <MatchingSummaryCard />

        <section className="mt-[41px] grid grid-cols-[147px_147px] gap-x-6 gap-y-[47px] px-5">
          {matchedMembers.map((member) => (
            <MatchedMemberCard key={member.name} member={member} />
          ))}
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-stretch gap-4 bg-white px-4 pb-9 pt-3">
        <button
          className="flex h-[50px] min-w-0 flex-1 items-center justify-center self-stretch rounded-[14px] border border-[rgba(97,97,97,0.50)] bg-white px-[10px] py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-[#616161]"
          onClick={handlePassClick}
          type="button"
        >
          패스
        </button>
        <button
          className="flex h-[50px] min-w-0 flex-1 items-center justify-center self-stretch rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-white"
          onClick={handleAcceptClick}
          type="button"
        >
          수락
        </button>
      </div>
    </main>
  );
}
