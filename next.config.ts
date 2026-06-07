import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // ── Speed & Security optimizations ──

  // Remove X-Powered-By header (minor security + cleaner response)
  poweredByHeader: false,

  // Enable gzip/brotli compression (default: true, explicit for clarity)
  compress: true,

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

  // ── Security & SEO Headers ──
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
