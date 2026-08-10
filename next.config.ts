import type { NextConfig } from "next";

const DEFAULT_API_ORIGIN = "https://api.gongmozip.site";

const apiOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_BASE_URL
      ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin
      : undefined;
  } catch {
    return undefined;
  }
})();
const connectSrc = Array.from(new Set(["'self'", DEFAULT_API_ORIGIN, apiOrigin]))
  .filter(Boolean)
  .join(" ");

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
