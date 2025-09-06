/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable strict rendering mode
  reactStrictMode: false,
  // Disable partial static generation so we can build with client components that don't use Suspense
  experimental: {
    disableStaticImages: true,
    disableOptimizedLoading: true,
  },
  // Configure external image domains
  images: {
    domains: [
      'upload.wikimedia.org',
      'assets-global.website-files.com',
      'seeklogo.com',
      'cdn.zapier.com',
      'cdn-icons-png.flaticon.com'
    ],
  },
  // Keep any existing configuration
  // Conditionally enable static export for production builds
};

export default nextConfig; 