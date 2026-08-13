import type { NextConfig } from "next";

const DEFAULT_API_ORIGIN = "https://api.gongmozip.site";
const CLOUDFRONT_IMAGE_ORIGIN = "https://d348l9svthz9gw.cloudfront.net";
const S3_CONTEST_IMAGE_ORIGIN = "https://gongmozip-contest-images.s3.ap-northeast-2.amazonaws.com";

const apiOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_BASE_URL
      ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin
      : undefined;
  } catch {
    return undefined;
  }
})();
const connectSrc = Array.from(
  new Set([
    "'self'",
    DEFAULT_API_ORIGIN,
    CLOUDFRONT_IMAGE_ORIGIN,
    S3_CONTEST_IMAGE_ORIGIN,
    apiOrigin,
  ]),
)
  .filter(Boolean)
  .join(" ");
const imgSrc = Array.from(
  new Set(["'self'", "data:", CLOUDFRONT_IMAGE_ORIGIN, S3_CONTEST_IMAGE_ORIGIN]),
)
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
            value: `default-src 'self'; script-src 'self'; worker-src 'self'; connect-src ${connectSrc}; img-src ${imgSrc}`,
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ["192.168.184.25"],
};

export default nextConfig;
