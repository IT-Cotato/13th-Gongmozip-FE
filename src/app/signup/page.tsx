"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignupKeyboard } from "./_components/SignupKeyboard";
import { PasswordStep } from "./_components/PasswordStep";
import { InfoStep, type Gender } from "./_components/InfoStep";
import { TermsStep, type TermsState } from "./_components/TermsStep";

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type ActiveField = "name" | "email" | "code" | "birthdate" | null;

const TOTAL_STEPS = 6;

const STEP_TITLE: Record<Step, string> = {
  1: "가입을 위한\n기본 정보를 입력해주세요.",
  2: "로그인에 사용할\n이메일 주소를 입력해주세요.",
  3: "인증번호를\n입력해주세요.",
  4: "로그인에 사용할\n비밀번호를 입력해주세요.",
  5: "회원 정보를\n입력해 주세요.",
  6: "필수 약관에 동의해주세요.",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 300;
// TODO(backend): 백엔드 인증 API 연동 전까지 프론트 테스트용으로 "111111" 입력 시 인증 성공 처리
const DEV_BYPASS_CODE = "111111";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatBirthdate(digits: string) {
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  return [y, m, d].filter(Boolean).join("/");
}

function ChevronLeftIcon() {
  return (
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 1L1 9L9 17"
        stroke="#111827"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [activeField, setActiveField] = useState<ActiveField>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [gender, setGender] = useState<Gender>(null);
  const [birthdate, setBirthdate] = useState("");

  const [terms, setTerms] = useState<TermsState>({
    age14: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  useEffect(() => {
    if (step !== 3 || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  const isNameValid = name.trim().length > 0;
  const isEmailValid = EMAIL_REGEX.test(email);
  const isCodeValid = code === DEV_BYPASS_CODE;

  const isPasswordValid =
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password) &&
    password.length >= 8;
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;

  const isGenderValid = gender !== null;
  const isBirthdateValid = birthdate.length === 8;

  const isRequiredTermsValid = terms.age14 && terms.terms && terms.privacy;

  const isCurrentStepValid = (() => {
    switch (step) {
      case 1:
        return isNameValid;
      case 2:
        return isEmailValid;
      case 3:
        return isCodeValid;
      case 4:
        return isPasswordValid && isConfirmPasswordValid;
      case 5:
        return isGenderValid && isBirthdateValid;
      case 6:
        return isRequiredTermsValid;
      default:
        return false;
    }
  })();

  function handleBack() {
    if (step === 1) {
      router.push("/");
      return;
    }
    setActiveField(null);
    setStep((s) => (s - 1) as Step);
  }

  function handleNext() {
    if (!isCurrentStepValid) return;
    if (step === TOTAL_STEPS) {
      router.push("/");
      return;
    }
    setActiveField(null);
    setStep((s) => (s + 1) as Step);
  }

  function handleResend() {
    setSecondsLeft(RESEND_SECONDS);
  }

  function appendChar(char: string) {
    if (activeField === "name") setName((v) => v + char);
    if (activeField === "email") setEmail((v) => v + char);
    if (activeField === "code" && /\d/.test(char)) {
      setCode((v) => {
        const next = (v + char).slice(0, 6);
        if (next.length === 6) setActiveField(null);
        return next;
      });
    }
    if (activeField === "birthdate" && /\d/.test(char)) {
      setBirthdate((v) => {
        const next = (v + char).slice(0, 8);
        if (next.length === 8) setActiveField(null);
        return next;
      });
    }
  }

  function backspace() {
    if (activeField === "name") setName((v) => v.slice(0, -1));
    if (activeField === "email") setEmail((v) => v.slice(0, -1));
    if (activeField === "code") setCode((v) => v.slice(0, -1));
    if (activeField === "birthdate") setBirthdate((v) => v.slice(0, -1));
  }

  function toggleTermsAll() {
    const allChecked = terms.age14 && terms.terms && terms.privacy && terms.marketing;
    setTerms({
      age14: !allChecked,
      terms: !allChecked,
      privacy: !allChecked,
      marketing: !allChecked,
    });
  }

  function toggleTermsItem(key: keyof TermsState) {
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <main className="flex min-h-screen justify-center bg-white">
      <div className="flex w-full max-w-sm flex-col">
        <div className="relative flex items-center justify-center px-4 py-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="absolute left-4 flex h-6 w-6 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <h2 className="text-base font-semibold text-gray-900">회원가입</h2>
        </div>

        <div className="px-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#FF7658] transition-all"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 px-6 pt-8">
          <div className="mb-8 flex items-start justify-between gap-3">
            <h1 className="text-xl leading-snug font-bold whitespace-pre-line text-gray-900">
              {STEP_TITLE[step]}
            </h1>
            {step === 3 && (
              <Link
                href="/contact"
                className="mt-1 shrink-0 text-xs text-gray-400 underline underline-offset-2"
              >
                문의하기
              </Link>
            )}
          </div>

          {step === 1 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                이름<span className="text-[#FF7658]">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setActiveField("name")}
                placeholder="이름을 입력해주세요"
                className="w-full rounded-xl bg-gray-100 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                이메일<span className="text-[#FF7658]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setActiveField("email")}
                placeholder="gongmozip@university.ac.kr"
                className="w-full rounded-xl bg-gray-100 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">인증번호</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => {
                      const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setCode(next);
                      if (next.length === 6) setActiveField(null);
                    }}
                    onFocus={() => setActiveField("code")}
                    placeholder="6자리 입력"
                    className="w-full rounded-xl bg-gray-100 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-gray-400">
                    {formatTime(secondsLeft)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  className="shrink-0 rounded-xl bg-[#FF7658] px-4 text-sm font-medium text-white"
                >
                  인증번호 재전송
                </button>
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  인증번호 발송에 문제가 있나요?
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-gray-500">
                  <li>• 입력한 이메일 주소가 정확한지 확인해 주세요.</li>
                  <li>• 인증번호 수신까지 최대 3분 정도 소요될 수 있습니다.</li>
                  <li>
                    • 스팸 메일함 또는 메일 차단 설정 여부를 확인한 후 인증번호를 다시 요청해
                    주세요.
                  </li>
                </ul>
                <p className="mt-3 text-xs text-gray-400">
                  위 방법을 모두 시도했음에도 인증번호가 수신되지 않는 경우,{" "}
                  <Link href="/contact" className="font-medium text-[#FF7658]">
                    [문의하기]
                  </Link>{" "}
                  버튼을 통해 문의해 주세요.
                  <br />
                  신속하게 도움을 드리겠습니다.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <PasswordStep
              password={password}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              onChangePassword={setPassword}
              onChangeConfirmPassword={setConfirmPassword}
              onToggleShowPassword={() => setShowPassword((v) => !v)}
              onToggleShowConfirmPassword={() => setShowConfirmPassword((v) => !v)}
            />
          )}

          {step === 5 && (
            <InfoStep
              gender={gender}
              onChangeGender={setGender}
              birthdateDisplay={formatBirthdate(birthdate)}
              onChangeBirthdate={(digits) => {
                setBirthdate(digits);
                if (digits.length === 8) setActiveField(null);
              }}
              onFocusBirthdate={() => setActiveField("birthdate")}
            />
          )}

          {step === 6 && (
            <TermsStep terms={terms} onToggleAll={toggleTermsAll} onToggleItem={toggleTermsItem} />
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            disabled={!isCurrentStepValid}
            onClick={handleNext}
            className={`w-full rounded-xl py-3.5 text-sm font-medium transition-colors ${
              isCurrentStepValid
                ? "bg-[#FF7658] text-white"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            {step === TOTAL_STEPS ? "동의하고 가입 완료하기" : "다음"}
          </button>
        </div>

        {activeField && (
          <SignupKeyboard
            mode={activeField === "code" || activeField === "birthdate" ? "numeric" : "qwerty"}
            onKey={appendChar}
            onBackspace={backspace}
            onDone={() => setActiveField(null)}
          />
        )}
      </div>
    </main>
  );
}
