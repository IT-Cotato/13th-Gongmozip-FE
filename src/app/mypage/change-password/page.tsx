"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, CheckIcon } from "./_components/icons";
import { ApiError } from "@/lib/http";
import { useChangePasswordMutation } from "@/queries/useChangePasswordMutation";

const INPUT_CLASS =
  "h-11 w-full rounded-xl px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494] border";

const PASSWORD_CHECKS = [
  { key: "hasLetter", label: "영문", test: (v: string) => /[A-Za-z]/.test(v) },
  { key: "hasNumber", label: "숫자", test: (v: string) => /[0-9]/.test(v) },
  { key: "hasSpecial", label: "특수문자", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
  { key: "hasMinLength", label: "8자리 이상", test: (v: string) => v.length >= 8 },
] as const;

export default function ChangePasswordPage() {
  const router = useRouter();
  const changePasswordMutation = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const checks = PASSWORD_CHECKS.map((c) => ({ ...c, satisfied: c.test(newPassword) }));
  const isNewPasswordValid = checks.every((c) => c.satisfied);
  const isConfirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const isCurrentPasswordValid = currentPassword.length > 0;
  const isFormValid =
    isCurrentPasswordValid && isNewPasswordValid && confirmPassword === newPassword;

  function handleSubmit() {
    if (!isFormValid || changePasswordMutation.isPending) return;

    setSubmitError(null);
    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => router.push("/mypage"),
        onError: (error) => {
          setSubmitError(
            error instanceof ApiError
              ? error.message
              : "비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
          );
        },
      },
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="relative flex items-center justify-center px-4 py-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로가기"
            className="absolute left-4 flex h-6 w-6 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">비밀번호 변경</h1>
        </div>

        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center px-1 text-[17px] leading-[1.25]">
            <span className="text-[#1F1F1F]">현재 비밀번호</span>
            <span className="text-[#FF7658]">*</span>
          </div>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setSubmitError(null);
            }}
            placeholder="현재 비밀번호를 입력해 주세요."
            className={`${INPUT_CLASS} ${
              submitError
                ? "border-[#AC4A35] bg-[rgba(97,97,97,0.1)]"
                : "border-transparent bg-[rgba(97,97,97,0.1)]"
            }`}
          />
          {submitError && (
            <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">{submitError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center px-1 text-[17px] leading-[1.25]">
            <span className="text-[#1F1F1F]">새 비밀번호</span>
            <span className="text-[#FF7658]">*</span>
          </div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="영문, 숫자, 특수문자 8자리 이상"
            className={`${INPUT_CLASS} border-transparent bg-[rgba(97,97,97,0.1)]`}
          />
          <div className="flex items-center gap-1 px-1">
            {checks.map((c) => (
              <span key={c.key} className="flex items-center gap-0.5">
                <CheckIcon active={c.satisfied} />
                <span
                  className={`text-xs leading-[1.35] font-semibold ${
                    c.satisfied ? "text-[#1F1F1F]" : "text-[#949494]"
                  }`}
                >
                  {c.label}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center px-1 text-[17px] leading-[1.25]">
            <span className="text-[#1F1F1F]">새 비밀번호 확인</span>
            <span className="text-[#FF7658]">*</span>
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 재입력해 주세요."
            className={`${INPUT_CLASS} ${
              isConfirmMismatch
                ? "border-[#AC4A35] bg-[rgba(97,97,97,0.1)]"
                : "border-transparent bg-[rgba(97,97,97,0.1)]"
            }`}
          />
          {isConfirmMismatch && (
            <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">
              비밀번호가 일치하지 않습니다
            </p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
        <button
          type="button"
          disabled={!isFormValid || changePasswordMutation.isPending}
          onClick={handleSubmit}
          className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
            isFormValid && !changePasswordMutation.isPending
              ? "bg-[#FF7658] text-white"
              : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
          }`}
        >
          {changePasswordMutation.isPending ? "변경 중..." : "변경 완료"}
        </button>
      </div>
    </div>
  );
}
