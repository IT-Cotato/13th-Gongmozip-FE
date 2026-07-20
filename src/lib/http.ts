// 브라우저는 같은 origin의 /api/*로만 요청한다. 실제 백엔드로의 전달은
// next.config.ts의 rewrites가 서버사이드에서 처리하므로 CORS가 발생하지 않는다.

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

  const response = await fetch(path, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
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
