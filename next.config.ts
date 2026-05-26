import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/identify": ["./data/**"],
  },
};

export default nextConfig;
