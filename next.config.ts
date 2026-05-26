import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/identify": ["./data/**"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.plantnet.org" },
      { protocol: "https", hostname: "bs.plantnet.org" },
      { protocol: "https", hostname: "*.plantnet-project.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
