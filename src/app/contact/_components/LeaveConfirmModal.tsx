type LeaveConfirmModalProps = {
  onContinue: () => void;
  onLeave: () => void;
};

export function LeaveConfirmModal({ onContinue, onLeave }: LeaveConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(31,31,31,0.6)] px-8">
      <div className="flex max-h-[400px] w-full flex-col items-center rounded-2xl bg-white px-4 pt-2 pb-4 shadow-[0px_53px_7.5px_rgba(0,0,0,0),0px_34px_7px_rgba(0,0,0,0.01),0px_19px_6px_rgba(0,0,0,0.05),0px_9px_4.5px_rgba(0,0,0,0.09),0px_2px_2.5px_rgba(0,0,0,0.1)]">
        <div className="flex w-full flex-col items-start gap-2.5 px-1 py-4 text-center">
          <p className="w-full text-[20px] leading-[1.35] font-medium text-[#1F1F1F]">
            작성 중인 내용이 있어요.
          </p>
          <p className="w-full text-[17px] leading-[1.5] text-[#616161]">
            지금 나가면 작성 중인 내용이 사라집니다.
          </p>
        </div>
        <div className="flex h-[60px] w-full items-center gap-2 px-2 py-1">
          <button
            type="button"
            onClick={onContinue}
            className="h-full flex-1 rounded-xl border border-[rgba(97,97,97,0.5)] p-2 text-[15px] leading-[1.25] font-semibold text-[#616161]"
          >
            계속 작성하기
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="h-full flex-1 rounded-[14px] bg-[#FF7658] px-[10px] py-[9px] text-[17px] leading-[1.25] font-semibold text-white"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}
