import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

function logout() {
  return apiFetch<void>("/api/auth/logout", { method: "POST" });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout,
  });
}
