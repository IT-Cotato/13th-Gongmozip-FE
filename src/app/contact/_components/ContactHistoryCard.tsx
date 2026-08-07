import { ContactStatusBadge } from "./ContactStatusBadge";
import { formatContactDate } from "../_lib/date";
import type { InquirySummary } from "@/queries/useInquiryListMutation";

export function ContactHistoryCard({
  item,
  onClick,
}: {
  item: InquirySummary;
  onClick: () => void;
}) {
  const { date, time } = formatContactDate(item.createdAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-start gap-3 rounded-2xl bg-[#F5F5F5] p-4 text-left"
    >
      <div className="flex w-full items-center justify-between">
        <ContactStatusBadge status={item.status} />
        <div className="flex items-center gap-2 text-[13px] leading-[1.35] font-medium whitespace-nowrap text-[#949494]">
          <span>작성일</span>
          <span>{date}</span>
          <span>{time}</span>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-2">
        <p className="w-full truncate px-1 text-[17px] leading-[1.35] font-medium text-[#1F1F1F]">
          {item.title}
        </p>
        <div className="w-full rounded-[10px] bg-white p-2">
          <p className="line-clamp-2 text-[13px] leading-[1.5] text-[#949494]">
            {item.contentPreview}
          </p>
        </div>
      </div>
    </button>
  );
}
