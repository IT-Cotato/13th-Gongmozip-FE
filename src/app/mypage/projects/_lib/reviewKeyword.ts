import type { CollaborationKeywordType } from "@/queries/useCollaborationReviewKeywordsQuery";

export const REVIEW_KEYWORD_CONFIG: Record<
  CollaborationKeywordType,
  { emoji: string; label: string; bg: string; text: string }
> = {
  DEPENDABLE: { emoji: "🤝", label: "믿음직한 팀원", bg: "#f9f8f4", text: "#4c4a38" },
  CARING: { emoji: "🌱", label: "배려심 있는 팀원", bg: "#eefbf2", text: "#184224" },
  SINCERE: { emoji: "📚", label: "성실한 팀원", bg: "#ebf7fe", text: "#184966" },
};
