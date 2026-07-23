import type { ContestCategory } from "../_types";

export const CONTEST_CATEGORIES: ContestCategory[] = [
  "전체",
  "IT/AI/기술",
  "마케팅/광고/브랜딩",
  "기획/아이디어",
  "미술/디자인",
  "데이터 분석",
  "사진/영상",
];

type ContestCategorySheetProps = {
  selectedCategory: ContestCategory;
  onSelect: (category: ContestCategory) => void;
  onClose: () => void;
};

export function ContestCategorySheet({
  selectedCategory,
  onSelect,
  onClose,
}: ContestCategorySheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(31,31,31,0.6)]">
      <button
        type="button"
        aria-label="분야 선택 닫기"
        onClick={onClose}
        className="absolute inset-0 h-full w-full"
      />
      <section
        aria-label="공모전 분야 선택"
        className="relative flex w-full max-w-[390px] flex-col rounded-t-2xl bg-white px-3 pt-6 pb-8"
      >
        <div className="flex w-full justify-center pb-[38px]">
          <span className="flex h-1 w-12 items-start gap-2.5 rounded-full bg-[rgba(97,97,97,0.22)]" />
        </div>
        <h2 className="mb-2 flex-1 basis-0 text-[22px] leading-[135%] font-bold text-color-gray-850">
          분야 선택
        </h2>
        <ul className="flex flex-col">
          {CONTEST_CATEGORIES.map((category) => (
            <li key={category}>
              <button
                type="button"
                aria-pressed={selectedCategory === category}
                onClick={() => onSelect(category)}
                className="w-full py-3 text-left text-[15px] leading-[125%] font-bold text-color-gray-650"
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
