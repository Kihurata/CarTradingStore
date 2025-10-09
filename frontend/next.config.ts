import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ✅ Cho phép tải ảnh từ Supabase
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },


  async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "http://backend:4000/api/:path*",
    },
  ];
}


};

export default nextConfig;
