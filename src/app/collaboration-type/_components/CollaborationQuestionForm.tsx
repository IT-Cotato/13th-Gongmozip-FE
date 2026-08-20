"use client";

import Link from "next/link";

import { useCollaborationTestStore } from "@/stores/collaborationTestStore";

export type CollaborationQuestionOption = {
  displayOrder: number;
  optionId: number;
  optionKey: string;
  optionLabel: string;
  optionValue: string;
};

type CollaborationQuestionFormProps = {
  currentQuestionOrder: number;
  nextHref: string;
  options: CollaborationQuestionOption[];
  previousHref: string;
  questionId: number;
  title: string;
};

function WordBreakText({ text }: { text: string }) {
  return (
    <span aria-label={text} className="flex flex-col items-center">
      {text.split(/\r?\n/).map((line, lineIndex) => (
        <span
          aria-hidden="true"
          className="flex flex-wrap justify-center gap-x-[0.25em]"
          key={`${line}-${lineIndex}`}
        >
          {line
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((word, wordIndex) => (
              <span className="whitespace-nowrap" key={`${word}-${wordIndex}`}>
                {word}
              </span>
            ))}
        </span>
      ))}
    </span>
  );
}

export default function CollaborationQuestionForm({
  currentQuestionOrder,
  nextHref,
  options,
  previousHref,
  questionId,
  title,
}: CollaborationQuestionFormProps) {
  const selectedOptionId = useCollaborationTestStore(
    (state) => state.responses[questionId]?.optionId ?? null,
  );
  const setResponse = useCollaborationTestStore((state) => state.setResponse);
  const isFirstQuestion = currentQuestionOrder === 1;
  const isLikertScaleQuestion = options.length >= 5;
  const optionGapClassName = isLikertScaleQuestion ? "gap-5" : "gap-[21px]";
  const optionMarginClassName = isLikertScaleQuestion ? "mt-5" : "mt-[21px]";
  const optionTextClassName = isLikertScaleQuestion
    ? "h-[60px] text-[15px] leading-[125%]"
    : "h-[101px] text-[15px] leading-[125%]";
  const nextButtonClassName = selectedOptionId
    ? "inline-flex h-8 items-center justify-center gap-[5px] rounded-[14px] bg-[#FF7658] px-2.5 py-[9px] font-[Pretendard] text-[17px] font-normal leading-[125%] text-white"
    : "flex h-8 items-center justify-center gap-[5px] rounded-[14px] bg-[#EFEFEF] px-2.5 py-[9px] font-[Pretendard] text-[17px] font-normal leading-[125%] text-[#C8C8C8]";
  const previousButtonClassName =
    "flex h-8 items-center justify-center gap-[5px] rounded-[14px] bg-[#FF7658] px-2.5 py-[9px] font-[Pretendard] text-[17px] font-normal leading-[125%] text-white";

  const previousButtonContent = (
    <>
      <span
        aria-hidden="true"
        className="h-6 w-6 shrink-0 bg-current"
        style={{
          mask: "url('/itest/button-icon.svg') center / contain no-repeat",
          WebkitMask: "url('/itest/button-icon.svg') center / contain no-repeat",
        }}
      />
      이전
    </>
  );

  const nextButtonContent = (
    <>
      <span
        aria-hidden="true"
        className="h-6 w-6 shrink-0 bg-current"
        style={{
          mask: "url('/images/button-tabler-chevrons-right.svg') center / contain no-repeat",
          WebkitMask: "url('/images/button-tabler-chevrons-right.svg') center / contain no-repeat",
        }}
      />
      다음
    </>
  );

  return (
    <>
      <div className="flex h-[531px] flex-col self-stretch rounded-2xl bg-white px-11 pb-[14px] pt-[22px]">
        <p className="h-[17px] self-stretch text-center font-[Pretendard] text-[17px] font-bold leading-[135%] text-semantic-fill-brand">
          Q{currentQuestionOrder}
        </p>
        <p className="mt-4 flex min-h-8 flex-wrap items-center justify-center self-stretch text-center font-[Pretendard] text-[13px] font-semibold leading-[125%] text-semantic-label-normal">
          <WordBreakText text={title} />
        </p>
        <div
          className={`mx-auto flex w-[250px] flex-col ${optionMarginClassName} ${optionGapClassName}`}
        >
          {options.map((option) => {
            const isSelected = selectedOptionId === option.optionId;

            return (
              <button
                aria-pressed={isSelected}
                className="flex w-full justify-center"
                key={option.optionId}
                onClick={() => setResponse(questionId, option.optionId, option.optionValue)}
                type="button"
              >
                <span
                  className={`flex w-[250px] flex-wrap items-center justify-center self-stretch rounded-2xl border-[3px] p-3 text-center font-[Pretendard] font-semibold text-[#616161] ${
                    isSelected ? "border-[#FF7658] bg-[#FFF7EF]" : "border-transparent bg-[#F5F5F5]"
                  } ${optionTextClassName}`}
                >
                  <WordBreakText text={option.optionLabel} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex w-full items-center justify-between">
        {isFirstQuestion ? (
          <span aria-hidden="true" className="h-8" />
        ) : (
          <Link className={previousButtonClassName} href={previousHref}>
            {previousButtonContent}
          </Link>
        )}

        {selectedOptionId ? (
          <Link className={nextButtonClassName} href={nextHref}>
            {nextButtonContent}
          </Link>
        ) : (
          <button className={nextButtonClassName} disabled type="button">
            {nextButtonContent}
          </button>
        )}
      </div>
    </>
  );
}
