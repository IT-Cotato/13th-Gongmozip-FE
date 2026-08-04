import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type VerifyPasswordResetCodeRequest = {
  email: string;
  code: string;
};

export type VerifyPasswordResetCodeResponse = {
  passwordResetToken: string;
};

function verifyPasswordResetCode(payload: VerifyPasswordResetCodeRequest) {
  return apiFetch<VerifyPasswordResetCodeResponse>("/api/auth/password-reset/verify", {
    method: "POST",
    body: payload,
  });
}

export function useVerifyPasswordResetCodeMutation() {
  return useMutation({
    mutationFn: verifyPasswordResetCode,
  });
}
