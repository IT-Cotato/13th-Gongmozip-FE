"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import Dialog from "@/components/Dialog";
import { MOCK_CHAT_ROOMS } from "@/app/chat/_data/mockMessages";

type ShareContestModalProps = {
  onShareComplete: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const CHARACTER_IMAGE_SRC = "/images/contests/cha.png";

export function ShareContestModal({ onOpenChange, onShareComplete, open }: ShareContestModalProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());

  const filteredRooms = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return MOCK_CHAT_ROOMS;
    }

    return MOCK_CHAT_ROOMS.filter((room) => room.title.toLowerCase().includes(keyword));
  }, [searchKeyword]);

  const selectedCount = selectedRoomIds.size;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearchKeyword("");
      setSelectedRoomIds(new Set());
    }

    onOpenChange(nextOpen);
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(roomId)) {
        nextIds.delete(roomId);
      } else {
        nextIds.add(roomId);
      }

      return nextIds;
    });
  };

  const clearSelection = () => {
    setSelectedRoomIds(new Set());
  };

  const sendContest = () => {
    if (selectedCount === 0) {
      return;
    }

    handleOpenChange(false);
    onShareComplete();
  };

  return (
    <Dialog
      aria-label="공모전 채팅방 공유"
      className="fixed inset-x-0 bottom-0 top-auto mx-auto max-h-[76vh] w-full max-w-[390px] rounded-t-2xl bg-white p-0 text-color-gray-850 shadow-none backdrop:bg-[rgba(31,31,31,0.6)]"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleOpenChange(false);
        }
      }}
      onOpenChange={handleOpenChange}
      open={open}
    >
      <div className="flex h-full max-h-[76vh] flex-col px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-[13px]">
        <div
          aria-hidden="true"
          className="mx-auto h-1 w-12 rounded-full bg-[rgba(97,97,97,0.22)]"
        />

        <label className="mt-5 flex h-[38px] w-full items-center justify-between rounded-[30px] bg-color-gray-150 px-4 py-2">
          <span className="sr-only">공유하고 싶은 채팅방 검색</span>
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="공유하고 싶은 채팅방 검색"
            className="min-w-0 flex-1 bg-transparent font-[Pretendard] text-[15px] leading-[135%] font-normal text-semantic-fill-neutral outline-none placeholder:text-semantic-fill-neutral"
          />
          <Image
            src="/icons/contests/tabler_search.svg"
            alt=""
            width={24}
            height={24}
            className="pointer-events-none size-6 shrink-0 aspect-square"
          />
        </label>

        <section
          aria-label="공유할 채팅방 선택"
          className="-mx-4 mt-[22px] min-h-0 flex-1 overflow-y-auto pb-4"
        >
          {filteredRooms.length > 0 ? (
            <ul className="flex flex-col">
              {filteredRooms.map((room) => {
                const isSelected = selectedRoomIds.has(room.id);

                return (
                  <li key={room.id} className="w-full">
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      className="flex w-full items-center gap-2 bg-white px-4 py-3 text-left"
                      onClick={() => toggleRoom(room.id)}
                    >
                      <CharacterAvatarStack />
                      <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                        <span className="h-[19px] self-stretch truncate font-[Pretendard] text-[15px] leading-[125%] font-semibold text-semantic-label-normal">
                          {room.title}
                        </span>
                        <span className="h-[14px] self-stretch overflow-hidden truncate font-[Pretendard] text-[12px] leading-[135%] font-normal text-semantic-label-neutral">
                          {room.lastMessage}
                        </span>
                      </span>
                      <Image
                        src={
                          isSelected ? "/icons/common/clickedcheck.svg" : "/icons/common/check.svg"
                        }
                        alt=""
                        width={24}
                        height={24}
                        className="h-[26.667px] w-[26.667px] shrink-0"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-1 py-10 text-center text-[13px] leading-[150%] font-medium text-color-gray-650">
              검색 결과가 없습니다.
            </p>
          )}
        </section>

        <div className="flex shrink-0 gap-2.5">
          <button
            type="button"
            className="flex h-[50px] w-[174px] shrink-0 items-center justify-center self-stretch rounded-[14px] border border-[rgba(97,97,97,0.50)] bg-white px-2.5 py-[9px] text-center font-[Pretendard] text-[17px] leading-[125%] font-semibold text-semantic-label-neutral disabled:text-color-gray-400"
            disabled={selectedCount === 0}
            onClick={clearSelection}
          >
            선택해제
          </button>
          <button
            type="button"
            className="flex h-[50px] w-[174px] shrink-0 items-center justify-center self-stretch rounded-[14px] bg-color-coral-500 px-2.5 py-[9px] text-center font-[Pretendard] text-[17px] leading-[125%] font-semibold text-semantic-label-inverse disabled:bg-color-gray-300"
            disabled={selectedCount === 0}
            onClick={sendContest}
          >
            보내기
          </button>
        </div>
      </div>
    </Dialog>
  );
}

function CharacterAvatarStack() {
  return (
    <span className="flex w-[68px] shrink-0 items-center">
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className={`relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-color-green-100 p-0.5 aspect-square ${
            item > 0 ? "-ml-8" : ""
          }`}
        >
          <Image
            src={CHARACTER_IMAGE_SRC}
            alt=""
            width={31.2}
            height={30.8}
            className="h-[30.8px] w-[31.2px] shrink-0"
          />
        </span>
      ))}
    </span>
  );
}
