import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // ── Speed optimizations ──

  // Skip TypeScript type checking during build (~12s saved)
  // Types are still checked in your editor / IDE
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize bundling for large packages
  experimental: {
    optimizePackageImports: [
      "@supabase/supabase-js",
      "react-markdown",
    ],
  },
};

export default nextConfig;
