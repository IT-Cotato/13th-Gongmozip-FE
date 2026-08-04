"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeamMatchingProgress from "@/components/team-matching/TeamMatchingProgress";
import { EditIcon } from "../../_components/icons";
import { CheckCircleIcon, CloseIcon } from "../_components/icons";

const INPUT_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

const GPA_FORMAT_REGEX = /^\d+(\.\d{1,2})?$/;

function FieldLabel({
  label,
  htmlFor,
  required,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center px-1 text-[17px] leading-[1.25] font-medium text-[#1f1f1f]"
    >
      {label}
      {required && <span className="text-[#FF7658]">*</span>}
    </label>
  );
}

// TODO: 프로필 목록 조회 API 연동 및 다음 단계(자기소개 등) 화면 구현 예정
export default function CreateProfilePage() {
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [major, setMajor] = useState("");
  const [doubleMajor, setDoubleMajor] = useState("");
  const [minor, setMinor] = useState("");
  const [gpa, setGpa] = useState("");
  const [gpaScale, setGpaScale] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  const isGpaValid =
    GPA_FORMAT_REGEX.test(gpa.trim()) &&
    GPA_FORMAT_REGEX.test(gpaScale.trim()) &&
    Number(gpa) <= Number(gpaScale);

  const isFormValid =
    nickname.trim().length > 0 &&
    school.trim().length > 0 &&
    major.trim().length > 0 &&
    isGpaValid;

  function handleNext() {
    if (!isFormValid) return;
    // TODO: 입력값을 다음 단계로 전달(상태 관리 도입) 구현 예정
    router.push("/mypage/profile-management/new/experience");
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex h-[46px] shrink-0 items-center justify-center px-4">
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111827]">프로필 작성</h1>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="닫기"
          className="absolute right-4 flex h-[38px] w-[38px] items-center justify-center rounded-[14px]"
        >
          <CloseIcon />
        </button>
      </div>

      <TeamMatchingProgress currentStep={1} totalSteps={3} />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-9 pt-[22px] pb-10">
          <section className="flex flex-col gap-4">
            <h2 className="px-4 text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">기본 정보</h2>
            <div className="flex items-center gap-4 px-6">
              <div className="relative shrink-0">
                <div className="size-[70px] rounded-full bg-[#efefef]" />
                <button
                  type="button"
                  aria-label="프로필 사진 변경"
                  className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border border-[rgba(97,97,97,0.22)] bg-white"
                >
                  <EditIcon />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <FieldLabel label="닉네임" htmlFor="nickname" required />
                <input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="김철수"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="px-4 text-[22px] leading-[1.35] font-bold text-[#1f1f1f]">학적 정보</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-4 px-5">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel label="학교" htmlFor="school" required />
                  <input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="학교명"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="flex w-20 flex-col gap-1">
                  <FieldLabel label="학년" htmlFor="grade" />
                  <input
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="ex) 3"
                    inputMode="numeric"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 px-5">
                <FieldLabel label="전공" htmlFor="major" required />
                <input
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="전공 및 학위"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col gap-1 px-5">
                <FieldLabel label="복수전공" htmlFor="doubleMajor" />
                <input
                  id="doubleMajor"
                  value={doubleMajor}
                  onChange={(e) => setDoubleMajor(e.target.value)}
                  placeholder="전공 및 학위"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col gap-1 px-5">
                <FieldLabel label="부전공" htmlFor="minor" />
                <input
                  id="minor"
                  value={minor}
                  onChange={(e) => setMinor(e.target.value)}
                  placeholder="전공 및 학위"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex items-end gap-1 px-5">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel label="학점" htmlFor="gpa" required />
                  <input
                    id="gpa"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder="ex) 3.5"
                    inputMode="decimal"
                    className={INPUT_CLASS}
                  />
                </div>
                <span className="pb-3 text-[15px] leading-[1.25] font-semibold text-[#949494]">
                  /
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <input
                    id="gpaScale"
                    value={gpaScale}
                    onChange={(e) => setGpaScale(e.target.value)}
                    placeholder="기준 학점"
                    aria-label="기준 학점"
                    inputMode="decimal"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-1 px-4">
            <button
              type="button"
              onClick={() => setSaveAsDefault((prev) => !prev)}
              aria-pressed={saveAsDefault}
              className="flex items-center gap-1"
            >
              <span className="flex size-6 shrink-0 items-center justify-center">
                {saveAsDefault ? (
                  <CheckCircleIcon />
                ) : (
                  <span className="block size-6 rounded-full border-2 border-[#c8c8c8]" />
                )}
              </span>
              <span className="text-[13px] leading-[1.25] font-semibold text-[#616161]">
                기본값으로 저장
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-2.5 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-12 flex-1 rounded-[14px] border border-[rgba(97,97,97,0.5)] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold text-[#616161]"
        >
          이전
        </button>
        <button
          type="button"
          disabled={!isFormValid}
          onClick={handleNext}
          className={`h-12 flex-1 rounded-[14px] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
            isFormValid
              ? "bg-[#FF7658] text-white"
              : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
