"use client";

import Link from "next/link";

type TeamMatchingHeaderProps = {
  backHref?: string;
  onBackClick?: () => void;
  title?: string;
};

export default function TeamMatchingHeader({
  backHref = "/team-matching",
  onBackClick,
  title = "팀원 매칭",
}: TeamMatchingHeaderProps) {
  const backIcon = (
    <span className="block h-[10px] w-[10px] rotate-45 border-b-2 border-l-2 border-[#1F1F1F]" />
  );

  return (
    <header className="flex h-[46px] shrink-0 items-center justify-between bg-white px-4 py-1">
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
      <h1 className="text-center font-[Roboto] text-[17px] font-semibold leading-[135%] text-[#111111]">
        {title}
      </h1>
      <span className="h-6 w-6" aria-hidden="true" />
    </header>
  );
}
