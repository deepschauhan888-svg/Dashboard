import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { siteConfig } from "@/lib/config/site";
import { AuthProvider } from "@/lib/auth/auth-context";
import "./globals.css";

const ui = Inter_Tight({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const editorial = Source_Serif_4({ subsets: ["latin"], variable: "--font-editorial", display: "swap", style: ["normal", "italic"] });
const data = JetBrains_Mono({ subsets: ["latin"], variable: "--font-data", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Real Estate Intelligence. Beyond the Obvious.`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "real estate intelligence",
    "housing market research",
    "residential demand",
    "residential supply",
    "property price trends",
    "micromarket analysis",
    "MB Research",
    "Magicbricks",
  ],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Real Estate Intelligence. Beyond the Obvious.`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#071426",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${ui.variable} ${editorial.variable} ${data.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
