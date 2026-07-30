import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

function changePassword(payload: ChangePasswordRequest) {
  return apiFetch<void>("/api/members/me/password", {
    method: "PATCH",
    body: payload,
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePassword,
  });
}
