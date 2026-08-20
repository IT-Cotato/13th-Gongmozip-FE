import Image from "next/image";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";

type TeamMatchingStatusEmptyViewProps = {
  preferHistoryBack?: boolean;
};

export default function TeamMatchingStatusEmptyView({
  preferHistoryBack = false,
}: TeamMatchingStatusEmptyViewProps) {
  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[47px] z-0 h-auto w-full max-w-[390px] -translate-x-1/2"
        height={751}
        priority
        src="/icons/contests/Frame.svg"
        style={{ height: "auto" }}
        width={390}
      />

      <TeamMatchingHeader
        backHref="/team-matching"
        className="relative z-10 bg-white"
        preferHistoryBack={preferHistoryBack}
        title="나의 매칭현황"
      />

      <section className="relative z-10 flex min-h-0 flex-1 flex-col items-center px-4 pt-[88px] text-center">
        <h1 className="font-[Pretendard] text-[17px] font-normal leading-[150%] text-[#1F1F1F]">
          아직 도착한 팀원 매칭 제안이 없어요
        </h1>
        <p className="mt-1 font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
          조금만 기다려주세요.
        </p>
        <Image
          alt=""
          aria-hidden="true"
          className="mt-5 h-[76px] w-[76px]"
          height={76}
          priority
          src="/icons/team-matching/tsc.svg"
          width={76}
        />
      </section>
    </main>
  );
}
