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
    return [
      {
        source: "/api/:path*",
        // Local dev 2 terminal:
        // destination: "http://localhost:4000/api/:path*",

        // Docker Compose: frontend container vẫn proxy về host
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
