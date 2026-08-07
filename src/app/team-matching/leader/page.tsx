"use client";

import { useEffect, useState } from "react";

import TeamMatchingStepLayout from "@/components/team-matching/TeamMatchingStepLayout";
import type { MatchingLeaderPreference } from "@/queries/useTodayMatchingApplicationQuery";
import { useTeamMatchingApplicationStore } from "@/stores/teamMatchingApplicationStore";


const leaderOptions: { label: string; value: MatchingLeaderPreference }[] = [
  { label: "네, 팀장으로 참여할게요", value: "WANTS" },
  { label: "아니요, 팀원으로 참여할게요", value: "DOES_NOT_WANT" },
  { label: "필요하면 맡을 수 있어요", value: "NEUTRAL" },
];


export default function TeamMatchingLeaderPage() {
  const storedLeaderPreference = useTeamMatchingApplicationStore((state) => state.leaderPreference);
  const setLeaderPreference = useTeamMatchingApplicationStore((state) => state.setLeaderPreference);
  const [selectedOption, setSelectedOption] = useState<MatchingLeaderPreference>(
    storedLeaderPreference ?? leaderOptions[0].value,
  );

  useEffect(() => {
    if (!storedLeaderPreference) {
      setLeaderPreference(leaderOptions[0].value);
    }
  }, [setLeaderPreference, storedLeaderPreference]);

  const handleSelect = (leaderPreference: MatchingLeaderPreference) => {
    setSelectedOption(leaderPreference);
    setLeaderPreference(leaderPreference);
  };

  const renderLeaderOption = (option: { label: string; value: MatchingLeaderPreference }) => {
    const isSelected = selectedOption === option.value;

    return (
      <button
        className={`flex h-8 items-center justify-center rounded-[999px] px-[10px] py-2 text-center font-[Roboto] text-[15px] font-semibold leading-[125%] ${
          isSelected ? "bg-[#1F1F1F] text-white" : "bg-[rgba(97,97,97,0.10)] text-[#616161]"
        }`}
        key={option.value}
        aria-pressed={isSelected}
        onClick={() => handleSelect(option.value)}
        type="button"
      >
        {option.label}
      </button>
    );
  };

  return (
    <TeamMatchingStepLayout actionHref="/team-matching/notice" actionLabel="다음" currentStep={4}>
      <section>
        <h2 className="-mt-px font-[Roboto] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
          팀장 여부를 선택해주세요.
        </h2>
        <p className="mt-4 self-stretch pl-2 font-[Pretendard] text-[17px] font-medium leading-[135%] text-[#1F1F1F]">
          이번 팀 매칭에서 팀장을 하고 싶나요?
        </p>

        <div className="mt-8 flex h-[118px] w-full flex-col items-start gap-[10px] rounded-[14px] bg-[#F5F5F5] p-2">
          <div className="flex flex-col items-start justify-center gap-1.5 self-stretch p-2">
            <ul className="flex list-disc flex-col gap-1.5 self-stretch pl-4 font-[Roboto] text-[13px] font-normal leading-[150%] text-[#616161]">
              <li>
                팀장을 선택하면 팀장후보로 우선 고려되지만, 팀 구성
                <br />
                결과에 따라 팀장으로 최종 선정되지 않을 수 있습니다.
              </li>
              <li>
                팀장을 선택하지 않아도 팀 구성 후 협의 결과에 따라 팀장
                <br />
                이 될 수 있습니다.
              </li>
            </ul>
          </div>
        </div>

        <p className="ml-1 mt-8 w-fit text-center font-[Roboto] text-[12px] font-semibold leading-[135%] text-[#AC4A35]">
          협업거리 최대 + 15m의 베네핏을 얻습니다.
        </p>

        <div className="ml-1 mt-1 flex flex-col items-start gap-4">
          {leaderOptions.map(renderLeaderOption)}
        </div>
      </section>
    </TeamMatchingStepLayout>
  );
}
