"use client";

import Image from "next/image";

import {
  getCollaborationResultByCharacterType,
  type CollaborationCharacterType,
} from "@/app/collaboration-type/_data/collaborationTest";
import CollaborationTraitBars from "@/app/collaboration-type/_components/CollaborationTraitBars";
import { useCollaborationDisplayTraits } from "@/app/collaboration-type/_hooks/useCollaborationDisplayTraits";
import TeamMatchingStepLayout from "@/components/team-matching/TeamMatchingStepLayout";
import { useMyCharacterQuery } from "@/queries/useMyCharacterQuery";

function formatSubmittedAt(submittedAt: string) {
  const date = new Date(submittedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;

  return `${year}. ${month}. ${day} ${meridiem} ${twelveHour}:${minutes} 검사 완료`;
}

export default function TeamMatchingCollaborationTypePage() {
  const { data: character, isError, isLoading } = useMyCharacterQuery();
  const result = character
    ? getCollaborationResultByCharacterType(character.characterType as CollaborationCharacterType)
    : undefined;
  const traits = useCollaborationDisplayTraits(result);
  const submittedAtText = character?.submittedAt
    ? formatSubmittedAt(character.submittedAt)
    : null;
  const isActionDisabled = isLoading || isError || !character || !result;

  return (
    <TeamMatchingStepLayout
      actionDisabled={isActionDisabled}
      actionHref="/team-matching/contest-field"
      actionLabel="다음"
      currentStep={2}
      previousHref="/team-matching/profile"
    >
      <h2 className="-mt-px font-[Roboto] text-[22px] font-bold leading-[135%] text-[#1F1F1F]">
        내 협업 유형을 확인해 주세요.
      </h2>

      {isLoading && (
        <div className="mt-8 rounded-[8px] bg-[#F9F8F4] px-4 py-6 text-center font-[Pretendard] text-[13px] font-medium leading-[135%] text-[#616161]">
          협업 유형 결과를 불러오고 있어요.
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-[8px] bg-[#F9F8F4] px-4 py-6 text-center font-[Pretendard] text-[13px] font-medium leading-[135%] text-[#616161]">
          협업 유형 결과를 불러오지 못했어요.
        </div>
      )}

      {!isLoading && !isError && (!character || !result) && (
        <div className="mt-8 rounded-[8px] bg-[#F9F8F4] px-4 py-6 text-center font-[Pretendard] text-[13px] font-medium leading-[135%] text-[#616161]">
          완료된 협업 유형 검사가 없어요.
        </div>
      )}

      {character && result && (
        <section className="mt-[19.5px] flex flex-col items-center">
          {submittedAtText && (
            <p className="mb-2 flex h-[15px] flex-1 self-stretch pl-7 font-[Pretendard] text-[12px] font-normal leading-[135%] text-[#949494]">
              {submittedAtText}
            </p>
          )}

          <article
            className="mx-auto flex w-[318px] max-w-full flex-col items-center justify-center rounded-[12px] border-2 bg-white py-4"
            style={{ borderColor: result.borderColor }}
          >
            <h3
              className="flex h-[39px] self-stretch items-center justify-center text-center font-[Pretendard] text-[30px] font-bold leading-[135%]"
              style={{ color: result.nameColor }}
            >
              {character.displayName || result.name}
            </h3>

            <p
              className="mt-2 flex min-h-8 max-w-[calc(100%-32px)] items-center justify-center rounded-[75px] px-[13px] py-2 text-center font-[Pretendard] text-[13px] font-semibold leading-[125%] text-white"
              style={{ backgroundColor: result.quoteBoxColor }}
            >
              {character.catchphrase || result.quote}
            </p>

            <div className="mt-2 flex aspect-square h-[140px] w-[140px] items-center justify-center">
              <Image
                alt={`${character.displayName || result.name} 캐릭터`}
                className="h-full w-full object-contain"
                height={140}
                priority
                src={result.imageSrc}
                width={140}
              />
            </div>

            <p
              className="mt-2 w-[286px] max-w-[calc(100%-24px)] text-center font-[Pretendard] text-[12px] font-semibold leading-[135%]"
              style={{ color: result.hashtagColor }}
            >
              {(character.hashtags.length > 0 ? character.hashtags : result.hashtags).join(" ")}
            </p>

            <div className="mt-2 flex w-[286px] max-w-[calc(100%-24px)] flex-col items-start justify-center gap-[8px] rounded-[8px] bg-[#F9F8F4] px-[14px] py-4">
              <h4
                className="h-4 self-stretch font-[Pretendard] text-[13px] font-semibold leading-[125%]"
                style={{ color: result.featureTitleColor }}
              >
                당신의 협업스타일의 특징은?
              </h4>

              <CollaborationTraitBars
                barColor={result.traitBarColor}
                labelColor={result.traitLabelColor}
                traits={traits}
              />

              <ul className="w-[258px] max-w-full font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#555555]">
                {(character.features.length > 0 ? character.features : result.descriptions).map(
                  (description) => (
                    <li key={description}>· {description}</li>
                  ),
                )}
              </ul>
            </div>
          </article>
        </section>
      )}
    </TeamMatchingStepLayout>
  );
}
