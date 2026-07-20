import type { ChatMessage } from "../_data/mockMessages";
import { ChatAvatar } from "./ChatAvatar";

type ChatMessageBubbleProps = {
  message: ChatMessage;
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  if (message.direction === "outgoing") {
    return (
      <div className="flex w-full justify-end pr-[17px]">
        <div className="flex max-w-[274px] items-end justify-end gap-2">
          <div className="mb-1 flex items-end gap-2 text-[8px] leading-[1.35] whitespace-nowrap text-color-gray-650">
            {message.unreadLabel && <span className="text-color-gray-850">{message.unreadLabel}</span>}
            <span>{message.sentAt}</span>
          </div>
          <p className="max-w-[216px] rounded-t-[16px] rounded-br-[16px] rounded-bl-none bg-color-coral-500 p-2 text-[13px] leading-[1.5] text-white">
            {message.body}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2">
      <ChatAvatar
        name={message.senderName}
        tone={message.avatarTone ?? "green"}
        src={message.avatarSrc}
      />
      <div className="flex items-end gap-2">
        <p className="max-w-[216px] rounded-t-[16px] rounded-br-[16px] rounded-bl-none bg-color-gray-150 p-2 text-[13px] leading-[1.5] text-color-gray-850">
          {message.body}
        </p>
        <span className="mb-1 text-[8px] leading-[1.35] whitespace-nowrap text-color-gray-650">
          {message.sentAt}
        </span>
      </div>
    </div>
  );
}
