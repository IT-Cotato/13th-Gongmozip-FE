import { ContactStatusBadge } from "./ContactStatusBadge";
import type { ContactHistoryItem } from "../_data/mockHistory";

export function ContactHistoryCard({
  item,
  onClick,
}: {
  item: ContactHistoryItem;
  onClick: () => void;
}) {
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
          <span>{item.date}</span>
          <span>{item.time}</span>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-2">
        <p className="w-full truncate px-1 text-[17px] leading-[1.35] font-medium text-[#1F1F1F]">
          {item.title}
        </p>
        <div className="w-full rounded-[10px] bg-white p-2">
          <p className="line-clamp-2 text-[13px] leading-[1.5] text-[#949494]">{item.content}</p>
        </div>
      </div>
    </button>
  );
}
