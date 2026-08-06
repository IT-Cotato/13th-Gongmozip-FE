"use client";

import Image from "next/image";
import Link from "next/link";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import {
  TEAM_MATCHING_PASS_DISTANCE_REDUCTION_METERS,
  useTeamMatchingProposalStore,
} from "@/stores/teamMatchingProposalStore";

type PassIllustrationProps = {
  className?: string;
};

export function PassIllustration({ className = "mt-px" }: PassIllustrationProps) {
  return (
    <div
      className={`isolate relative mx-auto h-[237px] w-full max-w-[362px] overflow-visible ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[146px] top-[40px] -z-10 h-[349px] w-[351px] overflow-hidden"
      >
        <Image
          alt=""
          className="h-[349px] w-[351px] max-w-none opacity-60"
          height={349}
          priority
          src="/icons/team-matching/gra.svg"
          width={351}
        />
      </div>

      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[227px] z-10 h-[30px] w-[311px] -translate-x-1/2"
        height={30}
        priority
        src="/icons/team-matching/shadow.svg"
        width={311}
      />

      <Image
        alt="패스 후 아쉬워하는 팀 매칭 캐릭터들"
        className="pointer-events-none absolute left-1/2 top-0 z-20 h-[370px] w-[370px] -translate-x-1/2 object-contain"
        height={370}
        priority
        src="/images/team-matching/pass.png"
        width={370}
      />
    </div>
  );
}

function AiMatchingNoticeCard() {
  return (
    <section className="mx-auto mt-[22px] flex w-[359px] max-w-full flex-col items-start rounded-[14px] bg-[#F9F8F4] px-4 pb-2 pt-4 text-[#616161]">
      <h2 className="font-[Pretendard] text-[15px] font-medium not-italic leading-[125%] text-[#1F1F1F]">
        AI 분석 매칭
      </h2>
      <div className="mt-2 h-px w-full bg-[#DFDFDF]" />
      <div className="mt-[17px] font-[Pretendard] text-[13px] font-normal not-italic leading-[135%] text-[#616161]">
        <p>오후 4시 매칭결과 발표</p>
        <p className="mt-4">
          개인 프로필과 성격 유형검사 결과를 반영하여
          <br />
          최적의 팀을 구성합니다.
        </p>
      </div>
    </section>
  );
}

export default function TeamMatchingPassView() {
  const lastResult = useTeamMatchingProposalStore((state) => state.lastResult);
  const distanceReductionMeters =
    lastResult?.status === "passed"
      ? (lastResult.distanceReductionMeters ?? TEAM_MATCHING_PASS_DISTANCE_REDUCTION_METERS)
      : TEAM_MATCHING_PASS_DISTANCE_REDUCTION_METERS;

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader backHref="/team-matching/status" title="나의 매칭현황" />

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
        <section className="pt-[52px] text-center">
          <h1 className="font-[Pretendard] text-[20px] font-bold not-italic leading-[135%] text-[#1F1F1F]">
            협업거리가 {distanceReductionMeters}m 줄어들었어요 :(
          </h1>
        </section>

        <PassIllustration />

        <section className="relative z-30 mx-auto mt-[38px] w-[277px] text-center font-[Pretendard] text-[13px] font-normal not-italic leading-[150%] text-[#616161]">
          <p>매칭에 다시 참여하시겠어요?</p>
          <p className="mt-1">더 최적의 팀원을 찾아드리도록 할게요.</p>
        </section>

        <AiMatchingNoticeCard />

        <div className="flex-1" />

        <div className="space-y-3">
          <Link
            className="flex h-[51px] w-full items-center justify-center self-stretch rounded-[14px] bg-[rgba(97,97,97,0.10)] px-[10px] py-[9px] text-center font-[Pretendard] text-[17px] font-semibold leading-[125%] text-[#616161]"
            href="/team-matching"
          >
            나가기
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] text-center text-[18px] font-bold leading-none text-white"
            href="/team-matching/profile"
          >
            매칭 바로가기
          </Link>
        </div>
      </div>
    </main>
  );
}
