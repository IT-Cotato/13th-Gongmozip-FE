"use client";

import { useState } from "react";
import { ArrowUpIcon } from "./icons";

export function ChatInputBar() {
  const [message, setMessage] = useState("");
  const canSend = message.trim().length > 0;

  return (
    <form
      className="flex w-full items-end justify-end gap-2 overflow-hidden px-4 py-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");
      }}
    >
      <label htmlFor="chat-message" className="sr-only">
        메시지 입력
      </label>
      <input
        id="chat-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="메시지를 입력해주세요."
        className="min-w-0 flex-1 rounded-[16px] bg-[rgba(97,97,97,0.1)] px-4 py-3.5 text-[13px] leading-[1.5] text-color-gray-850 outline-none placeholder:text-color-gray-500"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="메시지 보내기"
        className={`flex size-12 shrink-0 items-center justify-center rounded-full text-white ${
          canSend ? "bg-color-coral-500" : "bg-color-gray-350"
        }`}
      >
        <ArrowUpIcon />
      </button>
    </form>
  );
}
