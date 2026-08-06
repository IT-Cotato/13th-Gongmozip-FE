import Image from "next/image";
import Link from "next/link";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";

export default function TeamMatchingCompleteView() {
  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[42px] z-0 h-auto w-full max-w-[390px] -translate-x-1/2"
        height={751}
        priority
        src="/icons/contests/Frame.svg"
        width={390}
      />

      <TeamMatchingHeader
        backHref="/team-matching"
        className="relative z-10 bg-white"
        title="나의 매칭현황"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-6">
        <section className="pt-[52px] text-center">
          <h1 className="font-[Pretendard] text-[20px] font-bold leading-[135%] text-[#1F1F1F]">
            팀원 매칭 완료!
          </h1>
          <p className="mt-[17px] font-[Pretendard] text-[12px] font-normal leading-[135%] text-[#616161]">
            첫 팀 매칭을 축하해요.
          </p>
        </section>

        <div className="mt-4">
          <Image
            alt="팀원 매칭 완료를 축하하는 캐릭터들"
            className="mx-auto h-[308px] w-[308px] object-contain"
            height={308}
            priority
            src="/images/team-matching/complete.png"
            width={308}
          />
        </div>

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
            href="/chat"
          >
            채팅방 바로가기
          </Link>
        </div>
      </div>
    </main>
  );
}
