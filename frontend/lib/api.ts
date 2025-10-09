// frontend/src/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const fullUrl = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const res = await fetch(fullUrl, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[API ERROR] ${res.status} - ${text}`);
    throw new Error(text || res.statusText);
  }

  return res.json();
}