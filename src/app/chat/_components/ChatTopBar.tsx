import Link from "next/link";
import { CHAT_MEMBER_COUNT, CHAT_ROOM_TITLE } from "../_data/mockMessages";
import { ChevronLeftIcon, MenuIcon } from "./icons";

type ChatTopBarProps = {
  roomId: string;
};

export function ChatTopBar({ roomId }: ChatTopBarProps) {
  return (
    <header className="border-b border-[rgba(97,97,97,0.08)] bg-white">
      <div className="relative flex h-[46px] items-center justify-center px-4">
        <Link
          href="/chat"
          aria-label="뒤로가기"
          className="absolute left-4 flex size-[38px] items-center justify-center rounded-[14px] text-color-gray-850"
        >
          <ChevronLeftIcon />
        </Link>
        <h1 className="flex max-w-[250px] items-center justify-center gap-2 truncate text-center text-[17px] leading-[1.35] font-semibold text-color-gray-900">
          <span className="truncate">{CHAT_ROOM_TITLE}</span>
          <span className="shrink-0">{CHAT_MEMBER_COUNT}</span>
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
