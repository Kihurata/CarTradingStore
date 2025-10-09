// frontend/src/lib/api.ts
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const base = process.env.NEXT_PUBLIC_API_BASE!; 
    const res = await fetch(`${base}${path}`, {
      credentials: "include", // gửi cookie (JWT) nếu có
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
  