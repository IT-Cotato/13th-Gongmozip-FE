import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type SendVerificationCodeRequest = {
  email: string;
};

function sendVerificationCode(payload: SendVerificationCodeRequest) {
  return apiFetch<void>("/api/members/email/verify-request", {
    method: "POST",
    body: payload,
  });
}

export function useSendVerificationCodeMutation() {
  return useMutation({
    mutationFn: sendVerificationCode,
  });
}
