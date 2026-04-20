import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://morgan3dokc.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Morgan 3D Prints | Custom 3D Printing — OKC",
    template: "%s | Morgan 3D Prints",
  },
  description:
    "Custom 3D-printed products handcrafted in Oklahoma City. Shop keychains, novelty decor, glow-in-the-dark art, and more. Local pickup free. Print by the hour available.",
  keywords: ["3D printing", "OKC", "Oklahoma City", "custom prints", "keychains", "novelty gifts", "glow in the dark"],
  authors: [{ name: "Morgan 3D Prints", url: BASE }],
  openGraph: {
    type: "website",
    siteName: "Morgan 3D Prints",
    locale: "en_US",
    url: BASE,
    title: "Morgan 3D Prints | Custom 3D Printing — OKC",
    description:
      "Custom 3D-printed products handcrafted in Oklahoma City. Shop 100+ unique items or order something custom.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Morgan 3D Prints | Custom 3D Printing — OKC",
    description: "Custom 3D-printed products handcrafted in OKC.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
        <body className="min-h-full flex flex-col antialiased bg-[#050508] text-[#f0f0ff]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
