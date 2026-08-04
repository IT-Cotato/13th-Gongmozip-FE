import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
  newPasswordConfirm: string;
};

function resetPassword(payload: ResetPasswordRequest) {
  return apiFetch<void>("/api/auth/password-reset", {
    method: "PATCH",
    body: payload,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword,
  });
}
