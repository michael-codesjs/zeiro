import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'upload.wikimedia.org',
      'seeklogo.com'
    ],
    unoptimized: true,
  },
};

export default nextConfig;
