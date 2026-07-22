"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "./_components/icons";
import { NotRegisteredModal } from "./_components/NotRegisteredModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TODO(backend): 회원 이메일 조회 API 연동 전까지 프론트 테스트용으로 지정한 이메일만 가입된 이메일로 처리
// (src/app/signup/page.tsx의 DEV_DUPLICATE_EMAILS와 동일한 데모 계정)
const REGISTERED_EMAILS = ["gongmozip@gongmo-zip.com"];

const INPUT_CLASS =
  "h-11 w-full rounded-xl bg-[rgba(97,97,97,0.1)] px-5 py-3 text-[13px] leading-[1.5] text-[#1F1F1F] outline-none placeholder:text-[#949494]";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showNotRegisteredModal, setShowNotRegisteredModal] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);

  const isEmailValid = EMAIL_REGEX.test(email);

  function handleBack() {
    router.back();
  }

  function handleSubmit() {
    if (!isEmailValid) return;
    // TODO(backend): 비밀번호 재설정 링크 발송 API 연동 전까지 목데이터로 가입 여부만 임시 판별
    const isRegistered = REGISTERED_EMAILS.includes(email.trim().toLowerCase());
    if (isRegistered) {
      setIsLinkSent(true);
    } else {
      setShowNotRegisteredModal(true);
    }
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
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="absolute left-4 flex h-6 w-6 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-[17px] leading-[1.35] font-semibold text-[#111111]">
            비밀번호 재설정
          </h1>
        </div>

        {!isLinkSent ? (
          <div className="flex flex-1 flex-col">
            <h2 className="px-6 pt-8 pb-2 text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
              회원가입 시 등록한
              <br />
              이메일 주소를 입력해주세요.
            </h2>

            <div className="flex flex-col gap-1 p-4">
              <p className="px-1 text-[17px] leading-[1.25] font-medium text-[#1F1F1F]">
                아이디(이메일)
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gongmozip@gongmo-zip.com"
                className={INPUT_CLASS}
              />
            </div>

            <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-white from-[38.462%] to-white/0 p-4">
              <button
                type="button"
                disabled={!isEmailValid}
                onClick={handleSubmit}
                className={`h-[51px] w-full rounded-[14px] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold transition-colors ${
                  isEmailValid
                    ? "bg-[#FF7658] text-white"
                    : "cursor-not-allowed bg-[#EFEFEF] text-[#C8C8C8]"
                }`}
              >
                비밀번호 재설정 링크 전송
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-2 px-6 pt-8">
              <p className="flex-1 text-[22px] leading-[1.35] font-bold text-[#1F1F1F]">
                비밀번호 변경을 위한
                <br />
                링크가 전송되었습니다.
              </p>
              <Link
                href="/contact"
                className="shrink-0 py-1 text-[13px] leading-[1.25] font-semibold text-[#616161]"
              >
                문의하기
              </Link>
            </div>
            <p className="px-6 pt-2 text-[17px] leading-[1.35] font-medium text-[#616161]">
              메일함을 확인해주세요.
            </p>

            <div className="flex justify-center py-6">
              <Image
                src="/images/passwordChangeCharacter.svg"
                alt=""
                height={274}
                width={274}
                className="w-[274px] max-w-full"
              />
            </div>

            <div className="flex flex-col gap-2.5 rounded-[14px] bg-[#F5F5F5] p-4 mx-4">
              <p className="border-b border-[rgba(97,97,97,0.22)] p-2 text-[15px] leading-[1.25] font-medium text-[#1F1F1F]">
                이메일 수신에 문제가 있나요?
              </p>
              <ul className="flex flex-col gap-1.5 p-2 text-[13px] leading-[1.5] text-[#616161]">
                <li className="ms-[19.5px] list-disc">
                  입력한 이메일 주소가 정확한지 확인해 주세요.
                </li>
                <li className="ms-[19.5px] list-disc">
                  비밀번호 변경 링크 수신까지 최대 3분 정도 소요될 수 있습니다.
                </li>
                <li className="ms-[19.5px] list-disc">
                  스팸 메일함 또는 메일 차단 설정 여부를 확인한 후 인증번호를 다시 요청해 주세요.
                </li>
              </ul>
              <p className="px-2 text-[13px] leading-[1.5] text-[#616161]">
                위 방법을 모두 시도했음에도 메일이 수신되지 않는 경우,{" "}
                <Link href="/contact" className="font-medium text-[#FF7658]">
                  [문의하기]
                </Link>{" "}
                버튼을 통해 문의해 주세요.
                <br />
                신속하게 도움을 드리겠습니다.
              </p>
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
