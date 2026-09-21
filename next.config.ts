import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["stripe"],
  outputFileTracingIncludes: {
    "/library/reiki-rising-fall-2026/materials/*": [
      "./src/content/reiki-rising-fall-2026/*.pdf",
    ],
  },
  async redirects() {
    return [
      {
        source: "/reiki-rising/ReikiLevel1TrainingFinalPDF.pdf",
        destination: "/reiki-rising/reiki-rising-level-one-outline-fall-2026.pdf",
        permanent: true,
      },
      {
        source: "/is-reiki-calling-you",
        destination: "/reiki-rising",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source:
          "/:private(account|admin|checkout|event-attendance|forgot-password|library|login|reset-password)/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
