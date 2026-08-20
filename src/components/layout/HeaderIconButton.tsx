"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// 피그마의 "Icon left/right" 컴포넌트 스펙: 20px 아이콘을 9px 패딩으로 감싼
// 38x38 탭 영역에 14px 라운드. 아이콘 벡터를 헤더에 그대로 박아넣지 말고
// 항상 이 컴포넌트로 감싸야 상단바 비율이 피그마와 일치한다.
const ICON_BUTTON_CLASS =
  "flex size-[38px] shrink-0 items-center justify-center rounded-[14px] text-[#1F1F1F]";

type HeaderIconButtonSharedProps = {
  children: ReactNode;
  "aria-label": string;
  className?: string;
};

export function HeaderIconLink({
  children,
  href,
  className = "",
  ...props
}: HeaderIconButtonSharedProps & { href: string }) {
  return (
    <Link href={href} className={`${ICON_BUTTON_CLASS} ${className}`} {...props}>
      {children}
    </Link>
  );
}

export function HeaderIconButton({
  children,
  className = "",
  type = "button",
  ...props
}: HeaderIconButtonSharedProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${ICON_BUTTON_CLASS} ${className}`} {...props}>
      {children}
    </button>
  );
}
