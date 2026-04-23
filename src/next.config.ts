import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: "/music-machine",
  assetPrefix: "/music-machine/",
};

export default nextConfig;
