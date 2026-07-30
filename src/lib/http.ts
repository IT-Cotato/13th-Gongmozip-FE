import { useAuthStore } from "@/stores/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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
type BaseResponse<T> = {
  status: number;
  code: string;
  message: string;
  data: T;
};

function isBaseResponse(data: unknown): data is BaseResponse<unknown> {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  );
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const accessToken = useAuthStore.getState().accessToken;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = isBaseResponse(data) ? data.message : "요청 처리 중 오류가 발생했습니다.";
    const code = isBaseResponse(data) ? data.code : undefined;
    throw new ApiError(response.status, message, code);
  }

  return (isBaseResponse(data) ? data.data : data) as T;
}
