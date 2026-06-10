import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Novelify — From Idea to Global",
  description: "AI-powered platform that helps writers craft, translate, and publish their novels to global markets like Amazon KDP.",
  keywords: ["Novelify", "AI writing", "novel translation", "EPUB export", "Amazon KDP", "literary translation"],
  authors: [{ name: "Novelify" }],
  icons: {
    icon: "/images/novelify-icon.png",
  },
  openGraph: {
    title: "Novelify — From Idea to Global",
    description: "AI-powered platform for writers to craft, translate, and publish novels worldwide",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
