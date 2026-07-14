import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { PwaServiceWorker } from "./PwaServiceWorker";
import { Providers } from "./providers";

export const metadata: Metadata = {
  applicationName: "Gongmozip",
  title: "Gongmozip",
  description: "Gongmozip frontend web application",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gongmozip",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
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
    <html lang="en">
      <body>
        <PwaServiceWorker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
