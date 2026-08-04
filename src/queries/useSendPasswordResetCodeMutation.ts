import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type SendPasswordResetCodeRequest = {
  email: string;
};

function sendPasswordResetCode(payload: SendPasswordResetCodeRequest) {
  return apiFetch<void>("/api/auth/password-reset/code", {
    method: "POST",
    body: payload,
  });
}

export function useSendPasswordResetCodeMutation() {
  return useMutation({
    mutationFn: sendPasswordResetCode,
  });
}
