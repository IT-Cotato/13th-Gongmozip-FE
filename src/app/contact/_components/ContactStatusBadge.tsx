import type { ContactHistoryStatus } from "../_data/mockHistory";

export function ContactStatusBadge({ status }: { status: ContactHistoryStatus }) {
  const isAnswered = status === "answered";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-[3px] text-[12px] leading-[1.35] font-semibold ${
        isAnswered ? "bg-[#FF7658] text-white" : "bg-[#E8E8E8] text-[#616161]"
      }`}
    >
      {isAnswered ? "답변 완료" : "처리중"}
    </span>
  );
}
