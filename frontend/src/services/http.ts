const isServer = typeof window === "undefined";

const INTERNAL_API_BASE =
  process.env.INTERNAL_API_BASE || "http://localhost:4000";

const CLIENT_API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export function apiUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return isServer ? `${INTERNAL_API_BASE}${path}` : `${CLIENT_API_BASE}${path}`;
}
