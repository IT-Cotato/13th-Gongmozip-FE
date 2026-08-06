import type { ChatMessage } from "../_data/mockMessages";
import { ChatAvatar } from "./ChatAvatar";

type ChatMessageBubbleProps = {
  message: ChatMessage;
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  if (message.direction === "outgoing") {
    return (
      <div className="flex w-full items-end justify-end gap-2">
        <span className="text-[12px] leading-[1.35] whitespace-nowrap text-color-gray-650">
          {message.sentAt}
        </span>
        <div className="flex max-w-[230px] flex-col items-end justify-center rounded-tl-[16px] rounded-br-[16px] rounded-bl-[16px] bg-color-coral-100 px-3 py-2">
          <p className="max-w-[206px] text-[13px] leading-[1.5] break-words text-color-gray-850">
            {message.body}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start gap-2">
      <ChatAvatar
        name={message.senderName}
        tone={message.avatarTone ?? "green"}
        src={message.avatarSrc}
      />
      <div className="flex w-[304px] shrink-0 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium whitespace-nowrap text-color-gray-750">
          {message.senderName}
        </span>
        <div className="flex w-full items-end gap-2">
          <div className="flex max-w-[230px] flex-col items-start justify-center rounded-tr-[16px] rounded-br-[16px] rounded-bl-[16px] bg-[rgba(97,97,97,0.1)] px-3 py-2">
            <p className="max-w-[206px] text-[13px] leading-[1.5] break-words text-color-gray-850">
              {message.body}
            </p>
          </div>
          <div className="flex items-end gap-2 text-[12px] leading-[1.35] whitespace-nowrap">
            <span className="text-color-gray-650">{message.sentAt}</span>
            {message.unreadLabel && (
              <span className="text-color-coral-500">{message.unreadLabel}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
