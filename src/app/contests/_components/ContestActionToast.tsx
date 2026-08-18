"use client";

import Link from "next/link";

type ContestActionToastProps = {
  className?: string;
  href?: string;
  message: string;
};

export function ContestActionToast({ className, href, message }: ContestActionToastProps) {
  return (
    <div
      role="status"
      className={`left-1/2 z-50 flex w-full max-w-[350px] -translate-x-1/2 items-baseline gap-4 rounded-full bg-[rgba(17,17,17,0.60)] py-2 pr-4 pl-5 ${className ?? ""}`}
    >
      <p className="min-w-0 flex-1 text-[15px] leading-[125%] font-medium text-white">{message}</p>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-center text-[13px] leading-[125%] font-semibold text-white underline"
        >
          바로가기
        </Link>
      ) : null}
    </div>
  );
}
