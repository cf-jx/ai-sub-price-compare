import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ai-sub-price-compare",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
