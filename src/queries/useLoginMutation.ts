import { useMutation } from "@tanstack/react-query";
import { ApiError, buildApiUrl, isBaseResponse } from "@/lib/http";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

const AUTHORIZATION_HEADER = "Authorization";

function normalizeAccessToken(accessToken: string) {
  return accessToken.startsWith("Bearer ") ? accessToken.slice("Bearer ".length) : accessToken;
}

function getAccessTokenFromBody(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "accessToken" in data &&
    typeof (data as { accessToken: unknown }).accessToken === "string"
  ) {
    return (data as { accessToken: string }).accessToken;
  }

  if (isBaseResponse(data)) {
    return getAccessTokenFromBody(data.data);
  }

  return null;
}

function getAccessTokenFromHeaders(response: Response) {
  const authorization = response.headers.get(AUTHORIZATION_HEADER);

  return authorization?.trim() ? authorization : null;
}

async function login(payload: LoginRequest) {
  const response = await fetch(buildApiUrl("/api/auth/login"), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = isBaseResponse(data) ? data.message : "로그인에 실패했습니다.";
    const code = isBaseResponse(data) ? data.code : undefined;
    throw new ApiError(response.status, message, code);
  }

  const accessTokenFromBody = getAccessTokenFromBody(data);
  // Cross-origin responses expose this header only when the API sends
  // Access-Control-Expose-Headers: Authorization.
  const accessToken = accessTokenFromBody ?? getAccessTokenFromHeaders(response);

  if (!accessToken) {
    throw new ApiError(
      response.status,
      "로그인 응답에서 토큰을 확인할 수 없습니다. accessToken 응답 본문 또는 노출된 Authorization 헤더가 필요합니다.",
    );
  }

  return { accessToken: normalizeAccessToken(accessToken) };
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
  });
}
