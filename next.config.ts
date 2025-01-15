import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
      serverActions: {
        bodySizeLimit: '20mb',
      },
    },
  images: {
    domains: ['vkkedsgdpjzsjqjrbbfh.supabase.co'],
  },
};

export default nextConfig;
