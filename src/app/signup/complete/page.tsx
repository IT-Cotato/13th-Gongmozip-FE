"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ChevronLeftIcon } from "../_components/icons";

const AUTO_ADVANCE_MS = 10000;

export default function SignupCompletePage() {
  const router = useRouter();
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    autoAdvanceTimerRef.current = setTimeout(() => {
      router.replace("/");
    }, AUTO_ADVANCE_MS);

    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [router]);

  function clearAutoAdvance() {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
  }

  function handleBack() {
    clearAutoAdvance();
    router.push("/");
  }

  function handleGoToTest() {
    clearAutoAdvance();
    router.push("/collaboration-type");
  }

  function handleSkip() {
    clearAutoAdvance();
    router.push("/");
  }

  return (
    <main className="flex h-full w-full flex-col overflow-y-auto bg-white">
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

        <div className="flex-1 px-6 pt-6">
          <h1 className="mb-2 text-xl font-bold text-gray-900">반갑습니다! :)</h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            공모전 수상을 위한 최고의 팀 매칭 서비스,
            <br />
            공모집에 가입하신 걸 축하해요 !
          </p>

          <div className="relative mb-6 flex h-[190px] items-center justify-center">
            <Image
              src="/images/signup/Vector%20(4).svg"
              alt=""
              className="absolute top-1/2 left-1/2 w-56 -translate-x-1/2 -translate-y-1/2"
              height={224}
              width={224}
            />
            <Image
              src="/images/signup/finalScreenCharacter.svg"
              alt="가입을 축하하는 공모집 캐릭터들"
              className="relative w-full max-w-[260px]"
              height={190}
              width={260}
            />
          </div>

          <div className="mb-8 rounded-xl bg-gray-50 p-4">
            <p className="text-sm leading-relaxed text-gray-700">
              공모집은 협업 유형을 기반으로
              <br />
              시너지 좋은 공모전 팀원을 추천해드려요 !
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              • 검사를 완료해야 팀 매칭 기능을 이용하실 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 px-6 pb-8">
          <button
            type="button"
            onClick={handleGoToTest}
            className="w-full rounded-xl bg-[#FF7658] py-3.5 text-sm font-medium text-white"
          >
            협업 유형 검사 바로 가기
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-gray-400 underline underline-offset-2"
          >
            검사 건너뛰고 공모전 시작하기
          </button>
        </div>
    </main>
  );
}
