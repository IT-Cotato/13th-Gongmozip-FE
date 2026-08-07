"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import TeamMatchingHeader from "@/components/team-matching/TeamMatchingHeader";
import { ApiError } from "@/lib/http";
import { useSurveyStatusQuery } from "@/queries/useSurveyStatusQuery";

const COLLABORATION_TYPE_RETURN_TO_STORAGE_KEY = "collaborationTypeReturnTo";

function isSafeReturnPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/collaboration-type");
}

export default function CollaborationTypeStartPageContent() {
  const {
    data: surveyStatus,
    error,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useSurveyStatusQuery();
  const isSubmitted = surveyStatus === "SUBMITTED";
  const isUnauthorized = error instanceof ApiError && error.status === 401;
  const hasStatusFetchError = isError && !isUnauthorized;
  const actionHref = isSubmitted
    ? "/collaboration-type/result-loading"
    : isUnauthorized
      ? "/login/email"
      : hasStatusFetchError
        ? null
        : "/collaboration-type/questions/1";
  const actionLabel = isSubmitted ? "결과 확인하기" : isUnauthorized ? "로그인하기" : "검사하기";

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const returnTo = searchParams.get("returnTo");

    if (returnTo && isSafeReturnPath(returnTo)) {
      window.sessionStorage.setItem(COLLABORATION_TYPE_RETURN_TO_STORAGE_KEY, returnTo);

      return;
    }

    if (!document.referrer) {
      return;
    }

    const referrerUrl = new URL(document.referrer);

    if (referrerUrl.origin !== window.location.origin) {
      return;
    }

    const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;

    if (isSafeReturnPath(referrerPath)) {
      window.sessionStorage.setItem(COLLABORATION_TYPE_RETURN_TO_STORAGE_KEY, referrerPath);
    }
  }, []);

  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1F1F1F]">
      <TeamMatchingHeader backHref="/team-matching" title="협업 유형 검사" />

      <div className="scrollbar-hidden relative min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <Image
          alt=""
          className="pointer-events-none absolute inset-x-0 top-[-35px] z-0 h-full w-full object-cover"
          height={751}
          priority
          src="/icons/contests/Frame.svg"
          width={390}
        />

        <section className="relative z-10 pt-[52px] text-center">
          <h1 className="mx-auto w-full max-w-[330px] text-center font-[Pretendard] text-[22px] font-bold leading-[135%] text-[#2A2A2A]">
            나의 성격과 팀 내에서
            <br />
            협업 유형을 알아보는 검사를
            <br />
            시작해볼까요?
          </h1>

          <Image
            alt="협업 유형 검사 캐릭터"
            className="mx-auto mt-[13px] h-[306px] w-[306px] object-contain"
            height={306}
            priority
            src="/images/collaboration/collaboration.png"
            width={306}
          />
        </section>

        <section className="relative z-10 mx-auto mt-[10px] flex w-[358px] max-w-full flex-col items-start rounded-[14px] bg-[#F9F8F4] px-4 py-2 shadow-[0_16px_4px_0_rgba(0,0,0,0),0_10px_4px_0_rgba(0,0,0,0.01),0_6px_3px_0_rgba(0,0,0,0.05),0_3px_3px_0_rgba(0,0,0,0.09),0_1px_1px_0_rgba(0,0,0,0.10)]">
          <div className="flex self-stretch border-b border-[rgba(97,97,97,0.22)] p-2">
            <h2 className="font-[Pretendard] text-[15px] font-medium leading-[125%] text-[#1F1F1F]">
              협업 유형 검사
            </h2>
          </div>
          <div className="flex h-[88px] self-stretch flex-col items-start justify-center gap-[6px] p-2">
            <p className="self-stretch font-[Pretendard] text-[13px] font-normal leading-[150%] text-[#616161]">
              나에게 잘 맞는 팀원을 찾기 위한 검사입니다.
              <br />
              현재 나의 모습을 가장 잘 반영하는 응답을 선택해 주세요.
              <br />
              검사 결과는 4가지 협업 유형 중 하나로 제공됩니다.
            </p>
          </div>
        </section>
      </div>

      <div className="shrink-0 bg-white px-4 pb-3 pt-2">
        {isPending ? (
          <button
            className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#EFEFEF] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-[#C8C8C8]"
            disabled
            type="button"
          >
            확인 중
          </button>
        ) : hasStatusFetchError || !actionHref ? (
          <button
            className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-white disabled:bg-[#EFEFEF] disabled:text-[#C8C8C8]"
            disabled={isFetching}
            onClick={() => {
              void refetch();
            }}
            type="button"
          >
            {isFetching ? "확인 중" : "다시 시도"}
          </button>
        ) : (
          <Link
            className="flex h-[51px] w-full items-center justify-center rounded-[14px] bg-[#FF7658] px-8 py-[9px] font-[Roboto] text-[18px] font-bold leading-none text-white"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </main>
  );
}
