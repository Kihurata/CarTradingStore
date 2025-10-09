import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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