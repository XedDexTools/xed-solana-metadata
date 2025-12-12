import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XED Screener - Free Solana Token Metadata",
  description: "FREE Solana token metadata infrastructure. No $300 fees. Permissionless, immutable, standardized.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
