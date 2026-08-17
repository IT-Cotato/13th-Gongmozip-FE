const ALLOWED_REMOTE_IMAGE_ORIGINS = new Set([
  "https://d348l9svthz9gw.cloudfront.net",
  "https://gongmozip-contest-images.s3.ap-northeast-2.amazonaws.com",
]);

export function getNextImageSafeSrc(src: string | undefined) {
  if (!src) {
    return undefined;
  }

  if (src.startsWith("/")) {
    return src;
  }

  try {
    const url = new URL(src);

    return ALLOWED_REMOTE_IMAGE_ORIGINS.has(url.origin) ? src : undefined;
  } catch {
    return undefined;
  }
}
