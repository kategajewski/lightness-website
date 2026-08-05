import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.163"],
  serverExternalPackages: ["stripe"],
  async headers() {
    return [{
      source: "/:private(account|checkout|create-password|forgot-password|library|login|reset-password)/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
    }];
  },
};

export default nextConfig;
