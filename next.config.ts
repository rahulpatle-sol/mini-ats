import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // resumes are capped at 3 MB; this leaves room for the rest of the form
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
