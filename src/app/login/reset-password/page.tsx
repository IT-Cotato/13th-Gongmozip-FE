"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "./_components/icons";
import { NotRegisteredModal } from "./_components/NotRegisteredModal";
import { ApiError } from "@/lib/http";
import { useSendPasswordResetCodeMutation } from "@/queries/useSendPasswordResetCodeMutation";
import { useVerifyPasswordResetCodeMutation } from "@/queries/useVerifyPasswordResetCodeMutation";
import { useResetPasswordMutation } from "@/queries/useResetPasswordMutation";

type Step = "email" | "code" | "newPassword" | "done";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MEMBER_NOT_FOUND_CODE = "MEMBER_404_1";
const RESEND_SECONDS = 300;

const PASSWORD_CHECKS = [
  { key: "hasLetter", label: "영문", test: (v: string) => /[A-Za-z]/.test(v) },
  { key: "hasNumber", label: "숫자", test: (v: string) => /[0-9]/.test(v) },
  { key: "hasSpecial", label: "특수문자", test: (v: string) => /[^A-Za-z0-9\s]/.test(v) },
  { key: "hasMinLength", label: "8자리 이상", test: (v: string) => v.length >= 8 && !/\s/.test(v) },
  { key: "hasMaxLength", label: "20자리 이하", test: (v: string) => v.length <= 20 },
] as const;

