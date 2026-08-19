import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import MobileFrame from "@/components/layout/MobileFrame";
import { PwaServiceWorker } from "./PwaServiceWorker";
import { Providers } from "./providers";

const SITE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://gongmozip.site";
const OG_IMAGE = "/opengraph-image";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Gongmozip",
  title: "Gongmozip",
  description: "여기를 눌러 링크를 확인하세요.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gongmozip",
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Gongmozip",
    description: "여기를 눌러 링크를 확인하세요.",
    url: SITE_URL,
    siteName: "Gongmozip",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Gongmozip",
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gongmozip",
    description: "여기를 눌러 링크를 확인하세요.",
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ff7658",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <PwaServiceWorker />
        <MobileFrame>
          <Providers>{children}</Providers>
        </MobileFrame>
      </body>
    </html>
  );
}
