"use client";

import { useEffect, useRef, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { useCertificationSearchQuery } from "@/queries/useCertificationSearchQuery";
import type { Certificate } from "./CertificateCard";

const CERTIFICATE_CATEGORIES = [
  "어학",
  "컴퓨터/IT",
  "데이터분석/AI",
  "디자인",
  "경영/사무",
  "기타",
] as const;

// 백엔드 자격증 마스터 검색(categoryCode)과 등록 요청 모두 이 코드를 쓴다.
export const CERTIFICATE_CATEGORY_CODE: Record<string, string> = {
  어학: "LANGUAGE",
  "컴퓨터/IT": "COMPUTER_IT",
  "데이터분석/AI": "DATA_AI",
  디자인: "DESIGN",
  "경영/사무": "MANAGEMENT_OFFICE",
  기타: "OTHER",
};

const TEXTBOX_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

const MIN_CERTIFICATE_YEAR = 1900;
const SEARCH_DEBOUNCE_MS = 300;

type CertificateSheetProps = {
  onClose: () => void;
  onSubmit: (certificate: Certificate) => void;
  initialCertificate?: Certificate;
};

export function CertificateSheet({ onClose, onSubmit, initialCertificate }: CertificateSheetProps) {
  const isEditing = initialCertificate !== undefined;
  const [category, setCategory] = useState<string | null>(initialCertificate?.category ?? null);
  const [name, setName] = useState(initialCertificate?.name ?? "");
  const [year, setYear] = useState(initialCertificate?.year ?? "");
  const [grade, setGrade] = useState(initialCertificate?.grade ?? "");
  const [certificationCode, setCertificationCode] = useState<string | null>(
    initialCertificate?.certificationCode ?? null,
  );
  const [isSuggestionListOpen, setIsSuggestionListOpen] = useState(false);
  const [debouncedName, setDebouncedName] = useState(name);
  const nameFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedName(name.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [name]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!nameFieldRef.current?.contains(event.target as Node)) {
        setIsSuggestionListOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const categoryCode = category ? (CERTIFICATE_CATEGORY_CODE[category] ?? null) : null;
  const certificationSearchQuery = useCertificationSearchQuery(debouncedName, categoryCode);
  // 백엔드 검색은 "포함"으로 매칭해 관계없는 결과까지 섞여 나온다 (예: "a" 입력 시
  // "MOS Access"뿐 아니라 "MOS Master"까지). 자동완성이므로 입력한 문자열로
  // 시작하는 것만 남기도록 FE에서 한 번 더 거른다.
  const suggestions = (certificationSearchQuery.data?.certifications ?? []).filter((item) =>
    item.certificateName.toLowerCase().startsWith(debouncedName.toLowerCase()),
  );
  const allowCustomInput = certificationSearchQuery.data?.allowCustomInput ?? true;
  const shouldShowSuggestions =
    isSuggestionListOpen && certificationCode === null && debouncedName.length > 0;

  const hasGradeField = category === "어학";
  const currentYear = new Date().getFullYear();
  const isYearComplete = year.length === 4;
  const isYearInRange =
    isYearComplete && Number(year) >= MIN_CERTIFICATE_YEAR && Number(year) <= currentYear;
  const isYearValid = year.length === 0 || isYearInRange;
  // 목록에서 고르지 않은(직접 입력) 이름은, 이 카테고리가 직접 입력을 허용하는지
  // 서버 검색이 성공적으로 확인해주기 전까지는 제출을 막는다. 검색이 아직
  // 진행 중이거나 실패한 상태에서 allowCustomInput의 기본값(true)에 기대어
  // 정책을 확인하지 않은 채로 통과시키지 않기 위함.
  const isPolicyConfirmed = certificationSearchQuery.isSuccess;
  const requiresListSelection = isPolicyConfirmed && !allowCustomInput;
  const isTypedNameSubmittable = certificationCode !== null || isPolicyConfirmed;
  const isFormValid =
    category !== null &&
    name.trim().length > 0 &&
    isYearValid &&
    (!hasGradeField || grade.trim().length > 0) &&
    isTypedNameSubmittable &&
    (!requiresListSelection || certificationCode !== null);

  function handleSelectCategory(next: string) {
    setCategory(next);
    if (next !== "어학") setGrade("");
    // 이전 카테고리에서 선택했던 항목은 새 카테고리에서는 더 이상 유효하지
    // 않으므로 선택 상태를 초기화하고, 입력된 이름이 있으면 새 카테고리
    // 기준으로 추천 목록을 다시 보여준다.
    setCertificationCode(null);
    if (name.trim().length > 0) setIsSuggestionListOpen(true);
  }

  function handleNameChange(next: string) {
    setName(next);
    setCertificationCode(null);
    setIsSuggestionListOpen(true);
  }

  function handleSelectSuggestion(item: { certificateName: string; certificationCode: string }) {
    setName(item.certificateName);
    setDebouncedName(item.certificateName);
    setCertificationCode(item.certificationCode);
    setIsSuggestionListOpen(false);
  }

  function handleSubmit() {
    if (!isFormValid || category === null) return;
    onSubmit({
      name: name.trim(),
      category,
      grade: hasGradeField ? grade.trim() : "",
      year: year.trim(),
      certificationCode,
    });
    onClose();
  }

  return (
    <BottomSheet onClose={onClose} aria-label={isEditing ? "자격증 수정" : "자격증 추가"}>
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">
            {isEditing ? "자격증 수정" : "자격증 추가"}
          </h2>
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

        <div ref={nameFieldRef} className="relative mt-4 flex flex-col gap-1">
          <label
            htmlFor="certificate-name"
            className="flex items-center px-1 text-[17px] leading-[1.25] font-medium text-[#1f1f1f]"
          >
            자격증명
            <span className="text-[#FF7658]">*</span>
          </label>
          <input
            id="certificate-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => setIsSuggestionListOpen(true)}
            placeholder="자격증명을 입력하세요"
            role="combobox"
            aria-expanded={shouldShowSuggestions}
            aria-controls="certificate-name-suggestions"
            aria-autocomplete="list"
            autoComplete="off"
            className={TEXTBOX_CLASS}
          />
          {shouldShowSuggestions && suggestions.length > 0 && (
            <ul
              id="certificate-name-suggestions"
              role="listbox"
              className="absolute top-full right-0 left-0 z-10 mt-1 max-h-[400px] overflow-y-auto rounded-xl bg-white px-5 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.1),0_3px_3px_rgba(0,0,0,0.09),0_6px_6px_rgba(0,0,0,0.05),0_10px_10px_rgba(0,0,0,0.01)]"
            >
              {suggestions.map((item) => (
                <li key={item.certificationCode}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={certificationCode === item.certificationCode}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full rounded-xl px-1 py-2 text-left text-[17px] leading-[1.5] font-medium text-[#616161] hover:bg-black/5 active:bg-black/10"
                  >
                    {item.certificateName}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {certificationSearchQuery.isError && certificationCode === null && (
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-xs leading-[1.35] text-[#BB5260]">
                자격증 목록을 불러오지 못했어요.
              </p>
              <button
                type="button"
                onClick={() => certificationSearchQuery.refetch()}
                className="shrink-0 text-xs leading-[1.35] font-semibold text-[#616161] underline"
              >
                다시 시도
              </button>
            </div>
          )}
          {requiresListSelection && certificationCode === null && (
            <p className="px-1 text-xs leading-[1.35] text-[#949494]">
              목록에서 자격증을 선택해주세요.
            </p>
          )}
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
          {isEditing ? "수정하기" : "등록하기"}
        </button>
      </div>
    </BottomSheet>
  );
}
