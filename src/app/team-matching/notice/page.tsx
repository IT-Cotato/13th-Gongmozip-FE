import Image from "next/image";

import TeamMatchingStepLayout from "@/components/team-matching/TeamMatchingStepLayout";

const restrictedBehaviors = [
  {
    imageSrc: "/images/team-matching/notice-character-1.png",
    label: "공모전 준비 도중에\n독단적으로 채팅방을 나가는 행위",
  },
  {
    imageSrc: "/images/team-matching/notice-character-2.png",
    label: "팀원 모두가 공모전 준비를 포기하고\n채팅방을 나가는 행위",
  },
  {
    imageSrc: "/images/team-matching/notice-character-3.png",
    label: "무임승차, 잠수, 욕설 등으로\n팀원들에게 신고를 받는 경우",
  },
];

export default function TeamMatchingNoticePage() {
  return (
    <TeamMatchingStepLayout
      actionHref="/team-matching/pool"
      actionLabel="확인했습니다."
      currentStep={5}
    >
      <section>
        <h2 className="-mt-px font-[Roboto] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
          주의사항을 확인해주세요.
        </h2>

        <p className="mt-4 ml-2 w-[342px] font-[Roboto] text-[13px] font-normal leading-[150%] text-[#949494]">
          팀원 매칭 서비스는 각자의 강점을 살려
          <br />
          최적의 팀을 만드는 서비스입니다.
          <br />팀 성과나 협업 분위기를 해치는 행동은
          <br />
          제재 대상이며, 협업거리가 줄어들어
          <br />
          향후 매칭에 불이익이 적용될 수 있습니다.
        </p>

        <div className="mt-8 flex w-[358px] flex-col items-start gap-4 rounded-2xl bg-[#F5F5F5] px-6 py-4">
          <h3 className="font-[Roboto] text-[17px] font-semibold leading-[125%] text-[#1F1F1F]">
            이 세가지 행동은
            <br />
            제재 대상임을 기억해주세요
          </h3>

          <div className="h-px w-full bg-[#D0D0D0]" />

          <ul className="flex flex-col gap-[18px]">
            {restrictedBehaviors.map(({ imageSrc, label }) => (
              <li className="flex items-center gap-4" key={label}>
                <Image
                  alt=""
                  aria-hidden="true"
                  className="h-12 w-12 shrink-0"
                  height={48}
                  src={imageSrc}
                  unoptimized
                  width={48}
                />
                <span className="min-w-0 flex-1 whitespace-pre-line font-[Roboto] text-[13px] font-normal leading-[150%] text-[#1F1F1F]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </TeamMatchingStepLayout>
  );
}
