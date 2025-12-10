// next.config.ts
import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    // ⚠️ ghi CSP trên 1 dòng (không xuống dòng) để tránh header bị ngắt
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      // Cho script của YouTube player
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com",
      // Cho phép nhúng iframe YouTube
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      // Ảnh: chính app + data/blob + Supabase + thumbnail của YouTube
      "img-src 'self' data: blob: https://*.supabase.co https://i.ytimg.com",
      // Media (nếu có video/âm thanh tĩnh)
      "media-src 'self' data: blob: https://*.supabase.co",
      // Kết nối XHR/fetch (BE, Supabase, YouTube nếu cần)
      `connect-src 'self' ${process.env.INTERNAL_API_BASE ?? "http://localhost:4000"} https://*.supabase.co https://www.youtube.com https://www.youtube-nocookie.com`,
      // CSS nội tuyến từ Tailwind/Next
      "style-src 'self' 'unsafe-inline'",
      // Font local + data:
      "font-src 'self' data:"
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ✅ Cho phép tải ảnh từ Supabase (Next/Image)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      // (tuỳ chọn) nếu bạn có ảnh thumb từ YouTube
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  output: "standalone",
  // ✅ Proxy /api/* → backend
  async rewrites() {
    const base = process.env.INTERNAL_API_BASE || "http://localhost:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
      },
    ];
  },

  // ✅ Gắn CSP cho mọi route
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
