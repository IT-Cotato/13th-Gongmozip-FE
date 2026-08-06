"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { Toggle } from "@/app/mypage/settings/_components/Toggle";
import { CalendarIcon, ChevronDownIcon } from "../../../_components/icons";
import { MonthYearPickerPopup } from "./MonthYearPickerPopup";

const PROJECT_CATEGORIES = ["공모전 출품", "교내 프로젝트", "대외활동 프로젝트"] as const;
type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

const CONTENT_MAX_LENGTH = 300;

const TEXTBOX_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

export type ProjectExperienceInput = {
  name: string;
  startMonth: string;
  endMonth: string;
  category: ProjectCategory;
  content: string;
  hasAward: boolean;
  awardName: string;
};

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-");
  return `${year}.${month}`;
}

function FieldLabel({
  label,
  required,
  muted,
}: {
  label: string;
  required?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center px-1 text-[17px] leading-[1.25] font-medium ${
        muted ? "text-[#949494]" : "text-[#1f1f1f]"
      }`}
    >
      {label}
      {required && <span className="text-[#FF7658]">*</span>}
    </div>
  );
}

type ProjectExperienceSheetProps = {
  onClose: () => void;
  onSubmit: (project: ProjectExperienceInput) => void;
  initialProject?: ProjectExperienceInput;
};

export function ProjectExperienceSheet({
  onClose,
  onSubmit,
  initialProject,
}: ProjectExperienceSheetProps) {
  const isEditing = initialProject !== undefined;
  const [name, setName] = useState(initialProject?.name ?? "");
  const [startMonth, setStartMonth] = useState(initialProject?.startMonth ?? "");
  const [endMonth, setEndMonth] = useState(initialProject?.endMonth ?? "");
  const [category, setCategory] = useState<ProjectCategory | null>(
    initialProject?.category ?? null,
  );
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [content, setContent] = useState(initialProject?.content ?? "");
  const [hasAward, setHasAward] = useState(initialProject?.hasAward ?? false);
  const [awardName, setAwardName] = useState(initialProject?.awardName ?? "");
  const [activeDateField, setActiveDateField] = useState<"start" | "end" | null>(null);

  const isPeriodValid = !startMonth || !endMonth || startMonth <= endMonth;
  const isFormValid = name.trim().length > 0 && category !== null && isPeriodValid;

  function handleSubmit() {
    if (!isFormValid || category === null) return;
    onSubmit({
      name: name.trim(),
      startMonth,
      endMonth,
      category,
      content,
      hasAward,
      awardName: hasAward ? awardName.trim() : "",
    });
    onClose();
  }

  function handleSelectCategory(next: ProjectCategory) {
    setCategory(next);
    setIsCategoryOpen(false);
  }

  return (
    <BottomSheet
      onClose={onClose}
      aria-label={isEditing ? "프로젝트 경험 수정" : "프로젝트 경험 추가"}
    >
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">프로젝트 경험</h2>
          <p className="text-[13px] leading-[1.5] text-[#949494]">
            자신이 경험한 것에 대해 정확하게 입력할 수록
            <br />더 잘 맞는 팀을 만날 수 있어요.
          </p>
        </div>

        <div className="mt-[14px] flex flex-col gap-[17px]">
          <div className="flex flex-col gap-1">
            <FieldLabel label="프로젝트명" required />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex) 마케팅 팀프로젝트"
              className={TEXTBOX_CLASS}
            />
          </div>

          <div className="relative flex flex-col gap-1">
            <div className="flex items-end gap-1">
              <div className="flex flex-1 flex-col gap-1">
                <FieldLabel label="프로젝트 기간" />
                <button
                  type="button"
                  onClick={() => setActiveDateField((prev) => (prev === "start" ? null : "start"))}
                  className="flex h-11 w-full items-center justify-between rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-left text-[13px] leading-[1.5]"
                >
                  <span className={startMonth ? "text-[#1F1F1F]" : "text-[#949494]"}>
                    {startMonth ? formatMonthLabel(startMonth) : "시작 년월"}
                  </span>
                  <CalendarIcon />
                </button>
              </div>

              <span className="pb-3 text-[15px] leading-[1.25] font-semibold text-[#949494]">
                ~
              </span>

              <div className="flex flex-1 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveDateField((prev) => (prev === "end" ? null : "end"))}
                  className="flex h-11 w-full items-center justify-between rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-left text-[13px] leading-[1.5]"
                >
                  <span className={endMonth ? "text-[#1F1F1F]" : "text-[#949494]"}>
                    {endMonth ? formatMonthLabel(endMonth) : "종료 년월"}
                  </span>
                  <CalendarIcon />
                </button>
              </div>
            </div>

            {!isPeriodValid && (
              <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">
                종료 년월은 시작 년월보다 빠를 수 없어요.
              </p>
            )}

            {activeDateField && (
              <>
                <button
                  type="button"
                  aria-label="날짜 선택 닫기"
                  onClick={() => setActiveDateField(null)}
                  className="fixed inset-0 z-40"
                />
                <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full">
                  <MonthYearPickerPopup
                    value={activeDateField === "start" ? startMonth : endMonth}
                    onSelect={(next) => {
                      if (activeDateField === "start") {
                        setStartMonth(next);
                      } else {
                        setEndMonth(next);
                      }
                      setActiveDateField(null);
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="relative flex flex-col gap-1">
            <FieldLabel label="프로젝트 카테고리" required />
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isCategoryOpen}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-[rgba(97,97,97,0.08)] bg-[rgba(255,255,255,0.8)] px-5 py-3 text-left text-[13px] leading-[1.5]"
            >
              <span className={category ? "text-[#1f1f1f]" : "text-[#949494]"}>
                {category ?? "해당 프로젝트의 카테고리를 선택해주세요."}
              </span>
              <ChevronDownIcon className={isCategoryOpen ? "rotate-180" : ""} />
            </button>

            {isCategoryOpen && (
              <>
                <button
                  type="button"
                  aria-label="카테고리 선택 닫기"
                  onClick={() => setIsCategoryOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <ul
                  role="listbox"
                  className="absolute top-[calc(100%+4px)] left-0 z-50 w-full overflow-hidden rounded-xl bg-white px-5 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.1),0_3px_3px_rgba(0,0,0,0.09),0_6px_3px_rgba(0,0,0,0.05),0_10px_4px_rgba(0,0,0,0.01)]"
                >
                  {PROJECT_CATEGORIES.map((option) => (
                    <li key={option} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={category === option}
                        onClick={() => handleSelectCategory(option)}
                        className={`w-full py-2 text-left text-[17px] leading-[1.5] ${
                          category === option
                            ? "font-semibold text-[#ac4a35]"
                            : "font-medium text-[#616161]"
                        }`}
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="flex h-[155px] flex-col gap-1">
            <FieldLabel label="프로젝트 내용" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX_LENGTH))}
              maxLength={CONTENT_MAX_LENGTH}
              placeholder="프로젝트 내용을 입력해주세요 (최대 300자)"
              className="w-full flex-1 resize-none rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]"
            />
            <p className="text-right text-xs leading-[1.35] text-[#616161]">300자 제한</p>
          </div>

          <div className="relative flex flex-col gap-1">
            <div className="absolute top-0 right-0 flex items-center gap-1">
              <span className="text-[15px] leading-[1.35] text-[#1f1f1f]">수상여부</span>
              <Toggle
                checked={hasAward}
                onChange={() => setHasAward((prev) => !prev)}
                label="수상여부"
              />
            </div>
            <FieldLabel label="프로젝트 수상내용" muted={!hasAward} />
            <input
              value={awardName}
              onChange={(e) => setAwardName(e.target.value)}
              disabled={!hasAward}
              placeholder="수상명을 입력해주세요."
              className={`h-11 w-full rounded-xl border px-5 py-3 text-[13px] leading-[1.5] outline-none ${
                hasAward
                  ? "border-transparent bg-[rgba(97,97,97,0.1)] text-[#1F1F1F] placeholder:text-[#949494]"
                  : "border-[#e8e8e8] bg-[#efefef] text-[#c8c8c8] placeholder:text-[#c8c8c8]"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
        <button
          type="button"
          disabled={!isFormValid}
          onClick={handleSubmit}
          className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
            isFormValid
              ? "bg-[#FF7658] text-white"
              : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
          }`}
        >
          {isEditing ? "수정하기" : "등록하기"}
        </button>
      </div>
    </BottomSheet>
  );
}
