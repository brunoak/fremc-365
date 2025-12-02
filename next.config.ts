import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iestgroup.com.br',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all for MVP flexibility if user adds other logos
      }
    ],
  },
};

export default nextConfig;
