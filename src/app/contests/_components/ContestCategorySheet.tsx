import type { ContestCategory } from "../_types";

const CONTEST_CATEGORIES: ContestCategory[] = [
  "전체",
  "IT/AI/기술",
  "마케팅/광고/브랜딩",
  "기획/아이디어",
  "미술/디자인",
  "데이터 분석",
  "사진/영상",
];

export function ContestCategorySheet() {
  return (
    <section aria-label="공모전 분야 선택">
      <h2>분야 선택</h2>
      <ul>
        {CONTEST_CATEGORIES.map((category) => (
          <li key={category}>{category}</li>
        ))}
      </ul>
    </section>
  );
}
