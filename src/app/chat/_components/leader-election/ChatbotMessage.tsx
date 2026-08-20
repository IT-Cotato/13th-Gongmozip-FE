import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function ChatbotTextMessage({ body, sentAt }: { body: string; sentAt?: string }) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {body}
          </p>
          <MessageMeta sentAt={sentAt} />
        </div>
      </div>
    </article>
  );
}

export function BotMessage({
  body,
  buttonDisabled = false,
  buttonLabel,
  children,
  onButtonClick,
  sentAt,
}: {
  body: string;
  buttonDisabled?: boolean;
  buttonLabel: string;
  children?: ReactNode;
  onButtonClick: () => void;
  sentAt?: string;
}) {
  const bubbleRef = useRef<HTMLParagraphElement>(null);
  const [bubbleWidth, setBubbleWidth] = useState<number>();
  const actionWidthStyle: CSSProperties = bubbleWidth ? { width: bubbleWidth } : { width: 230 };

  useEffect(() => {
    const bubbleElement = bubbleRef.current;

    if (!bubbleElement) {
      return;
    }

    const updateBubbleWidth = () => {
      setBubbleWidth(Math.ceil(bubbleElement.getBoundingClientRect().width));
    };

    updateBubbleWidth();

    const resizeObserver = new ResizeObserver(updateBubbleWidth);
    resizeObserver.observe(bubbleElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [body]);

  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p
            ref={bubbleRef}
            className="max-w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850"
          >
            {body}
          </p>
          <MessageMeta sentAt={sentAt} />
        </div>
        {children ? <div style={actionWidthStyle}>{children}</div> : null}
        <button
          className={`mt-1 flex h-9 items-center justify-center rounded-[10px] px-2 text-[13px] leading-[1.25] font-semibold ${
            buttonDisabled
              ? "bg-[rgba(97,97,97,0.10)] text-color-gray-350"
              : "bg-color-coral-500 text-white"
          }`}
          disabled={buttonDisabled}
          onClick={onButtonClick}
          style={actionWidthStyle}
          type="button"
        >
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}

export function ContestDeadlineReminderMessage({
  onComplete,
  onIncomplete,
  sentAt,
}: {
  onComplete: () => void;
  onIncomplete: () => void;
  sentAt?: string;
}) {
  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <p className="w-[230px] whitespace-pre-line rounded-[16px] rounded-tl-none bg-[rgba(97,97,97,0.10)] px-3 py-2 text-[13px] leading-[1.5] text-color-gray-850">
            {`공모전 마감일 하루 전입니다.
공모전 제출을 완료했다면 '진행 완료'를, 완료하지 못했다면 '미완료'를 선택해주세요.
해당 버튼은 팀장님만 선택할 수 있습니다. 팀장님이 '진행 완료'를 선택하면 본 공모전 프로젝트가 종료되며, 팀원 리뷰 단계로 이동합니다.`}
          </p>
          <MessageMeta sentAt={sentAt} />
        </div>
        <div className="mt-1 flex h-9 w-[230px] gap-2">
          <button
            className="flex h-full min-w-0 flex-1 items-center justify-center rounded-[10px] bg-color-gray-650 px-3 text-[13px] leading-[1.25] font-semibold text-white"
            onClick={onIncomplete}
            type="button"
          >
            미완료
          </button>
          <button
            className="flex h-full min-w-0 flex-1 items-center justify-center rounded-[10px] bg-color-coral-500 px-3 text-[13px] leading-[1.25] font-semibold text-white"
            onClick={onComplete}
            type="button"
          >
            진행 완료
          </button>
        </div>
      </div>
    </article>
  );
}

export function ChatbotSystemNotice({
  action,
  actorName,
  body,
}: {
  action: "added" | "removed";
  actorName: string;
  body?: string;
}) {
  const actionLabel = action === "added" ? "추가" : "삭제";
  const noticeText = body ?? `${actorName}님이 챗봇을 ${actionLabel}했습니다.`;

  return (
    <div className="flex w-full justify-center">
      <p className="rounded-full bg-color-coral-100 px-2 py-1 text-center text-[12px] leading-[1.35] font-semibold whitespace-nowrap text-color-coral-700">
        {noticeText}
      </p>
    </div>
  );
}

export function ChatbotUsageGuideMessage({
  body,
  examples,
  onUseChatbot,
  sentAt,
}: {
  body?: string;
  examples?: string[];
  onUseChatbot?: () => void;
  sentAt?: string;
} = {}) {
  const usageExamples = examples ?? [];
  const bodyLines = (body ?? "활용 예시")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const title = stripMarkdownBold(bodyLines[0] ?? "활용 예시");
  const description = bodyLines.slice(1).join("\n") || "저를 사용할 수 있는 예시입니다.";

  return (
    <article className="flex w-full items-start gap-2">
      <ChatbotAvatar />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-[12px] leading-[1.35] font-medium text-color-gray-750">챗봇</span>
        <div className="flex w-full items-end gap-2">
          <div className="w-[230px] rounded-[16px] rounded-tl-none bg-color-gray-150 px-3 py-2 text-[13px] leading-[1.5] text-color-coral-900">
            <p className="font-semibold text-color-coral-700">{title}</p>
            <div className="mt-1 flex gap-2.5 py-1">
              <span className="w-0.5 rounded-full bg-color-coral-500" />
              <div>
                {description ? <p className="whitespace-pre-line">{description}</p> : null}
                {usageExamples.length > 0 ? (
                  <div className="mt-1 space-y-0.5">
                    {usageExamples.map((example) => (
                      <p key={example}>{formatChatbotExample(example)}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <MessageMeta sentAt={sentAt} />
        </div>
        <button
          className="mt-1 flex h-9 w-[230px] items-center justify-center rounded-[10px] bg-color-coral-500 px-3 text-[13px] leading-[1.25] font-semibold text-white"
          onClick={onUseChatbot}
          type="button"
        >
          @챗봇에게 말하기
        </button>
      </div>
    </article>
  );
}

function stripMarkdownBold(value: string) {
  return value.replace(/^\*\*(.*)\*\*$/, "$1");
}

function formatChatbotExample(example: string) {
  return example.startsWith("@챗봇 ") ? example : `@챗봇 ${example}`;
}

export function ChatbotAvatar() {
  return (
    <div className="relative mt-0.5 size-[46px] shrink-0 overflow-hidden rounded-full border-2 border-white bg-color-blue-50">
      <Image src="/icons/chat/chat_bot.svg" alt="" fill sizes="46px" className="object-cover" />
    </div>
  );
}

export function MessageMeta({ sentAt, unreadLabel }: { sentAt?: string; unreadLabel?: string }) {
  return (
    <span className="flex shrink-0 items-end gap-2 text-[12px] leading-[1.35]">
      {sentAt ? <span className="text-color-gray-650">{sentAt}</span> : null}
      {unreadLabel ? <span className="text-color-coral-500">{unreadLabel}</span> : null}
    </span>
  );
}
