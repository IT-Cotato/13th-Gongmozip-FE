"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUpIcon } from "./icons";

const MAX_TEXTAREA_HEIGHT = 128;

export function ChatInputBar({
  disabled = false,
  onSendMessage,
}: {
  disabled?: boolean;
  onSendMessage?: (message: string) => boolean;
}) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = message.trim().length > 0 && !disabled;

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [message]);

  return (
    <form
      className="flex w-full items-end justify-end gap-2 overflow-hidden px-4 py-2.5"
      onSubmit={(event) => {
        event.preventDefault();

        if (!canSend) {
          return;
        }

        if (onSendMessage?.(message) ?? true) {
          setMessage("");
        }
      }}
    >
      <label htmlFor="chat-message" className="sr-only">
        메시지 입력
      </label>
      <textarea
        ref={textareaRef}
        id="chat-message"
        rows={1}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="메시지를 입력해주세요."
        className="max-h-32 min-h-12 min-w-0 flex-1 resize-none rounded-[16px] bg-[rgba(97,97,97,0.1)] px-4 py-3.5 text-[13px] leading-[1.5] text-color-gray-850 outline-none placeholder:text-color-gray-500"
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
