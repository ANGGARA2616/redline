// Redline - RedQueue
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Tree-shake icon imports — hanya icon yang dipakai yang di-bundle
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
