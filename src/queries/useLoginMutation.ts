import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/http";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type BaseResponse<T> = {
  code: string;
  data: T;
  message: string;
  status: number;
};

function isBaseResponse(data: unknown): data is BaseResponse<unknown> {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  );
}

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

async function login(payload: LoginRequest) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

  const accessToken =
    getAccessTokenFromBody(data) ?? response.headers.get("Authorization");

  if (!accessToken) {
    throw new ApiError(response.status, "로그인 토큰을 확인할 수 없습니다.");
  }

  return { accessToken: normalizeAccessToken(accessToken) };
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
  });
}
