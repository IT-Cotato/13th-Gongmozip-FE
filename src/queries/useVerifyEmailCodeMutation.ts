import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type VerifyEmailCodeRequest = {
  email: string;
  code: string;
};

function verifyEmailCode(payload: VerifyEmailCodeRequest) {
  return apiFetch<void>("/api/members/email/verify", {
    method: "POST",
    body: payload,
  });
}

export function useVerifyEmailCodeMutation() {
  return useMutation({
    mutationFn: verifyEmailCode,
  });
}
