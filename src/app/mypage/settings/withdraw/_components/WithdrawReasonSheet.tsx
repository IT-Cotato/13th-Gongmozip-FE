export const WITHDRAW_REASONS = [
  "팀원 매칭 결과가 마음에 들지 않아요.",
  "비매너 사용자를 만났어요.",
  "더이상 필요하지 않아요.",
  "새 계정을 만들고 싶어요.",
  "기타",
];

type WithdrawReasonSheetProps = {
  onSelect: (reason: string) => void;
  onClose: () => void;
};

export function WithdrawReasonSheet({ onSelect, onClose }: WithdrawReasonSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(31,31,31,0.6)]">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 h-full w-full"
      />
      <div className="relative flex w-full max-w-[390px] flex-col items-start rounded-t-2xl bg-white px-5 py-2">
        <div className="flex w-full flex-col items-center pt-4 pb-6">
          <span className="h-1 w-12 rounded-full bg-[rgba(97,97,97,0.22)]" />
        </div>
        <div className="flex w-full flex-col items-start pb-2">
          {WITHDRAW_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => onSelect(reason)}
              className="w-full py-3 text-left text-[17px] leading-[1.5] font-medium text-[#616161]"
            >
              {reason}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
