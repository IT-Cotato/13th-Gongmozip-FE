import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import { useAuthStore } from "@/stores/useAuthStore";

export type MemberGender = "MALE" | "FEMALE";

export type MemberProfile = {
  email: string;
  // 카카오/구글 등 SNS 간편가입 시에도 백엔드가 SNS 제공자로부터 받아온 이름을
  // 함께 저장해 내려주므로 항상 채워져 있다.
  name: string;
  gender: MemberGender;
  // SNS 간편가입 직후에는 아직 입력받지 않아 null로 내려올 수 있음.
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
