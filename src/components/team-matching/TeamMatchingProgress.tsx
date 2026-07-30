type TeamMatchingProgressProps = {
  currentStep: number;
  totalSteps?: number;
};

export default function TeamMatchingProgress({
  currentStep,
  totalSteps = 5,
}: TeamMatchingProgressProps) {
  return (
    <div
      aria-label={`${totalSteps}단계 중 ${currentStep}단계`}
      className="mt-5 flex h-1 shrink-0 gap-[2px] px-4"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const isActive = index < currentStep;

        return (
          <span
            className={`h-1 flex-1 rounded-full ${
              isActive ? "bg-[#FF7658]" : "bg-[rgba(97,97,97,0.10)]"
            }`}
            key={index}
          />
        );
      })}
    </div>
  );
}
