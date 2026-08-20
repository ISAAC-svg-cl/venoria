import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" } : {}),
};

export default nextConfig;
