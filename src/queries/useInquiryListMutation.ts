import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type InquiryAuthInput = {
  email: string;
  password: string;
};

export type InquiryStatus = "PENDING" | "ANSWERED";

export type InquirySummary = {
  inquiryId: number;
  status: InquiryStatus;
  title: string;
  contentPreview: string;
  createdAt: string;
};

export type InquiryListResult = {
  inquiries: InquirySummary[];
  totalCount: number;
};

function fetchInquiryList(input: InquiryAuthInput) {
  return apiFetch<InquiryListResult>("/api/inquiries/list", {
    method: "POST",
    body: input,
  });
}

export function useInquiryListMutation() {
  return useMutation({
    mutationFn: fetchInquiryList,
  });
}
