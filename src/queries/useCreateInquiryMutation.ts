import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type CreateInquiryInput = {
  email: string;
  password: string;
  title: string;
  content: string;
};

function createInquiry(input: CreateInquiryInput) {
  return apiFetch<void>("/api/inquiries", {
    method: "POST",
    body: input,
  });
}

export function useCreateInquiryMutation() {
  return useMutation({
    mutationFn: createInquiry,
  });
}
