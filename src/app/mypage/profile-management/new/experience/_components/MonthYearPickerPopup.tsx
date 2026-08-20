"use client";

import { useState } from "react";
import { ChevronLeftSmallIcon, ChevronRightSmallIcon } from "../../../_components/icons";

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

function parseMonthValue(value: string) {
  if (!value) return { year: null, month: null };
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

type MonthYearPickerPopupProps = {
  value: string;
  onSelect: (value: string) => void;
  className?: string;
  // 이 년월 이후는 선택할 수 없다("YYYY-MM"). 미입력 시 제한 없음.
  maxMonthValue?: string;
};

export function MonthYearPickerPopup({
  value,
  onSelect,
  className = "",
  maxMonthValue,
}: MonthYearPickerPopupProps) {
  const { year: selectedYear, month: selectedMonth } = parseMonthValue(value);
  const [displayedYear, setDisplayedYear] = useState(selectedYear ?? new Date().getFullYear());
  const { year: maxYear, month: maxMonth } = maxMonthValue
    ? parseMonthValue(maxMonthValue)
    : { year: null, month: null };
  const isNextYearDisabled = maxYear !== null && displayedYear >= maxYear;

  return (
    <div
      className={`flex flex-col items-center rounded-2xl bg-white px-4 pt-2 pb-4 shadow-[0_1px_1px_rgba(0,0,0,0.1),0_3px_3px_rgba(0,0,0,0.09),0_6px_3px_rgba(0,0,0,0.05),0_10px_4px_rgba(0,0,0,0.01)] ${className}`}
    >
      <div className="flex w-full items-center justify-center">
        <button
          type="button"
          aria-label="이전 연도"
          onClick={() => setDisplayedYear((prev) => prev - 1)}
          className="flex size-[38px] shrink-0 items-center justify-center rounded-[14px]"
        >
          <ChevronLeftSmallIcon />
        </button>
        <p className="flex-1 text-center text-[20px] leading-[1.35] font-medium text-[#1f1f1f]">
          {displayedYear}년
        </p>
        <button
          type="button"
          aria-label="다음 연도"
          onClick={() => setDisplayedYear((prev) => prev + 1)}
          disabled={isNextYearDisabled}
          className="flex size-[38px] shrink-0 items-center justify-center rounded-[14px] disabled:opacity-30"
        >
          <ChevronRightSmallIcon />
        </button>
      </div>

      <div className="grid w-full grid-cols-4">
        {MONTH_LABELS.map((label, index) => {
          const month = index + 1;
          const isActive = displayedYear === selectedYear && month === selectedMonth;
          const isDisabled =
            maxYear !== null &&
            maxMonth !== null &&
            (displayedYear > maxYear || (displayedYear === maxYear && month > maxMonth));
          return (
            <button
              key={label}
              type="button"
              aria-pressed={isActive}
              disabled={isDisabled}
              onClick={() => onSelect(`${displayedYear}-${String(month).padStart(2, "0")}`)}
              className={`flex h-[39px] items-center justify-center p-[10px] text-[15px] leading-[1.25] font-medium ${
                isDisabled
                  ? "cursor-not-allowed text-[#c8c8c8]"
                  : isActive
                    ? "text-[#ac4a35]"
                    : "text-[#616161]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