const INPUT_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [showNotRegisteredModal, setShowNotRegisteredModal] = useState(false);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordResetToken, setPasswordResetToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);

  const sendCodeMutation = useSendPasswordResetCodeMutation();
  const verifyCodeMutation = useVerifyPasswordResetCodeMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  useEffect(() => {
    if (step !== "code" || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  const isEmailValid = EMAIL_REGEX.test(email);
  const isCodeComplete = code.length === 6;
  const passwordChecks = PASSWORD_CHECKS.map((c) => ({ ...c, satisfied: c.test(newPassword) }));
  const isNewPasswordValid = passwordChecks.every((c) => c.satisfied);
  const isConfirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const isPasswordStepValid =
    isNewPasswordValid && confirmPassword.length > 0 && confirmPassword === newPassword;

  function handleBack() {
    if (step === "email") {
      router.back();
      return;
    }
    if (step === "code") {
      setStep("email");
      return;
    }
    if (step === "newPassword") {
      setStep("code");
      return;
    }
  }

  function handleSendCode() {
    if (!isEmailValid || sendCodeMutation.isPending) return;
    setSendCodeError(null);
    sendCodeMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setSecondsLeft(RESEND_SECONDS);
          setCodeError(null);
          setCode("");
          setStep("code");
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === MEMBER_NOT_FOUND_CODE) {
            setShowNotRegisteredModal(true);
            return;
          }
          setSendCodeError(
            error instanceof ApiError ? error.message : "인증코드 전송에 실패했습니다.",
          );
        },
      },
    );
  }

  function handleVerifyCode() {
    if (!isCodeComplete || verifyCodeMutation.isPending) return;
    setCodeError(null);
    verifyCodeMutation.mutate(
      { email, code },
      {
        onSuccess: (data) => {
          setPasswordResetToken(data.passwordResetToken);
          setStep("newPassword");
        },
        onError: (error) => {
          setCodeError(error instanceof ApiError ? error.message : "인증코드 확인에 실패했습니다.");
        },
      },
    );
  }

  function handleResendCode() {
    if (sendCodeMutation.isPending) return;
    setSendCodeError(null);
    sendCodeMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setSecondsLeft(RESEND_SECONDS);
          setCodeError(null);
        },
        onError: (error) => {
          setCodeError(
            error instanceof ApiError ? error.message : "인증코드 재전송에 실패했습니다.",
          );
        },
      },
    );
  }

  function handleResetPassword() {
    if (!isPasswordStepValid || !passwordResetToken || resetPasswordMutation.isPending) return;
    setResetError(null);
    resetPasswordMutation.mutate(
      { token: passwordResetToken, newPassword, newPasswordConfirm: confirmPassword },
      {
        onSuccess: () => setStep("done"),
        onError: (error) => {
          setResetError(
            error instanceof ApiError ? error.message : "비밀번호 재설정에 실패했습니다.",
          );
        },
      },
    );
  }

  function handleGoToLogin() {
    router.push("/login/email");
  }

  function handleGoToSignup() {
    router.push("/signup");
  }

  return (
    <main className="flex h-full w-full flex-col overflow-y-auto bg-white">
      <div className="relative flex items-center justify-center px-4 py-1">
        {step !== "done" && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="absolute left-4 flex h-6 w-6 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
        )}
        <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">비밀번호 재설정</h1>
      </div>

      {step === "email" && (
        <div className="flex flex-1 flex-col">
          <h2 className="px-6 pt-8 pb-2 text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
            회원가입 시 등록한
            <br />
            이메일 주소를 입력해주세요.
          </h2>

          <div className="flex flex-col gap-1 p-4">
            <label
              htmlFor="reset-email"
              className="px-1 text-[17px] leading-[1.25] font-medium text-[#1F1F1F]"
            >
              아이디(이메일)
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSendCodeError(null);
              }}
              placeholder="gongmozip@gongmo-zip.com"
              className={INPUT_CLASS}
            />
            {sendCodeError && (
              <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">{sendCodeError}</p>
            )}
          </div>

          <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
            <button
              type="button"
              disabled={!isEmailValid || sendCodeMutation.isPending}
              onClick={handleSendCode}
              className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
                isEmailValid && !sendCodeMutation.isPending
                  ? "bg-[#FF7658] text-white"
                  : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
              }`}
            >
              {sendCodeMutation.isPending ? "전송 중..." : "인증코드 전송"}
            </button>
          </div>
        </div>
      )}

      {step === "code" && (
        <div className="flex flex-1 flex-col">
          <h2 className="px-6 pt-8 pb-2 text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
            이메일로 전송된
            <br />
            인증코드를 입력해주세요.
          </h2>

          <div className="flex flex-col gap-1 p-4">
            <label
              htmlFor="reset-code"
              className="px-1 text-[17px] leading-[1.25] font-medium text-[#1F1F1F]"
            >
              인증코드
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="reset-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setCodeError(null);
                  }}
                  placeholder="6자리 입력"
                  className={INPUT_CLASS}
                />
                <span className="absolute top-1/2 right-5 -translate-y-1/2 text-xs text-[#949494]">
                  {formatTime(secondsLeft)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={sendCodeMutation.isPending}
                className="shrink-0 rounded-xl bg-[#FF7658] px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {sendCodeMutation.isPending ? "전송 중..." : "재전송"}
              </button>
            </div>
            {codeError && <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">{codeError}</p>}
          </div>

          <div className="mx-4 flex flex-col gap-2.5 rounded-[14px] bg-[#F5F5F5] p-4">
            <p className="border-b border-[rgba(97,97,97,0.22)] p-2 text-[15px] leading-[1.25] font-medium text-[#1F1F1F]">
              인증코드 수신에 문제가 있나요?
            </p>
            <ul className="flex flex-col gap-1.5 p-2 text-[13px] leading-[1.5] text-[#616161]">
              <li className="ms-[19.5px] list-disc">
                입력한 이메일 주소가 정확한지 확인해 주세요.
              </li>
              <li className="ms-[19.5px] list-disc">
                인증코드 수신까지 최대 3분 정도 소요될 수 있습니다.
              </li>
              <li className="ms-[19.5px] list-disc">
                스팸 메일함 또는 메일 차단 설정 여부를 확인한 후 재전송해 주세요.
              </li>
            </ul>
          </div>

          <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
            <button
              type="button"
              disabled={!isCodeComplete || verifyCodeMutation.isPending}
              onClick={handleVerifyCode}
              className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
                isCodeComplete && !verifyCodeMutation.isPending
                  ? "bg-[#FF7658] text-white"
                  : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
              }`}
            >
              {verifyCodeMutation.isPending ? "확인 중..." : "다음"}
            </button>
          </div>
        </div>
      )}

      {step === "newPassword" && (
        <div className="flex flex-1 flex-col">
          <h2 className="px-6 pt-8 pb-2 text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
            로그인에 사용할
            <br />새 비밀번호를 입력해주세요.
          </h2>

          <div className="flex flex-col gap-1 p-4">
            <label
              htmlFor="reset-new-password"
              className="px-1 text-[17px] leading-[1.25] font-medium text-[#1F1F1F]"
            >
              새 비밀번호
            </label>
            <input
              id="reset-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setResetError(null);
              }}
              placeholder="영문, 숫자, 특수문자 8자리 이상"
              className={INPUT_CLASS}
            />
            <div className="flex items-center gap-1.5 px-1">
              {passwordChecks.map((c, i) => (
                <span key={c.key} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-[#C8C8C8]">·</span>}
                  <span
                    className={`text-xs leading-[1.35] font-semibold ${
                      c.satisfied ? "text-[#FF7658]" : "text-[#949494]"
                    }`}
                  >
                    {c.label}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 p-4">
            <label
              htmlFor="reset-confirm-password"
              className="px-1 text-[17px] leading-[1.25] font-medium text-[#1F1F1F]"
            >
              새 비밀번호 확인
            </label>
            <input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 재입력해 주세요."
              className={INPUT_CLASS}
            />
            {isConfirmMismatch && (
              <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
            {resetError && (
              <p className="px-1 text-xs leading-[1.35] text-[#BB5260]">{resetError}</p>
            )}
          </div>

          <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
            <button
              type="button"
              disabled={!isPasswordStepValid || resetPasswordMutation.isPending}
              onClick={handleResetPassword}
              className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
                isPasswordStepValid && !resetPasswordMutation.isPending
                  ? "bg-[#FF7658] text-white"
                  : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
              }`}
            >
              {resetPasswordMutation.isPending ? "변경 중..." : "비밀번호 재설정 완료"}
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2 px-6 pt-8">
            <p className="flex-1 text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
              비밀번호가
              <br />
              성공적으로 변경되었습니다.
            </p>
            <Link
              href="/contact"
              className="shrink-0 py-1 text-[13px] leading-[1.25] font-semibold text-[#616161]"
            >
              문의하기
            </Link>
          </div>
          <p className="px-6 pt-2 text-[17px] leading-[1.35] font-medium text-[#616161]">
            새 비밀번호로 로그인해주세요.
          </p>

          <div className="flex justify-center py-6">
            <Image
              src="/images/login/passwordChangeCharacter.svg"
              alt=""
              height={274}
              width={274}
              className="w-[274px] max-w-full"
            />
          </div>

          <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
            <button
              type="button"
              onClick={handleGoToLogin}
              className="h-[51px] w-full rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
            >
              로그인 화면으로
            </button>
          </div>
        </div>
      )}

      {showNotRegisteredModal && (
        <NotRegisteredModal onGoToLogin={handleGoToLogin} onGoToSignup={handleGoToSignup} />
      )}
    </main>
  );
}
