"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InfoStep, type Gender } from "../_components/InfoStep";
import {
  formatBirthdate,
  isValidCalendarDate,
  calculateAge,
  MIN_AGE,
  type BirthdateError,
} from "../_lib/birthdate";
import { ApiError } from "@/lib/http";
import { useMemberProfileQuery, type MemberProfile } from "@/queries/useMemberProfileQuery";
import { useUpdateMemberProfileMutation } from "@/queries/useUpdateMemberProfileMutation";

function toDigits(isoDate: string | null) {
  return (isoDate ?? "").replace(/\D/g, "").slice(0, 8);
}

function toUiGender(gender: string): Gender {
  if (gender === "MALE") return "male";
  if (gender === "FEMALE") return "female";
  return null;
}

export default function SignupInfoPage() {
  const { data: profile, isLoading, isError, refetch } = useMemberProfileQuery();

  return (
    <main className="flex h-full w-full flex-col overflow-y-auto bg-white">
      {/* 소셜 로그인 신규가입자 전용 화면이라 가입이 이미 완료된 상태다. 뒤로가기를
          누르면 홈으로 이동해버려 혼란을 주므로 버튼 자체를 두지 않는다. */}
      <div className="relative flex items-center justify-center px-4 py-4">
        <h2 className="text-base font-semibold text-gray-900">회원가입</h2>
      </div>

      {isLoading && (
        <p className="px-6 py-16 text-center text-[13px] text-[#949494]">
          회원정보를 불러오는 중이에요...
        </p>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 px-6 py-16">
          <p className="text-[13px] text-[#949494]">회원정보를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-gray-100 px-4 py-2 text-[13px] font-medium text-gray-800"
          >
            다시 시도
          </button>
        </div>
      )}

      {profile && <SignupInfoForm key={profile.email} profile={profile} />}
    </main>
  );
}

function SignupInfoForm({ profile }: { profile: MemberProfile }) {
  const router = useRouter();
  const updateProfileMutation = useUpdateMemberProfileMutation();

  const [gender, setGender] = useState<Gender>(toUiGender(profile.gender));
  const [birthdate, setBirthdate] = useState(toDigits(profile.birthDate));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isGenderValid = gender !== null;
  const isBirthdateComplete = birthdate.length === 8;
  const birthdateYear = Number(birthdate.slice(0, 4));
  const birthdateMonth = Number(birthdate.slice(4, 6));
  const birthdateDay = Number(birthdate.slice(6, 8));
  const isBirthdateFormatValid =
    isBirthdateComplete && isValidCalendarDate(birthdateYear, birthdateMonth, birthdateDay);
  const isBirthdateAgeValid =
    isBirthdateFormatValid && calculateAge(birthdateYear, birthdateMonth, birthdateDay) >= MIN_AGE;
  const birthdateError: BirthdateError = !isBirthdateComplete
    ? null
    : !isBirthdateFormatValid
      ? "format"
      : !isBirthdateAgeValid
        ? "age"
        : null;

  const isFormValid = isGenderValid && isBirthdateAgeValid;

  function handleSubmit() {
    if (!isFormValid || gender === null || updateProfileMutation.isPending) return;

    setSubmitError(null);
    updateProfileMutation.mutate(
      {
        name: profile.name ?? "",
        gender: gender === "male" ? "MALE" : "FEMALE",
        birthDate: `${birthdate.slice(0, 4)}-${birthdate.slice(4, 6)}-${birthdate.slice(6, 8)}`,
      },
      {
        onSuccess: () => router.replace("/signup/complete"),
        onError: (error) => {
          setSubmitError(
            error instanceof ApiError
              ? error.message
              : "회원정보 저장에 실패했습니다. 다시 시도해주세요.",
          );
        },
      },
    );
  }

  return (
    <>
      <div className="flex-1 px-6 pt-8">
        <h1 className="mb-8 text-xl leading-snug font-bold whitespace-pre-line text-gray-900">
          회원 정보를{"\n"}입력해 주세요.
        </h1>

        <InfoStep
          gender={gender}
          onChangeGender={setGender}
          birthdateDisplay={formatBirthdate(birthdate)}
          onChangeBirthdate={setBirthdate}
          birthdateError={birthdateError}
        />

        {submitError && <p className="mt-4 text-xs text-[#FF5A5A]">{submitError}</p>}
      </div>

      <div className="px-6 pb-6">
        <button
          type="button"
          disabled={!isFormValid || updateProfileMutation.isPending}
          onClick={handleSubmit}
          className={`w-full rounded-xl py-3.5 text-sm font-medium transition-colors ${
            isFormValid && !updateProfileMutation.isPending
              ? "bg-[#FF7658] text-white"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          {updateProfileMutation.isPending ? "저장 중..." : "가입 완료하기"}
        </button>
      </div>
    </>
  );
}
