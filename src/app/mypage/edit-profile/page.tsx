"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "./_components/icons";
import { ApiError } from "@/lib/http";
import {
  useMemberProfileQuery,
  type MemberGender,
  type MemberProfile,
} from "@/queries/useMemberProfileQuery";
import { useUpdateMemberProfileMutation } from "@/queries/useUpdateMemberProfileMutation";

type BirthdateError = "format" | null;

const INPUT_CLASS =
  "h-11 w-full rounded-xl px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

function formatBirthdate(digits: string) {
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  return [y, m, d].filter(Boolean).join("/");
}

function isValidCalendarDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function toDigits(isoDate: string) {
  return isoDate.replace(/\D/g, "").slice(0, 8);
}

function RadioOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex flex-1 items-center gap-2 px-1 py-2"
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          selected ? "border-[#FF7658]" : "border-[rgba(97,97,97,0.22)]"
        }`}
      >
        {selected && <span className="size-[10px] rounded-full bg-[#FF7658]" />}
      </span>
      <span className="text-[15px] leading-[1.25] font-medium text-[#1F1F1F]">{label}</span>
    </button>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading, isError, refetch } = useMemberProfileQuery();

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex items-center justify-center px-4 py-1">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="absolute left-4 flex h-6 w-6 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">회원정보 수정</h1>
      </div>

      {isLoading && (
        <p className="px-4 py-10 text-center text-[13px] text-[#949494]">
          회원정보를 불러오는 중이에요...
        </p>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 px-4 py-10">
          <p className="text-[13px] text-[#949494]">회원정보를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-[#F5F5F5] px-4 py-2 text-[13px] font-medium text-[#1F1F1F]"
          >
            다시 시도
          </button>
        </div>
      )}

      {profile && <EditProfileForm key={profile.email} profile={profile} />}
    </div>
  );
}

function EditProfileForm({ profile }: { profile: MemberProfile }) {
  const router = useRouter();
  const updateProfileMutation = useUpdateMemberProfileMutation();

  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<MemberGender | null>(profile.gender);
  const [birthdate, setBirthdate] = useState(toDigits(profile.birthDate));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isNameValid = name.trim().length > 0;
  const isGenderValid = gender !== null;
  const isBirthdateComplete = birthdate.length === 8;
  const birthdateYear = Number(birthdate.slice(0, 4));
  const birthdateMonth = Number(birthdate.slice(4, 6));
  const birthdateDay = Number(birthdate.slice(6, 8));
  const isBirthdateValid =
    isBirthdateComplete && isValidCalendarDate(birthdateYear, birthdateMonth, birthdateDay);
  const birthdateError: BirthdateError = isBirthdateComplete && !isBirthdateValid ? "format" : null;

  const isFormValid = isNameValid && isGenderValid && isBirthdateValid;

  function handleSubmit() {
    if (!isFormValid || gender === null || updateProfileMutation.isPending) return;

    setSubmitError(null);
    updateProfileMutation.mutate(
      {
        name: name.trim(),
        gender,
        birthDate: `${birthdate.slice(0, 4)}-${birthdate.slice(4, 6)}-${birthdate.slice(6, 8)}`,
      },
      {
        onSuccess: () => router.push("/mypage"),
        onError: (error) => {
          setSubmitError(
            error instanceof ApiError
              ? error.message
              : "회원정보 수정에 실패했습니다. 다시 시도해주세요.",
          );
        },
      },
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center px-1 text-[17px] leading-[1.25]">
            <span className="text-[#1F1F1F]">이메일</span>
            <span className="text-[#FF7658]">*</span>
          </div>
          <div
            className={`${INPUT_CLASS} border border-[rgba(97,97,97,0.08)] bg-[rgba(255,255,255,0.08)]`}
          >
            {profile.email}
          </div>
          {profile.loginProvider === "KAKAO" && (
            <p className="px-1 text-xs leading-[1.35] text-[#949494]">카카오톡 로그인 사용중</p>
          )}
        </div>

        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center px-1 text-[17px] leading-[1.25]">
            <span className="text-[#1F1F1F]">이름</span>
            <span className="text-[#FF7658]">*</span>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해주세요."
            className={`${INPUT_CLASS} bg-[rgba(97,97,97,0.1)]`}
          />
        </div>

        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center px-1 text-[17px] leading-[1.25]">
            <span className="text-[#1F1F1F]">성별</span>
            <span className="text-[#FF7658]">*</span>
          </div>
          <div className="flex items-center gap-8 px-2">
            <RadioOption
              label="남성"
              selected={gender === "MALE"}
              onSelect={() => setGender("MALE")}
            />
            <RadioOption
              label="여성"
              selected={gender === "FEMALE"}
              onSelect={() => setGender("FEMALE")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center px-1 text-[17px] leading-[1.25]">
            <span className="text-[#1F1F1F]">생년월일</span>
            <span className="text-[#FF7658]">*</span>
          </div>
          <input
            inputMode="numeric"
            value={formatBirthdate(birthdate)}
            onChange={(e) => setBirthdate(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="YYYY/MM/DD"
            className={`${INPUT_CLASS} border ${
              birthdateError
                ? "border-[#AC4A35] bg-[rgba(97,97,97,0.1)]"
                : "border-transparent bg-[rgba(97,97,97,0.1)]"
            }`}
          />
          {birthdateError && (
            <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">
              올바른 생년월일을 입력해주세요
            </p>
          )}
        </div>

        {submitError && (
          <p className="px-5 pb-2 text-xs leading-[1.35] text-[#BB5260]">{submitError}</p>
        )}
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
        <button
          type="button"
          disabled={!isFormValid || updateProfileMutation.isPending}
          onClick={handleSubmit}
          className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
            isFormValid && !updateProfileMutation.isPending
              ? "bg-[#FF7658] text-white"
              : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
          }`}
        >
          {updateProfileMutation.isPending ? "수정 중..." : "수정 완료"}
        </button>
      </div>
    </>
  );
}
