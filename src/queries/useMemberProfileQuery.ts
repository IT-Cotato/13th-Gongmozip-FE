import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type MemberGender = "MALE" | "FEMALE";
export type LoginProvider = "EMAIL" | "KAKAO";

export type MemberProfile = {
  email: string;
  name: string;
  gender: MemberGender;
  birthDate: string;
  loginProvider: LoginProvider;
};

export const MEMBER_PROFILE_QUERY_KEY = ["member", "profile"] as const;

function fetchMemberProfile() {
  return apiFetch<MemberProfile>("/api/members/me");
}

export function useMemberProfileQuery() {
  return useQuery({
    queryKey: MEMBER_PROFILE_QUERY_KEY,
    queryFn: fetchMemberProfile,
  });
}
