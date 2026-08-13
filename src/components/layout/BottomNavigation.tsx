"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useChatTeamsQuery } from "@/queries/useChatQueries";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHasAuthHydrated } from "@/stores/useHasAuthHydrated";
import { ChatIcon, ContestIcon, HomeIcon, MatchingIcon, MypageIcon } from "./icons";

type NavItemId = "home" | "contests" | "team-matching" | "chat" | "mypage";

type NavItem = {
  id: NavItemId;
  label: string;
  href: string;
  renderIcon: (isActive: boolean) => ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "홈", href: "/", renderIcon: HomeIcon },
  { id: "contests", label: "공모전", href: "/contests", renderIcon: ContestIcon },
  { id: "team-matching", label: "팀원매칭", href: "/team-matching", renderIcon: MatchingIcon },
  { id: "chat", label: "채팅방", href: "/chat", renderIcon: ChatIcon },
  { id: "mypage", label: "마이페이지", href: "/mypage", renderIcon: MypageIcon },
];

type BottomNavigationProps = {
  /** 채팅방 탭에 표시할 채팅방 수. 생략하면 실제 채팅방 목록 API 기준으로 표시합니다. */
  chatRoomCount?: number;
};

export default function BottomNavigation({ chatRoomCount }: BottomNavigationProps) {
  const pathname = usePathname();
  const hasHydrated = useHasAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const shouldFetchChatRooms = chatRoomCount === undefined && hasHydrated && Boolean(accessToken);
  const { data: chatRooms = [] } = useChatTeamsQuery({ enabled: shouldFetchChatRooms });
  const displayedChatRoomCount = chatRoomCount ?? (shouldFetchChatRooms ? chatRooms.length : 0);

  return (
    <nav
      aria-label="하단 내비게이션"
      className="flex h-[64px] w-full shrink-0 items-center justify-center border-t border-[rgba(97,97,97,0.08)] bg-white py-1"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            data-nav-item={item.id}
            aria-current={isActive ? "page" : undefined}
            className={`flex h-full min-w-0 flex-1 flex-col items-center py-2 ${
              isActive ? "text-color-gray-850" : "text-color-gray-500"
            }`}
          >
            <span className="relative block size-6">
              {item.renderIcon(isActive)}
              {item.id === "chat" && displayedChatRoomCount > 0 && (
                <span className="absolute -top-[5px] -right-[7.62px] flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-color-coral-500 px-1 text-[8px] leading-[1.35] font-semibold text-white">
                  {displayedChatRoomCount > 99 ? "99+" : displayedChatRoomCount}
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
