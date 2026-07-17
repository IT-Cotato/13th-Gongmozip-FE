type SuccessModalProps = {
  onClose: () => void;
};

export function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-white px-6 py-8 text-center">
        <img src="/images/check-circle.svg" alt="" className="h-10 w-10" />
        <p className="text-[15px] leading-[1.5] font-semibold text-[#1F1F1F]">
          문의가 성공적으로 접수되었어요!
        </p>
        <p className="text-[13px] leading-[1.5] text-[#616161]">빠른 시일 내에 답변드릴게요.</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl bg-[#FF7658] py-3 text-[15px] font-semibold text-white"
        >
          확인
        </button>
      </div>
    </div>
  );
}
