import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Skip ESLint checks on Vercel builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Skip TypeScript type errors on Vercel builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
