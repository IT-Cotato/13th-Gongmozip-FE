import type { CollaborationDisplayTrait } from "../_data/collaborationTest";

type CollaborationTraitBarsProps = {
  traits: readonly CollaborationDisplayTrait[];
  labelColor: string;
  barColor: string;
  emptyBarColor?: string;
  segmentBorderColor?: string;
};

export default function CollaborationTraitBars({
  traits,
  labelColor,
  barColor,
  emptyBarColor = "rgba(97, 97, 97, 0.1)",
  segmentBorderColor = "#F9F8F4",
}: CollaborationTraitBarsProps) {
  return (
    <div className="flex w-full flex-col gap-[8px]">
      {traits.map((trait) => (
        <div
          className="grid grid-cols-[40px_1fr_40px] items-center gap-[8px]"
          key={`${trait.left}-${trait.right}`}
        >
          <span
            className="font-[Pretendard] text-[12px] font-semibold leading-[135%]"
            style={{ color: labelColor }}
          >
            {trait.left}
          </span>
          <div
            aria-hidden="true"
            className="relative top-[3px] flex h-[7px] shrink-0 self-stretch overflow-hidden rounded-[90px]"
            style={{ backgroundColor: emptyBarColor }}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                className="h-full flex-1 border-r last:border-r-0"
                key={index}
                style={{
                  backgroundColor: index < trait.filledSegmentCount ? barColor : emptyBarColor,
                  borderColor: segmentBorderColor,
                }}
              />
            ))}
          </div>
          <span className="text-right font-['42dot_Sans'] text-[13px] font-medium leading-[125%] text-[#949494]">
            {trait.right}
          </span>
        </div>
      ))}
    </div>
  );
}
