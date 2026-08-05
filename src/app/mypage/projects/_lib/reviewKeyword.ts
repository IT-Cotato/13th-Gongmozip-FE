type ReviewKeywordConfig = { emoji: string; label: string; bg: string; text: string };

const REVIEW_KEYWORD_CONFIG: Record<string, ReviewKeywordConfig> = {
  DEPENDABLE: { emoji: "🤝", label: "믿음직한 팀원", bg: "#f9f8f4", text: "#4c4a38" },
  CARING: { emoji: "🌱", label: "배려심 있는 팀원", bg: "#eefbf2", text: "#184224" },
  SINCERE: { emoji: "📚", label: "성실한 팀원", bg: "#ebf7fe", text: "#184966" },
};

// 백엔드가 보내는 키워드 코드가 위 세 종류를 벗어나면(추후 키워드 추가 등)
// 깨지지 않도록 중립 스타일로 대체 표시함.
const DEFAULT_REVIEW_KEYWORD_CONFIG: ReviewKeywordConfig = {
  emoji: "💬",
  label: "",
  bg: "#f5f5f5",
  text: "#1f1f1f",
};

export function getReviewKeywordConfig(keyword: string): ReviewKeywordConfig {
  const config = REVIEW_KEYWORD_CONFIG[keyword];
  if (config) return config;
  return { ...DEFAULT_REVIEW_KEYWORD_CONFIG, label: keyword };
}
