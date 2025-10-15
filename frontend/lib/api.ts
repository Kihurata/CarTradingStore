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
    try {
      if (contentType.includes("application/json")) {
        const j = await res.json();
        console.error(`[API ERROR] ${res.status} -`, j);
        throw new Error(JSON.stringify({ status: res.status, ...j }));
      } else {
        const text = (await res.text())?.trim();
        console.error(`[API ERROR] ${res.status} - ${text}`);
        throw new Error(JSON.stringify({ status: res.status, error: text || res.statusText }));
      }
    } catch {
      console.error(`[API ERROR] ${res.status} - <unreadable body>`);
      throw new Error(JSON.stringify({ status: res.status, error: res.statusText }));
    }
  }

  if (res.status === 204) return undefined as T;

  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  } else {
    const text = await res.text();
    try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
  }
}
