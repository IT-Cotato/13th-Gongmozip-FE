"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChatIcon, ContestIcon, HomeIcon, MatchingIcon, MypageIcon } from "./icons";

type NavItemId = "home" | "contests" | "team-matching" | "chat" | "mypage";

type NavItem = {
  id: NavItemId;
  label: string;
  href: string;
  renderIcon: () => ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "홈", href: "/", renderIcon: HomeIcon },
  { id: "contests", label: "공모전", href: "/contests", renderIcon: ContestIcon },
  { id: "team-matching", label: "팀원매칭", href: "/team-matching", renderIcon: MatchingIcon },
  { id: "chat", label: "채팅방", href: "/chat", renderIcon: ChatIcon },
  { id: "mypage", label: "마이페이지", href: "/mypage", renderIcon: MypageIcon },
];

type BottomNavigationProps = {
  /** 채팅방 탭에 표시할 안 읽은 채팅 수. 0이거나 생략하면 배지를 표시하지 않음 */
  unreadChatCount?: number;
};

export default function BottomNavigation({ unreadChatCount = 0 }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 내비게이션"
      className="flex w-full items-center justify-center border-t border-[rgba(97,97,97,0.08)] bg-white py-1"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            data-nav-item={item.id}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center py-2 ${
              isActive ? "text-color-gray-850" : "text-color-gray-500"
            }`}
          >
            <span className="relative block size-6">
              {item.renderIcon()}
              {item.id === "chat" && unreadChatCount > 0 && (
                <span className="absolute -top-[5px] -right-[7.62px] flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-color-coral-500 px-1 text-[8px] font-semibold text-white">
                  {unreadChatCount > 99 ? "99+" : unreadChatCount}
                </span>
              )}
            </span>
            <span className="text-xs leading-[1.35] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
