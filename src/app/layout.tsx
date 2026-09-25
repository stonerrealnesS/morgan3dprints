import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// GA4 measurement ID for the "Morgan 3D Prints" web data stream in Google
// Analytics. Measurement IDs are meant to be public (they're visible in any
// page's rendered source), so this is safe to hardcode rather than route
// through an env var.
const GA_MEASUREMENT_ID = "G-1J4HDGJW43";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.morgan3dokc.com";
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
  // Proves site ownership to Google Merchant Center / Search Console so the
  // product feed can be claimed and verified from there.
  verification: {
    google: [
      "RDHihFu_ZZgY76BpzFjyGUPJQyB_osvtSy5vSClo93A",
      "iIGMtnr0YmSJA106SLCY4JcnxBHM3Xupa2X2K7Seu5E",
    ],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Morgan 3D Prints",
  description: "Custom 3D-printed products handcrafted in Oklahoma City. Shop keychains, glow-in-the-dark art, novelty decor, and more — or submit a fully custom order.",
  url: "https://www.morgan3dokc.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1700 S Morgan Road Suite H",
    addressLocality: "Oklahoma City",
    addressRegion: "OK",
    postalCode: "73128",
    addressCountry: "US",
  },
  priceRange: "$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Credit Card",
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
          />
          {/* Google Analytics 4 — pageviews, ecommerce/purchase events (see
              PurchaseTracker on the order confirmation page), and Enhanced
              Measurement (scroll depth, outbound clicks, etc). */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
