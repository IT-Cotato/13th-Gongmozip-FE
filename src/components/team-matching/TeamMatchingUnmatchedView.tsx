"use client";

import Link from "next/link";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import {
  AiMatchingNoticeCard,
  PassIllustration,
} from "@/components/team-matching/TeamMatchingPassView";

export default function TeamMatchingUnmatchedView() {
  return (
    <main className="relative flex h-full w-full flex-col overflow-x-hidden overflow-y-auto bg-white text-[#1F1F1F]">
      <TeamMatchingHeader backHref="/team-matching/status" title="나의 매칭현황" />

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
        <section className="pt-[52px] text-center">
          <h1 className="font-[Pretendard] text-[20px] font-bold not-italic leading-[135%] text-[#1F1F1F]">
            팀원 매칭에 실패했어요 :(
          </h1>
        </section>

        <PassIllustration />

        <section className="relative z-30 mx-auto mt-[38px] w-[277px] text-center font-[Pretendard] text-[13px] font-normal not-italic leading-[150%] text-[#616161]">
          <p>팀원 매칭 풀에 사람이 부족해</p>
          <p className="mt-1">최고의 팀을 매칭하는 데 실패했어요.</p>
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
            매칭 다시하기
          </Link>
        </div>
      </div>
    </main>
  );
}
