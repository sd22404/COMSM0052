import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: "/COMSM0052",
  assetPrefix: "/COMSM0052/",
};

export default nextConfig;
