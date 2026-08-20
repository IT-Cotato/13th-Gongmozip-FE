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
  category: string;
  dDay: string;
  daysRemaining: number;
  status: "UPCOMING" | "OPEN" | "CLOSED";
  viewCount: number;
  posterImageUrl: string;
  isScrapped: boolean;
};

export type ContestDetail = ContestSummary & {
  applicationPeriod: string;
  announcementDate: string;
  eligibility: string;
  prize: string;
  location: string;
  teamParticipation: string;
  description: string;
  websiteUrl: string;
  detailImageUrls: string[];
};
