export interface ApiError {
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

/**
 * Safely extract a human-readable message from an unknown (axios-style) error.
 * Checks the server response body (string, or an object with `message`/`title`),
 * then the error's own `message`, and finally the provided fallback.
 */
export function getApiErrorMessage(err: unknown, fallback = "操作失敗"): string {
  const e = err as ApiError;
  const data = e?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    if (typeof rec.message === "string") return rec.message;
    if (typeof rec.title === "string") return rec.title;
  }
  if (typeof e?.message === "string") return e.message;
  return fallback;
}
