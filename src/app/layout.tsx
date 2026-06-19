import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { AffiliateReferralTracker } from "@/components/novelify/affiliate-referral-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
    { media: '(prefers-color-scheme: light)', color: '#F5F0EB' },
  ],
  colorScheme: 'dark light',
}

export const metadata: Metadata = {
  title: {
    default: "Novelify — AI Novel Writing, Revision, Translation, and Publishing Studio",
    template: "%s | Novelify",
  },
  description: "Plan, write, revise, translate, and publish novels with Novelify, an AI-powered writing studio for authors. Story Bible, Plot Board, AI Co-Writer, Revision Engine, Translation Studio, Publishing Center — all in one place.",
  keywords: [
    "Novelify",
    "AI novel writing software",
    "novel writing app",
    "AI writing studio for authors",
    "story bible software",
    "plot board for writers",
    "manuscript revision AI",
    "EPUB PDF DOCX export for novels",
    "literary translation",
    "Amazon KDP publishing",
  ],
  authors: [{ name: "Novelify" }],
  metadataBase: new URL('https://novelify.online'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: "/images/Novelify_logo_web.png",
  },
  openGraph: {
    title: "Novelify — AI Novel Writing, Revision, Translation, and Publishing Studio",
    description: "Plan, write, revise, translate, and publish novels with Novelify, an AI-powered writing studio for authors.",
    type: "website",
    siteName: "Novelify",
    url: "https://novelify.online",
    locale: 'en_US',
    images: [
      {
        url: "/images/Novelify_logo_web.png",
        width: 1200,
        height: 630,
        alt: "Novelify — AI-powered novel writing studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Novelify — AI Novel Writing Studio",
    description: "Plan, write, revise, translate, and publish novels with Novelify, an AI-powered writing studio for authors.",
    images: ["/images/Novelify_logo_web.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Novelify",
              "applicationCategory": "WritingApplication",
              "operatingSystem": "Web",
              "description": "Plan, write, revise, translate, and publish novels with Novelify, an AI-powered writing studio for authors.",
              "offers": [
                { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free plan" },
                { "@type": "Offer", "price": "9", "priceCurrency": "USD", "description": "Starter plan" },
                { "@type": "Offer", "price": "19", "priceCurrency": "USD", "description": "Pro plan" },
                { "@type": "Offer", "price": "49", "priceCurrency": "USD", "description": "Studio plan" },
              ],
            }),
          }}
        />
        <Providers>
          <AffiliateReferralTracker />
          {children}
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
