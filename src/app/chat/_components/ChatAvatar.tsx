import Image from "next/image";
import type { ChatMessage } from "../_data/mockMessages";

type ChatAvatarProps = {
  name: string;
  tone: NonNullable<ChatMessage["avatarTone"]>;
  src?: string;
};

const AVATAR_TONE_CLASS: Record<NonNullable<ChatMessage["avatarTone"]>, string> = {
  robot: "bg-color-blue-50",
  green: "bg-color-green-100",
  blue: "bg-color-blue-50",
  coral: "bg-color-coral-100",
};

export function ChatAvatar({ name, tone, src }: ChatAvatarProps) {
  const initials = tone === "robot" ? "AI" : name.slice(0, 1);

  return (
    <div className="flex w-[46px] shrink-0 flex-col items-center">
      <div
        className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border-2 border-white ${AVATAR_TONE_CLASS[tone]}`}
      >
        {src ? (
          <Image src={src} alt="" fill sizes="46px" className="object-cover" />
        ) : tone === "robot" ? (
          <div className="flex h-7 w-8 items-center justify-center rounded-[9px] border border-color-blue-200 bg-color-gray-850 text-[8px] font-semibold text-white">
            {initials}
          </div>
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-white/60 text-[15px] font-semibold text-color-gray-750">
            {initials}
          </span>
        )}
      </div>
      <span className="mt-0.5 w-full text-center text-[8px] leading-[1.35] font-semibold text-color-gray-750">
        {name}
      </span>
    </div>
  );
}
