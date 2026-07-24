"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import BottomNavigation from "@/components/layout/BottomNavigation";
import { MOCK_CHAT_ROOMS, type ChatRoom } from "../_data/mockMessages";
import { SettingsIcon } from "./icons";

type ChatListMode = "list" | "manage";
type SortMode = "latest" | "unread";

const dropdownActionTextClass =
  "text-semantic-label-normal font-[Pretendard] text-[17px] leading-[1.5] font-medium";

export function ChatListShell() {
  const [mode, setMode] = useState<ChatListMode>("list");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  const rooms = useMemo(() => {
    if (sortMode === "unread") {
      return [...MOCK_CHAT_ROOMS].sort((a, b) => b.unreadCount - a.unreadCount);
    }

    return MOCK_CHAT_ROOMS;
  }, [sortMode]);

  const hasSelectedRoom = selectedRoomIds.length > 0;

  const closeManageMode = () => {
    setMode("list");
    setSelectedRoomIds([]);
  };

  return (
    <main className="relative flex h-full w-full flex-col bg-white pt-[env(safe-area-inset-top)]">
      <header className="relative flex h-[46px] shrink-0 items-center justify-center border-b border-[rgba(97,97,97,0.08)] px-4">
        <h1 className="text-[17px] leading-[1.35] font-semibold text-color-gray-900">
          {mode === "manage" ? "채팅방 관리" : "채팅방"}
        </h1>
        {mode === "manage" ? (
          <button
            type="button"
            className="absolute right-[17px] flex h-8 items-center justify-center rounded-[12px] px-2 text-[15px] leading-[1.25] font-semibold text-color-gray-650"
            onClick={closeManageMode}
          >
            완료
          </button>
        ) : (
          <button
            type="button"
            aria-expanded={isSettingsOpen}
            aria-label="채팅 설정"
            className="absolute right-4 flex size-[38px] items-center justify-center rounded-[14px] text-color-gray-850"
            onClick={() => setIsSettingsOpen((prev) => !prev)}
          >
            <SettingsIcon />
          </button>
        )}
      </header>

      {mode === "list" && isSettingsOpen && (
        <ChatSettingsDropdown
          onManage={() => {
            setMode("manage");
            setIsSettingsOpen(false);
          }}
          onSort={(nextSortMode) => {
            setSortMode(nextSortMode);
            setIsSettingsOpen(false);
          }}
        />
      )}

      <section
        aria-label={mode === "manage" ? "관리할 채팅방 목록" : "채팅방 목록"}
        className="flex flex-1 flex-col overflow-y-auto"
      >
        {rooms.map((room) =>
          mode === "manage" ? (
            <ManageChatRoomRow
              key={room.id}
              room={room}
              isSelected={selectedRoomIds.includes(room.id)}
              onToggle={() =>
                setSelectedRoomIds((prev) =>
                  prev.includes(room.id)
                    ? prev.filter((roomId) => roomId !== room.id)
                    : [...prev, room.id],
                )
              }
            />
          ) : (
            <ChatRoomRow key={room.id} room={room} />
          ),
        )}
      </section>

      {mode === "manage" ? (
        <div className="flex shrink-0 gap-2.5 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={!hasSelectedRoom}
            className={`flex h-[50px] flex-1 items-center justify-center rounded-[14px] border px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold ${
              hasSelectedRoom
                ? "border-[rgba(97,97,97,0.5)] bg-white text-color-gray-650"
                : "border-color-gray-250 bg-white text-color-gray-350"
            }`}
          >
            읽음
          </button>
          <button
            type="button"
            disabled={!hasSelectedRoom}
            className={`flex h-[50px] flex-1 items-center justify-center rounded-[14px] px-2.5 py-[9px] text-[17px] leading-[1.25] font-semibold ${
              hasSelectedRoom ? "bg-color-gray-650 text-white" : "bg-color-gray-200 text-color-gray-350"
            }`}
          >
            나가기
          </button>
        </div>
      ) : (
        <BottomNavigation unreadChatCount={9} />
      )}
    </main>
  );
}

function ChatSettingsDropdown({
  onManage,
  onSort,
}: {
  onManage: () => void;
  onSort: (sortMode: SortMode) => void;
}) {
  return (
    <div className="absolute top-[89px] right-[35px] z-20 w-[221px] rounded-[12px] bg-white px-5 py-2 shadow-[0_16px_4px_rgba(0,0,0,0),0_10px_4px_rgba(0,0,0,0.01),0_6px_3px_rgba(0,0,0,0.05),0_3px_3px_rgba(0,0,0,0.09),0_1px_1px_rgba(0,0,0,0.1)]">
      <button
        type="button"
        className={`flex h-[50px] w-full items-center text-left ${dropdownActionTextClass}`}
        onClick={onManage}
      >
        채팅방 관리
      </button>
      <div className="h-px w-full bg-[rgba(97,97,97,0.22)]" />
      <p className="flex h-10 items-end text-[13px] leading-[1.25] font-medium text-color-gray-650">
        채팅방 정렬
      </p>
      <button
        type="button"
        className={`flex h-[58px] w-full items-center text-left ${dropdownActionTextClass}`}
        onClick={() => onSort("latest")}
      >
        최신 메시지 순
      </button>
      <button
        type="button"
        className={`flex h-[50px] w-full items-center text-left ${dropdownActionTextClass}`}
        onClick={() => onSort("unread")}
      >
        안읽은 메시지 순
      </button>
    </div>
  );
}

function ChatRoomRow({ room }: { room: ChatRoom }) {
  return (
    <Link
      href={`/chat/${room.id}`}
      className="flex h-[72px] w-full shrink-0 items-center gap-2 overflow-hidden bg-white px-4 py-2"
    >
      <AvatarStack avatarSrcs={room.avatarSrcs} />
      <ChatRoomRowText room={room} showTime />
    </Link>
  );
}

function ManageChatRoomRow({
  room,
  isSelected,
  onToggle,
}: {
  room: ChatRoom;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-[72px] w-full shrink-0 items-center bg-white px-4 text-left"
      onClick={onToggle}
    >
      <span
        aria-hidden="true"
        className={`mr-3 flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          isSelected ? "border-color-gray-650 bg-color-gray-650" : "border-[rgba(97,97,97,0.22)] bg-white"
        }`}
      >
        {isSelected && <span className="size-2 rounded-full bg-white" />}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden py-2">
        <AvatarStack avatarSrcs={room.avatarSrcs} />
        <ChatRoomRowText room={room} />
      </div>
    </button>
  );
}

function ChatRoomRowText({ room, showTime = false }: { room: ChatRoom; showTime?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-left">
      <div className="flex w-full items-center gap-4 leading-[1.35]">
        <h2 className="min-w-0 flex-1 truncate text-[13px] leading-[1.5] font-semibold text-color-gray-850">
          {room.title}
        </h2>
        {showTime && (
          <span className="shrink-0 text-[12px] leading-[1.35] text-color-gray-650">
            {room.lastMessageAt}
          </span>
        )}
      </div>
      <p className="h-7 w-full overflow-hidden text-[13px] leading-[1.35] font-normal text-ellipsis whitespace-nowrap text-color-gray-650">
        {room.lastMessage}
      </p>
    </div>
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
