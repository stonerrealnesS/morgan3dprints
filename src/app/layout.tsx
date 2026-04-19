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

export const metadata: Metadata = {
  title: {
    default: "Morgan 3D Prints | Custom 3D Printing Studio — OKC",
    template: "%s | Morgan 3D Prints",
  },
  description:
    "Custom 3D-printed products handcrafted in OKC. Shop keychains, novelty items, glow-in-the-dark pieces, and more. Print by the hour or order something custom.",
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
