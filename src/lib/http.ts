import { useAuthStore } from "@/stores/useAuthStore";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

// 백엔드 공통 응답 포맷: { status, code, message, data }
export type BaseResponse<T> = {
  status: number;
  code: string;
  message: string;
  data: T;
};

export function isBaseResponse(data: unknown): data is BaseResponse<unknown> {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  );
}

// 백엔드는 refreshToken을 HttpOnly 쿠키로 내려주고 /api/auth/reissue로 accessToken을
// 재발급할 수 있는데, 프론트가 이를 호출하지 않아 accessToken 만료 즉시 강제 로그아웃되던
// 문제가 있었음. 동시에 여러 요청이 401을 받아도 재발급은 한 번만 일어나도록 공유 Promise로 처리.
let reissuePromise: Promise<string | null> | null = null;

function extractAccessToken(data: unknown): string | null {
  if (
    typeof data === "object" &&
    data !== null &&
    "accessToken" in data &&
    typeof (data as { accessToken: unknown }).accessToken === "string"
  ) {
    return (data as { accessToken: string }).accessToken;
  }

  return null;
}

export function reissueAccessToken(): Promise<string | null> {
  if (!reissuePromise) {
    reissuePromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          return null;
        }

        const text = await response.text();
        const data = parseResponseBody(text);

        return extractAccessToken(isBaseResponse(data) ? data.data : data);
      } catch {
        return null;
      } finally {
        reissuePromise = null;
      }
    })();
  }

  return reissuePromise;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
  isRetryAfterReissue = false,
): Promise<T> {
  const { body, headers, ...rest } = options;
  const accessToken = useAuthStore.getState().accessToken;
  const normalizedAccessToken = normalizeAccessToken(accessToken);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(normalizedAccessToken ? { Authorization: `Bearer ${normalizedAccessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const data = parseResponseBody(text);

  if (!response.ok) {
    if (response.status === 401 && !isRetryAfterReissue && normalizedAccessToken) {
      const newAccessToken = await reissueAccessToken();

      if (newAccessToken) {
        useAuthStore.getState().setAccessToken(newAccessToken);
        return apiFetch<T>(path, options, true);
      }
    }

    const message = isBaseResponse(data) ? data.message : "요청 처리 중 오류가 발생했습니다.";
    const code = isBaseResponse(data) ? data.code : undefined;

    if (response.status === 401) {
      useAuthStore.getState().clearAccessToken();
    }

    throw new ApiError(response.status, message, code);
  }

  return (isBaseResponse(data) ? data.data : data) as T;
}

function parseResponseBody(text: string): unknown {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeAccessToken(accessToken: string | null) {
  if (!accessToken) {
    return null;
  }

  return accessToken.startsWith("Bearer ") ? accessToken.slice("Bearer ".length) : accessToken;
}
