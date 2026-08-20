import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";

export type MemberGender = "MALE" | "FEMALE";

export type MemberProfile = {
  email: string;
  // 이름을 아직 입력하지 않은 회원(주로 SNS 간편가입 직후)은 null로 내려옴
  name: string | null;
  gender: MemberGender;
  // SNS 간편가입 직후에는 아직 입력받지 않아 null로 내려올 수 있음
  // (이름을 아직 입력하지 않은 경우와 동일한 케이스).
  birthDate: string | null;
  snsType: "KAKAO" | "GOOGLE" | null;
  snsLinked: boolean;
  marketingConsentEmail: boolean;
  marketingConsentSms: boolean;
  profileImageUrl: string | null;
};

const SNS_LOGIN_HINT: Record<"KAKAO" | "GOOGLE", string> = {
  KAKAO: "카카오톡 로그인 사용중",
  GOOGLE: "구글 로그인 사용중",
};

// snsLinked가 true인데 snsType이 알 수 없는 값(백엔드 확장 등)일 때를 대비한 안전한 기본 문구.
export function getSnsLoginHint(snsType: MemberProfile["snsType"]) {
  return snsType ? (SNS_LOGIN_HINT[snsType] ?? "소셜 로그인 사용중") : "소셜 로그인 사용중";
}

// accessToken을 키에 포함시켜, 로그아웃 없이 다른 계정으로 로그인해도
// 이전 계정의 캐시된 데이터가 잠깐 보이는 일이 없도록 세션별로 캐시를 분리한다.
export const memberProfileQueryKey = (accessToken: string | null) =>
  ["member", "profile", accessToken] as const;

function fetchMemberProfile() {
  return apiFetch<MemberProfile>("/api/members/me");
}

export function useMemberProfileQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: memberProfileQueryKey(accessToken),
    queryFn: fetchMemberProfile,
    enabled: Boolean(accessToken),
  });
}
