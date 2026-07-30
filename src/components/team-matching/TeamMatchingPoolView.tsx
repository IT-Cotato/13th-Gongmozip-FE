import Image from "next/image";
import Link from "next/link";

import CancelConfirmationModal from "@/components/team-matching/CancelConfirmationModal";
import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";

const countdownGroups = [
  { digits: ["0", "1"], label: "시간" },
  { digits: ["3", "0"], label: "분" },
  { digits: ["1", "0"], label: "초" },
];

type TeamMatchingPoolViewProps = {
  showCancelModal?: boolean;
};

function MatchingCountdown() {
  return (
    <section className="relative mx-auto mt-9 flex w-full max-w-[358px] flex-col items-start gap-4 overflow-hidden rounded-2xl bg-[#F9F8F4] px-5 py-4 shadow-[0_16px_4px_0_rgba(0,0,0,0),0_10px_4px_0_rgba(0,0,0,0.01),0_6px_3px_0_rgba(0,0,0,0.05),0_3px_3px_0_rgba(0,0,0,0.09),0_1px_1px_0_rgba(0,0,0,0.10)]">
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-[58px] -top-[6px] h-[180px] w-[157px]"
        height={180}
        src="/images/team-matching/shape.svg"
        width={157}
      />

      <div className="relative z-10 flex w-full flex-col items-start gap-4">
        <h2 className="font-[Roboto] text-[17px] font-semibold leading-[135%] text-[#1F1F1F]">
          공모집이 김철수님을 위한
          <br />
          팀원을 아직 구성중이에요.
        </h2>

        <p className="text-center font-[Roboto] text-[12px] font-normal leading-[135%] text-[#949494]">
          매칭결과까지
        </p>

        <div className="mt-[-8px] w-full">
          <div className="flex h-[49px] w-full items-center justify-center gap-1">
            {countdownGroups.map(({ digits, label }, groupIndex) => (
              <div className="contents" key={label}>
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  {digits.map((digit, digitIndex) => (
                    <span
                      className="flex flex-[1_0_0] flex-col items-center justify-center gap-[10px] rounded-[5px] bg-white p-2 text-center font-[Roboto] text-[30px] font-bold leading-[135%] text-[#AC4A35] shadow-[0_5px_1px_0_rgba(0,0,0,0),0_3px_1px_0_rgba(0,0,0,0.01),0_2px_1px_0_rgba(0,0,0,0.05),0_1px_1px_0_rgba(0,0,0,0.09)]"
                      key={`${label}-${digitIndex}`}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                {groupIndex < countdownGroups.length - 1 ? (
                  <span className="font-[Roboto] text-[28px] font-bold leading-none text-[#DFAFA4]">
                    :
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-1.5 flex w-full items-start gap-1 text-center font-[Roboto] text-[12px] font-normal leading-[135%] text-[#949494]">
            {countdownGroups.map(({ label }, groupIndex) => (
              <div className="contents" key={label}>
                <div className="flex min-w-0 flex-1 gap-1">
                  <span className="flex-1" aria-hidden="true" />
                  <span className="flex-1 text-right">{label}</span>
                </div>
                {groupIndex < countdownGroups.length - 1 ? <span aria-hidden="true" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TeamMatchingPoolView({
  showCancelModal = false,
}: TeamMatchingPoolViewProps) {
  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader backHref="/team-matching" />

      <div className="scrollbar-hidden relative min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <section className="relative z-10 pt-[51px] text-center">
          <h1 className="text-center font-[Roboto] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
            팀원 매칭중...
          </h1>
          <p className="mt-[18px] font-[Roboto] text-[16px] font-normal leading-[150%] text-[#616161]">
            조금만 기다려주세요.
            <br />
            매칭이 완료되면 알림으로 알려드립니다.
          </p>
        </section>

        <div className="relative z-10 mt-[78px]">
          <Image
            alt="팀원 매칭을 기다리는 캐릭터들"
            className="mx-auto h-auto w-full max-w-[358px]"
            height={146}
            priority
            src="/images/team-matching/matchingpool.png"
            width={358}
          />

          <div
            aria-hidden="true"
            className="mx-auto mt-8 flex h-[6px] w-full max-w-[322px] flex-col items-start gap-[10px] overflow-hidden rounded-[90px] bg-[#D9D9D9]"
          >
            <div className="h-[6px] w-20 shrink-0 rounded-[90px] bg-[#FFAD62]" />
          </div>
        </div>

        <MatchingCountdown />
      </div>

      <div className="shrink-0 bg-white px-4 pb-3 pt-2">
        <Link
          className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-white"
          href="/team-matching/cancel"
        >
          매칭 취소하기
        </Link>
      </div>

      {showCancelModal ? <CancelConfirmationModal /> : null}
    </main>
  );
}
