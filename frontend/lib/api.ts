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

//phần thêm mới để wrapper cho api.post để không sửa api.ts, k có sửa file cũ (này huy châu comment)
(api as any).post = async function <T>(path: string, data: any, config?: RequestInit): Promise<T> {
  return api<T>(path, {
    method: "POST",
    body: data,
    ...config,
  });
};
