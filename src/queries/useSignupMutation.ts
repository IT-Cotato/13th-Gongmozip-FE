import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type SignupGender = "MALE" | "FEMALE";

export type SignupRequest = {
  email: string;
  password: string;
  gender: SignupGender;
  birthDate: string;
};

export type SignupResponse = {
  memberId: number;
  email: string;
};

function signup(payload: SignupRequest) {
  return apiFetch<SignupResponse>("/api/members/signup", {
    method: "POST",
    body: payload,
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: signup,
  });
}
