"use client";

import { useEffect, useState } from "react";

import TeamMatchingStepLayout from "@/components/team-matching/TeamMatchingStepLayout";
import type { MatchingContestCategory } from "@/queries/useTodayMatchingApplicationQuery";
import { useTeamMatchingApplicationStore } from "@/stores/teamMatchingApplicationStore";

const contestFields: { label: string; value: MatchingContestCategory }[] = [
  { label: "IT / AI / 기술", value: "IT_AI_TECH" },
  { label: "마케팅 / 광고 / 브랜딩", value: "MARKETING_AD_BRANDING" },
  { label: "아이디어 / 기획", value: "IDEA_PLANNING" },
  { label: "미술 / 디자인", value: "ART_DESIGN" },
  { label: "사진 / 영상", value: "PHOTO_VIDEO" },
  { label: "데이터 분석", value: "DATA_ANALYSIS" },
];

export default function TeamMatchingContestFieldPage() {
  const storedContestCategory = useTeamMatchingApplicationStore((state) => state.contestCategory);
  const setContestCategory = useTeamMatchingApplicationStore((state) => state.setContestCategory);
  const [selectedField, setSelectedField] = useState<MatchingContestCategory>(
    storedContestCategory ?? contestFields[0].value,
  );

  useEffect(() => {
    if (!storedContestCategory) {
      setContestCategory(contestFields[0].value);
    }
  }, [setContestCategory, storedContestCategory]);

  const handleSelect = (contestCategory: MatchingContestCategory) => {
    setSelectedField(contestCategory);
    setContestCategory(contestCategory);
  };

  return (
    <TeamMatchingStepLayout actionHref="/team-matching/leader" actionLabel="다음" currentStep={3}>
      <section>
        <h2 className="-mt-px font-[Roboto] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
          관심있는 공모전 분야를 선택해주세요.
        </h2>
        <p className="mt-4 self-stretch pl-2 font-[Pretendard] text-[17px] font-medium leading-[135%] text-[#1F1F1F]">
          동일한 관심사의 팀원을 매칭해드려요.
        </p>

        <div className="mt-8 flex flex-wrap gap-x-3 gap-y-4">
          {contestFields.map(({ label, value }) => {
            const isSelected = selectedField === value;

            return (
              <button
                className={`flex h-8 items-center justify-center rounded-full px-[10px] py-2 text-center font-[Roboto] text-[15px] font-semibold leading-[125%] ${
                  isSelected ? "bg-[#1F1F1F] text-white" : "bg-[rgba(97,97,97,0.10)] text-[#616161]"
                }`}
                key={value}
                aria-pressed={isSelected}
                onClick={() => handleSelect(value)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </TeamMatchingStepLayout>
  );
}
