import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import type { InquiryAuthInput, InquiryStatus } from "./useInquiryListMutation";

export type InquiryDetail = {
  inquiryId: number;
  status: InquiryStatus;
  title: string;
  content: string;
  email: string;
  createdAt: string;
  answerContent: string | null;
  answeredAt: string | null;
};

function fetchInquiryDetail(inquiryId: string, auth: InquiryAuthInput) {
  return apiFetch<InquiryDetail>(`/api/inquiries/${encodeURIComponent(inquiryId)}`, {
    method: "POST",
    body: auth,
  });
}

export function useInquiryDetailQuery(inquiryId: string, auth: InquiryAuthInput | null) {
  return useQuery({
    queryKey: ["inquiries", inquiryId, "detail", auth?.email],
    queryFn: () => fetchInquiryDetail(inquiryId, auth as InquiryAuthInput),
    enabled: auth !== null,
  });
}
