import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    tsconfigPath: "tsconfig.pages.json",
  },
};

export default nextConfig;