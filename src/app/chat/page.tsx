import Image from "next/image";
import Link from "next/link";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { SettingsIcon } from "./_components/icons";
import { MOCK_CHAT_ROOMS } from "./_data/mockMessages";

export default function ChatPage() {
  return (
    <main className="flex h-full w-full flex-col bg-white pt-[env(safe-area-inset-top)]">
      <header className="relative flex h-[46px] shrink-0 items-center justify-center border-b border-[rgba(97,97,97,0.08)] px-4">
        <h1 className="text-[17px] leading-[1.35] font-semibold text-color-gray-900">채팅방</h1>
        <button
          type="button"
          aria-label="채팅 설정"
          className="absolute right-4 flex size-[38px] items-center justify-center rounded-[14px] text-color-gray-850"
        >
          <SettingsIcon />
        </button>
      </header>

      <section aria-label="채팅방 목록" className="flex flex-1 flex-col overflow-y-auto pt-4">
        {MOCK_CHAT_ROOMS.map((room) => (
          <Link
            key={room.id}
            href={`/chat/${room.id}`}
            className="flex w-full items-center gap-2 bg-white p-4"
          >
            <AvatarStack avatarSrcs={room.avatarSrcs} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-4">
                <h2 className="min-w-0 flex-1 truncate text-[17px] leading-[1.35] font-semibold text-color-gray-850">
                  {room.title}
                </h2>
                <span className="shrink-0 text-[12px] leading-[1.35] text-color-gray-650">
                  {room.lastMessageAt}
                </span>
              </div>
              <p className="truncate text-[13px] leading-[1.25] font-medium text-color-gray-750">
                {room.lastMessage}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <div className="pb-[env(safe-area-inset-bottom)]">
        <BottomNavigation unreadChatCount={9} />
      </div>
    </main>
  );
}

function AvatarStack({ avatarSrcs }: { avatarSrcs: string[] }) {
  const fallbackTones = ["bg-color-green-100", "bg-color-coral-100", "bg-color-blue-50"];

  return (
    <div className="flex w-[68px] shrink-0 items-center">
      {fallbackTones.map((toneClass, index) => (
        <div
          key={toneClass}
          className={`relative flex size-11 items-center justify-center overflow-hidden rounded-full border-2 border-white ${toneClass} ${
            index > 0 ? "-ml-8" : ""
          }`}
        >
          {avatarSrcs[index] ? (
            <Image src={avatarSrcs[index]} alt="" fill sizes="44px" className="object-cover" />
          ) : (
            <span className="size-6 rounded-full bg-white/60" />
          )}
        </div>
      ))}
    </div>
  );
}
