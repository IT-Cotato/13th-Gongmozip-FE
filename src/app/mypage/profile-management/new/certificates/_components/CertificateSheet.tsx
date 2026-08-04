"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import type { Certificate } from "./CertificateCard";

const CERTIFICATE_CATEGORIES = [
  "어학",
  "컴퓨터/IT",
  "데이터분석/AI",
  "디자인",
  "경영/사무",
  "기타",
] as const;

const TEXTBOX_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

const MIN_CERTIFICATE_YEAR = 1900;

type CertificateSheetProps = {
  onClose: () => void;
  onSubmit: (certificate: Certificate) => void;
};

export function CertificateSheet({ onClose, onSubmit }: CertificateSheetProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [grade, setGrade] = useState("");

  const hasGradeField = category === "어학";
  const currentYear = new Date().getFullYear();
  const isYearComplete = year.length === 4;
  const isYearInRange =
    isYearComplete && Number(year) >= MIN_CERTIFICATE_YEAR && Number(year) <= currentYear;
  const isYearValid = year.length === 0 || isYearInRange;
  const isFormValid =
    category !== null &&
    name.trim().length > 0 &&
    isYearValid &&
    (!hasGradeField || grade.trim().length > 0);

  function handleSelectCategory(next: string) {
    setCategory(next);
    if (next !== "어학") setGrade("");
  }

  function handleSubmit() {
    if (!isFormValid || category === null) return;
    onSubmit({
      name: name.trim(),
      category,
      grade: hasGradeField ? grade.trim() : "",
      year: year.trim(),
    });
    onClose();
  }

  return (
    <BottomSheet onClose={onClose} aria-label="자격증 추가">
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">자격증 추가</h2>
          <p className="text-[13px] leading-[1.5] text-[#949494]">
            유효기간이 아직 유효한 자격증만 등록해주세요.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <p className="px-1 text-[17px] leading-[1.25] font-medium text-[#1f1f1f]">카테고리</p>
          <div className="flex flex-wrap gap-1">
            {CERTIFICATE_CATEGORIES.map((option) => {
              const isActive = category === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleSelectCategory(option)}
                  className={`flex h-8 items-center justify-center rounded-full px-2.5 text-[15px] leading-[1.25] font-semibold ${
                    isActive ? "bg-[#1f1f1f] text-white" : "bg-[rgba(97,97,97,0.1)] text-[#616161]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <div className="flex items-center px-1 text-[17px] leading-[1.25] font-medium text-[#1f1f1f]">
            자격증명
            <span className="text-[#FF7658]">*</span>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="자격증명을 입력하세요"
            className={TEXTBOX_CLASS}
          />
        </div>

        <div className="mt-4 flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <p className="px-1 text-[17px] leading-[1.25] font-medium text-[#1f1f1f]">취득년도</p>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="YYYY"
              className={TEXTBOX_CLASS}
            />
            {isYearComplete && !isYearInRange && (
              <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">
                {MIN_CERTIFICATE_YEAR}~{currentYear}년 사이로 입력해주세요.
              </p>
            )}
          </div>

          {hasGradeField && (
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center px-1 text-[17px] leading-[1.25] font-medium text-[#1f1f1f]">
                점수/등급
                <span className="text-[#FF7658]">*</span>
              </div>
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="ex) 900점"
                className={TEXTBOX_CLASS}
              />
            </div>
          )}
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
          등록하기
        </button>
      </div>
    </BottomSheet>
  );
}
