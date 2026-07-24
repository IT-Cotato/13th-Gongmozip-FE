"use client";

import { useParams } from "next/navigation";

import { ChatInputBar } from "../_components/ChatInputBar";
import { ChatMessageBubble } from "../_components/ChatMessageBubble";
import { ChatTopBar } from "../_components/ChatTopBar";
import { MOCK_CHAT_MESSAGES } from "../_data/mockMessages";

export default function ChatRoomPage() {
  const params = useParams<{ roomId: string }>();

  return (
    <main className="flex h-full w-full flex-col bg-white pt-[env(safe-area-inset-top)]">
      <ChatTopBar roomId={params.roomId} />

      <div className="flex h-8 items-center justify-between">
        <span className="h-px w-[121px] bg-color-gray-300" />
        <span className="text-center text-[9px] leading-[1.35] text-color-gray-650">
          팀 매칭 완료 오늘 오후 2:30
        </span>
        <span className="h-px w-[121px] bg-color-gray-300" />
      </div>

      <section
        aria-label="채팅 메시지"
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-3 pb-6"
      >
        {MOCK_CHAT_MESSAGES.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}
      </section>

      <div className="flex flex-col gap-px bg-white pb-[env(safe-area-inset-bottom)]">
        <ChatInputBar />
      </div>
    </main>
  );
}
