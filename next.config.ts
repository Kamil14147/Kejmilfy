import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages configuration
  output: 'standalone',
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow cross-origin dev requests (preview panel)
  allowedDevOrigins: ["*.space-z.ai", "*.chatglm.cn"],
  // Compress responses
  compress: true,
  poweredByHeader: false,
  // Experimental: optimize package imports for faster dev compilation
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@supabase/supabase-js",
    ],
  },
};

export default nextConfig;
