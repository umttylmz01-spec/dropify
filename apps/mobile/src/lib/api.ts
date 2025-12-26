export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  // Placeholder: wire to backend later
  return { ok: false, error: "apiGet not implemented" };
}
