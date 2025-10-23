/* eslint-disable @typescript-eslint/no-explicit-any */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "");

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const fullUrl = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  
  const res = await fetch(fullUrl, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const copy = res.clone();
    const ct = res.headers.get("content-type") || "";
    let payload: unknown = null;
    try {
      payload = ct.includes("application/json") ? await res.json() : (await res.text());
    } catch {
      try { payload = await copy.text(); } catch {}
    }
    console.error("[API ERROR]", res.status, "-", payload ?? "<unreadable>");
    throw new Error(JSON.stringify({
      status: res.status,
      error: payload || res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
    }));
  }


  if (res.status === 204) return undefined as T;

  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  } else {
    const text = await res.text();
    try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
  }
}

//phần thêm mới để wrapper cho api.post để không sửa api.ts, k có sửa file cũ (này huy châu comment)
(api as any).post = async function <T>(path: string, data: any, config?: RequestInit): Promise<T> {
  return api<T>(path, {
    method: "POST",
    body: data,
    ...config,
  });
};
