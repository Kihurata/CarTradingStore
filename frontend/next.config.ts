import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< Updated upstream
  /* config options here */
=======
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

>>>>>>> Stashed changes
};

export default nextConfig;
