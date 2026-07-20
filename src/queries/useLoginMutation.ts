import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

function login(payload: LoginRequest) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
  });
}
