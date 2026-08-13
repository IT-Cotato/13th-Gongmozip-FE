import Link from "next/link";
import { ChevronLeftIcon, MenuIcon } from "./icons";

type ChatTopBarProps = {
  backHref?: string;
  memberCount?: number;
  roomId: string;
  title?: string;
};

export function ChatTopBar({ backHref = "/chat", memberCount, roomId, title }: ChatTopBarProps) {
  const topBarTitle = title ?? "채팅방";

  return (
    <header className="border-b border-[rgba(97,97,97,0.08)] bg-white">
      <div className="relative flex h-[46px] items-center justify-center px-4">
        <Link
          href={backHref}
          aria-label="뒤로가기"
          className="absolute left-4 flex size-[38px] items-center justify-center rounded-[14px] text-color-gray-850"
        >
          <ChevronLeftIcon />
        </Link>
        <h1 className="flex max-w-[250px] items-center justify-center gap-2 truncate text-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
          <span className="truncate">{topBarTitle}</span>
          {memberCount ? <span className="shrink-0">{memberCount}</span> : null}
        </h1>
        <Link
          href={`/chat/${roomId}/menu`}
          aria-label="채팅방 메뉴"
          className="absolute right-4 flex size-[38px] items-center justify-center rounded-[14px] text-color-gray-850"
        >
          <MenuIcon />
        </Link>
      </div>
    </header>
  );
}
