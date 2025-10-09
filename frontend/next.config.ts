import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Cho phép tải ảnh từ Supabase
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // ✅ Proxy request từ browser /api/* → backend
  async rewrites() {
    // INTERNAL_API_BASE = http://backend:4000 (trong Docker Compose)
    const base = process.env.INTERNAL_API_BASE || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;