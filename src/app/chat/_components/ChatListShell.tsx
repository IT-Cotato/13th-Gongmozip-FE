"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type AriaRole } from "react";

import BottomNavigation from "@/components/layout/BottomNavigation";
import { ApiError } from "@/lib/http";
import { useChatTeamsQuery } from "@/queries/useChatQueries";

import type { ChatRoom } from "../_data/mockMessages";
import { SettingsIcon } from "./icons";

type SortMode = "latest" | "unread";

const dropdownActionTextClass =
  "text-semantic-label-normal font-[Pretendard] text-[17px] leading-[1.5] font-medium";

export function ChatListShell() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const { data: chatRooms = [], error, isError, isLoading, refetch } = useChatTeamsQuery();
  const canShowRooms = !isLoading && !isError;

  const rooms = useMemo(() => {
    if (sortMode === "unread") {
      return [...chatRooms].sort((a, b) => b.unreadCount - a.unreadCount);
    }

    return chatRooms;
  }, [chatRooms, sortMode]);

  return (
    <main className="relative flex h-full w-full flex-col bg-white pt-[env(safe-area-inset-top)]">
      <header className="relative flex h-[46px] shrink-0 items-center justify-center border-b border-[rgba(97,97,97,0.08)] px-4">
        <h1 className="text-[17px] leading-[1.35] font-semibold text-color-gray-900">채팅방</h1>
        <button
          type="button"
          aria-expanded={isSettingsOpen}
          aria-label="채팅 설정"
          className="absolute right-4 flex size-[38px] items-center justify-center rounded-[14px] text-color-gray-850"
          onClick={() => setIsSettingsOpen((prev) => !prev)}
        >
          <SettingsIcon />
        </button>
      </header>

      {isSettingsOpen && (
        <ChatSettingsDropdown
          onSort={(nextSortMode) => {
            setSortMode(nextSortMode);
            setIsSettingsOpen(false);
          }}
        />
      )}

      <section aria-label="채팅방 목록" className="flex flex-1 flex-col overflow-y-auto">
        {isLoading ? <ChatListStateMessage message="채팅방을 불러오는 중입니다." /> : null}

        {isError ? (
          <ChatListStateMessage
            role="alert"
            message={
              error instanceof ApiError ? error.message : "채팅방 목록을 불러오지 못했습니다."
            }
            actionLabel="다시 시도"
            onAction={() => void refetch()}
          />
        ) : null}

        {canShowRooms && rooms.length === 0 ? (
          <ChatListStateMessage message="아직 참여 중인 채팅방이 없습니다." />
        ) : null}

        {canShowRooms ? rooms.map((room) => <ChatRoomRow key={room.id} room={room} />) : null}
      </section>

      <BottomNavigation chatRoomCount={chatRooms.length} />
    </main>
  );
}

function ChatListStateMessage({
  actionLabel,
  message,
  onAction,
  role,
}: {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  role?: AriaRole;
}) {
  return (
    <div
      role={role}
      className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <p className="text-[13px] leading-[1.5] text-color-gray-650">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="flex h-10 items-center justify-center rounded-[12px] bg-color-coral-500 px-4 text-[13px] leading-[1.25] font-semibold text-white"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function ChatSettingsDropdown({ onSort }: { onSort: (sortMode: SortMode) => void }) {
  return (
    <div className="absolute top-[calc(env(safe-area-inset-top)+42px)] right-[35px] z-20 inline-flex max-h-[400px] min-w-[140px] items-center gap-2.5 py-2 drop-shadow-[0_16px_2px_rgba(0,0,0,0),0_10px_2px_rgba(0,0,0,0.01),0_6px_1.5px_rgba(0,0,0,0.05),0_3px_1.5px_rgba(0,0,0,0.09),0_1px_0.5px_rgba(0,0,0,0.1)]">
      <div className="rounded-[12px] bg-white px-5 py-2">
        <div className="flex w-[181px] flex-col items-start gap-2">
          <p className="flex h-4 items-center text-[13px] leading-[1.25] font-medium text-color-gray-650">
            채팅방 정렬
          </p>
          <button
            type="button"
            className={`flex h-12 w-full items-center text-left ${dropdownActionTextClass}`}
            onClick={() => onSort("latest")}
          >
            최신 메시지 순
          </button>
          <button
            type="button"
            className={`flex h-12 w-full items-center text-left ${dropdownActionTextClass}`}
            onClick={() => onSort("unread")}
          >
            안읽은 메시지 순
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatRoomRow({ room }: { room: ChatRoom }) {
  return (
    <Link
      href={`/chat/${room.id}`}
      className="flex h-[72px] w-full shrink-0 items-center gap-2 overflow-hidden bg-white p-2"
    >
      <AvatarStack avatarSrcs={room.avatarSrcs} />
      <ChatRoomRowText room={room} showTime />
    </Link>
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
