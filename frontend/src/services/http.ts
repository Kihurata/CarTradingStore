// frontend/src/services/http.ts
const isServer = typeof window === "undefined";

// Server (SSR) gọi trực tiếp backend
const INTERNAL_API_BASE =
  process.env.INTERNAL_API_BASE || "http://localhost:4000";

// Client (browser) gọi qua rewrite để tránh CORS
// KHÔNG để http://localhost:4000/api ở đây, mà để '/api'
const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "/api";

export function apiUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return isServer ? `${INTERNAL_API_BASE}${path}` : `${CLIENT_API_BASE}${path}`;
}
