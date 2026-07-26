export type ContestCategory =
  | "전체"
  | "IT/AI/기술"
  | "마케팅/광고/브랜딩"
  | "기획/아이디어"
  | "미술/디자인"
  | "데이터 분석"
  | "사진/영상";

export type ContestSummary = {
  id: string;
  title: string;
  organizer: string;
  category: ContestCategory;
  dDay: string;
  viewCount: number;
  posterImageUrl: string;
  isScrapped: boolean;
};

export type ContestDetail = ContestSummary & {
  applicationPeriod: string;
  eligibility: string;
  prize: string;
  description: string;
  websiteUrl: string;
};
