import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const connectSrc = ["'self'", apiBaseUrl].filter(Boolean).join(" ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self'; worker-src 'self'; connect-src ${connectSrc}`,
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ["192.168.184.25"],
};

export default nextConfig;
