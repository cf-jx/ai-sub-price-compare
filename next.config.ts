import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ai-sub-price-compare",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
