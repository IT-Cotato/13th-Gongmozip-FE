"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TeamMatchingHeaderProps = {
  backHref?: string;
  className?: string;
  onBackClick?: () => void;
  preferHistoryBack?: boolean;
  title?: string;
};

export default function TeamMatchingHeader({
  backHref = "/team-matching",
  className = "bg-white",
  onBackClick,
  preferHistoryBack = false,
  title = "팀원 매칭",
}: TeamMatchingHeaderProps) {
  const router = useRouter();
  const backIcon = <Image alt="" height={20} priority src="/icons/contests/left.svg" width={20} />;
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(backHref);
  };

  return (
    <header
      className={`flex h-[46px] shrink-0 items-center justify-between px-4 py-1 ${className}`}
    >
      {onBackClick || preferHistoryBack ? (
        <button
          aria-label="뒤로가기"
          className="flex h-6 w-6 items-center justify-center"
          onClick={handleBackClick}
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
