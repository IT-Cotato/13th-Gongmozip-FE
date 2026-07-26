"use client";

import Link from "next/link";
import { useState } from "react";

type CollaborationQuestionFormProps = {
  currentQuestionId: number;
  nextHref: string;
  options: string[];
  title: string;
};

export default function CollaborationQuestionForm({
  currentQuestionId,
  nextHref,
  options,
  title,
}: CollaborationQuestionFormProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const isLikertScaleQuestion = currentQuestionId >= 4;
  const optionGapClassName = isLikertScaleQuestion ? "gap-5" : "gap-[21px]";
  const optionMarginClassName = isLikertScaleQuestion ? "mt-5" : "mt-[21px]";
  const optionTextClassName = isLikertScaleQuestion
    ? "h-[60px] text-[15px] leading-[125%]"
    : "h-[101px] text-[16px] leading-[150%]";
  const nextButtonClassName = selectedOption
    ? "mt-5 inline-flex h-8 items-center justify-center gap-[5px] self-end rounded-[14px] bg-[#FF7658] px-2.5 py-[9px] font-[Roboto] text-[17px] font-semibold leading-[125%] text-white"
    : "mt-5 inline-flex h-8 items-center justify-center gap-[5px] self-end rounded-[14px] bg-[#DFDFDF] px-2.5 py-[9px] font-[Roboto] text-[17px] font-semibold leading-[125%] text-white";

  const nextButtonContent = (
    <>
      <span className="relative h-4 w-[17px]" aria-hidden="true">
        <span className="absolute left-[2px] top-[3px] h-[9px] w-[9px] rotate-[-45deg] border-b-2 border-r-2 border-white" />
        <span className="absolute left-[8px] top-[3px] h-[9px] w-[9px] rotate-[-45deg] border-b-2 border-r-2 border-white" />
      </span>
      다음
    </>
  );

  return (
    <>
      <div className="flex h-[531px] flex-col self-stretch rounded-2xl bg-white px-11 pb-[14px] pt-[22px]">
        <p className="h-[17px] self-stretch text-center font-[Pretendard] text-[17px] font-bold leading-[135%] text-semantic-fill-brand">
          Q{currentQuestionId}
        </p>
        <p className="mt-4 flex h-8 items-center justify-center self-stretch text-center font-[Pretendard] text-[13px] font-semibold leading-[125%] text-semantic-label-normal">
          {title}
        </p>
        <div
          className={`mx-auto flex w-[250px] flex-col ${optionMarginClassName} ${optionGapClassName}`}
        >
          {options.map((option) => {
            const isSelected = selectedOption === option;

            return (
              <button
                aria-pressed={isSelected}
                className="flex w-full justify-center"
                key={option}
                onClick={() => setSelectedOption(option)}
                type="button"
              >
                <span
                  className={`flex w-[250px] items-center justify-center self-stretch whitespace-pre-line rounded-2xl border-[3px] p-3 text-center font-[Pretendard] font-semibold text-[#616161] ${
                    isSelected
                      ? "border-[#FF7658] bg-[#FFF7EF]"
                      : "border-transparent bg-[#F5F5F5]"
                  } ${optionTextClassName}`}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedOption ? (
        <Link className={nextButtonClassName} href={nextHref}>
          {nextButtonContent}
        </Link>
      ) : (
        <span aria-disabled="true" className={nextButtonClassName}>
          {nextButtonContent}
        </span>
      )}
    </>
  );
}
