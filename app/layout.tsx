import "@/styles/globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://xedscreener.xyz"),
  title: {
    default: "XED Screener - Free Solana Token Metadata Registry",
    template: "%s | XED Screener",
  },
  description: "FREE Solana token metadata infrastructure. No $300 fees. Permissionless, immutable, standardized. Submit your token metadata in minutes.",
  keywords: [
    "Solana",
    "token metadata",
    "crypto",
    "blockchain",
    "token registry",
    "free metadata",
    "SPL token",
    "Solana tokens",
    "token submission",
    "XED Screener",
  ],
  authors: [{ name: "XED Screener", url: "https://xedscreener.xyz" }],
  creator: "XED Screener",
  publisher: "XED Screener",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://xedscreener.xyz",
    siteName: "XED Screener",
    title: "XED Screener - Free Solana Token Metadata Registry",
    description: "FREE Solana token metadata infrastructure. No $300 fees. Permissionless, immutable, standardized.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "XED Screener - Free Solana Token Metadata",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XED Screener - Free Solana Token Metadata Registry",
    description: "FREE Solana token metadata infrastructure. No $300 fees. Permissionless, immutable, standardized.",
    creator: "@XEDscreener",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="XED Screener" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
