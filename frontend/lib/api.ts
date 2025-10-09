import { apiUrl } from "@/src/services/http";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiUrl(path);

  const res = await fetch(url, {
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
    throw new Error(text || res.statusText);
  }

  return res.json();
}
