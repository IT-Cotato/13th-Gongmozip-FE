"use client";

import Image from "next/image";
import Link from "next/link";

type TeamMatchingHeaderProps = {
  backHref?: string;
  className?: string;
  onBackClick?: () => void;
  title?: string;
};

export default function TeamMatchingHeader({
  backHref = "/team-matching",
  className = "bg-white",
  onBackClick,
  title = "팀원 매칭",
}: TeamMatchingHeaderProps) {
  const backIcon = <Image alt="" height={20} priority src="/icons/contests/left.svg" width={20} />;

  return (
    <header
      className={`flex h-[46px] shrink-0 items-center justify-between px-4 py-1 ${className}`}
    >
      {onBackClick ? (
        <button
          aria-label="뒤로가기"
          className="flex h-6 w-6 items-center justify-center"
          onClick={onBackClick}
          type="button"
        >
          {backIcon}
        </button>
      ) : (
        <Link
          aria-label="뒤로가기"
          className="flex h-6 w-6 items-center justify-center"
          href={backHref}
        >
          {backIcon}
        </Link>
      )}
      <h1 className="flex h-[38px] flex-col justify-center self-stretch text-center font-[Pretendard] text-[17px] font-semibold not-italic leading-[135%] text-[var(--Semantic-Fill-Strong,var(--Primitive-Gray-Gray-900,#111))]">
        {title}
      </h1>
      <span className="h-6 w-6" aria-hidden="true" />
    </header>
  );
}
