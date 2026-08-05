import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type MemberGender = "MALE" | "FEMALE";

export type MemberProfile = {
  email: string;
  // 이름을 아직 입력하지 않은 회원(주로 SNS 간편가입 직후)은 null로 내려옴
  name: string | null;
  gender: MemberGender;
  birthDate: string;
  snsType: "KAKAO" | null;
  snsLinked: boolean;
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
