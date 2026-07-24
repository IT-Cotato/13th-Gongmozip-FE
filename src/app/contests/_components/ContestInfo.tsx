"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { ContestDetail } from "../_types";

type ContestInfoProps = {
  contest: ContestDetail;
  posterIndex: number;
};

const detailRows = [
  { label: "접수기간", key: "applicationPeriod" },
  { label: "공모전 분야", key: "category" },
  { label: "지원자격", key: "eligibility" },
  { label: "시상내역", key: "prize" },
  { label: "공모전 내용", key: "description" },
] as const;

export function ContestInfo({ contest, posterIndex }: ContestInfoProps) {
  const [isScrapped, setIsScrapped] = useState(contest.isScrapped);
  const [showScrapToast, setShowScrapToast] = useState(false);
  const scrapToastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrapToastTimerRef.current !== null) {
        window.clearTimeout(scrapToastTimerRef.current);
      }
    };
  }, []);

  const handleScrapClick = () => {
    setIsScrapped((current) => {
      const nextIsScrapped = !current;

      if (scrapToastTimerRef.current !== null) {
        window.clearTimeout(scrapToastTimerRef.current);
      }

      if (nextIsScrapped) {
        setShowScrapToast(true);
        scrapToastTimerRef.current = window.setTimeout(() => {
          setShowScrapToast(false);
          scrapToastTimerRef.current = null;
        }, 2000);
      } else {
        setShowScrapToast(false);
        scrapToastTimerRef.current = null;
      }

      return nextIsScrapped;
    });
  };

  return (
    <section aria-label="공모전 정보" className="flex min-h-full flex-col">
      <div className="px-[27px] pt-[13px]">
        <span className="inline-flex items-center justify-center rounded-[85px] bg-color-coral-100 px-2 py-1 text-center text-[12px] leading-[135%] font-semibold text-semantic-line-brand">
          {contest.category}
        </span>

        <div className="mt-[14px] flex justify-center">
          <div className="flex h-[222px] w-[159px] items-center justify-center gap-2.5 bg-color-gray-300 text-sm font-semibold text-color-gray-650">
            이미지 {posterIndex}
          </div>
        </div>
      </div>

      <div className="mt-[27px] flex flex-1 flex-col items-start gap-2 self-stretch bg-white px-6 py-4">
        <div className="flex w-full items-start justify-between">
          <span className="inline-flex items-center justify-center rounded bg-color-coral-500 px-4 py-1 text-[15px] leading-[125%] font-semibold text-white">
            {contest.dDay}
          </span>
          <span className="mt-[11px] inline-flex items-center gap-1 text-[12px] leading-[135%] font-semibold text-color-gray-650">
            <Image
              src="/icons/contests/tabler_eye-filled.svg"
              alt=""
              width={16}
              height={16}
              className="size-4 aspect-square shrink-0"
            />
            {contest.viewCount.toLocaleString("ko-KR")}
          </span>
        </div>

        <p className="mt-3 w-[252px] text-[17px] leading-[150%] font-medium text-color-gray-650">
          {contest.organizer}
        </p>

        <div className="mt-[11px] grid w-full grid-cols-[minmax(0,1fr)_48px] gap-4">
          <div className="min-w-0">
            <h2 className="w-[228px] text-[24px] leading-[135%] font-bold break-keep text-color-gray-900">
              {contest.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label={`${contest.title} 스크랩`}
            aria-pressed={isScrapped}
            className="relative mt-1 flex h-12 w-12 flex-col items-start justify-center gap-2.5 rounded-2xl bg-[rgba(97,97,97,0.10)]"
            onClick={handleScrapClick}
          >
            <Image
              src="/icons/contests/Button/_Asset/tabler_bookmark-filled.svg"
              alt=""
              width={24}
              height={24}
              className={`absolute top-3 left-3 flex size-6 shrink-0 items-center justify-center ${
                isScrapped ? "opacity-100" : "opacity-30 grayscale"
              }`}
            />
          </button>
        </div>

        <dl className="mt-8 flex w-full flex-col gap-4">
          {detailRows.map((row) => (
            <div key={row.key} className="flex w-full items-start gap-0">
              <dt className="h-[18px] w-[106px] shrink-0 text-[15px] leading-[125%] font-semibold text-color-gray-650">
                {row.label}
              </dt>
              <dd className="min-w-0 flex-1 whitespace-pre-line text-[13px] leading-[135%] font-medium break-keep text-color-gray-700">
                {contest[row.key]}
              </dd>
            </div>
          ))}
        </dl>

        <Link
          href={contest.websiteUrl || "#"}
          target={contest.websiteUrl ? "_blank" : undefined}
          rel={contest.websiteUrl ? "noreferrer" : undefined}
          aria-disabled={!contest.websiteUrl}
          className="mt-8 flex h-7 w-full max-w-[358px] items-center justify-center gap-1 rounded-[10px] border border-semantic-line-brand px-1.5 py-[7px] text-center text-[13px] leading-[125%] font-semibold text-semantic-label-brand"
        >
          <Image
            src="/icons/contests/Button/tabler_external-link.svg"
            alt=""
            width={16}
            height={16}
            className="size-4 shrink-0"
          />
          웹사이트
        </Link>

        <div className="mt-[18px] flex w-full items-start gap-[13px] self-stretch bg-white">
          <button
            type="button"
            aria-label="공모전 공유하기"
            className="relative flex h-[47px] w-12 shrink-0 flex-col items-start justify-center gap-2.5 rounded-2xl bg-[rgba(97,97,97,0.10)] aspect-[48/47]"
          >
            <Image
              src="/icons/contests/Button/Button/Button/_Asset/share.svg"
              alt=""
              width={24}
              height={24}
              className="absolute left-3 top-[11.75px] h-[23.5px] w-6 shrink-0"
            />
          </button>
          <button
            type="button"
            className="flex h-[50px] min-w-0 flex-1 items-center justify-center rounded-[14px] bg-color-coral-500 px-2.5 py-[9px] text-center text-[17px] leading-[125%] font-semibold whitespace-nowrap text-white"
          >
            채팅방에 공유하기
          </button>
        </div>
      </div>

      {showScrapToast ? (
        <div
          role="status"
          className="fixed bottom-[154px] left-1/2 z-50 flex w-[350px] -translate-x-1/2 items-baseline gap-4 rounded-full bg-[rgba(17,17,17,0.60)] py-2 pr-4 pl-5"
        >
          <p className="min-w-0 flex-1 text-[15px] leading-[125%] font-medium text-white">
            이 공모전을 스크랩하였습니다.
          </p>
          <Link
            href="/contests/scraps"
            className="shrink-0 text-center text-[13px] leading-[125%] font-semibold text-white underline"
          >
            바로가기
          </Link>
        </div>
      ) : null}
    </section>
  );
}
