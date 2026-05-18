import type { Metadata } from "next";
import PromoStrip from "./components/PromoStrip";
import TawkToChat from "./components/TawkToChat";
import VisitorTracker from "./components/VisitorTracker";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://karrycards.vercel.app"),
  title: {
    default: "KarryCards | Trusted Digital Gift Cards",
    template: "%s | KarryCards"
  },
  description:
    "Buy trusted digital gift cards online with secure checkout, instant payment confirmation, email delivery, and order tracking for customers worldwide.",
  keywords: [
    "buy gift cards online",
    "digital gift cards online",
    "discount gift cards",
    "global gift card store",
    "USA gift cards online",
    "crypto gift cards",
    "gift cards with crypto",
    "Amazon gift card discount",
    "Apple gift card discount",
    "PlayStation gift card discount",
    "Visa gift card online",
    "digital gift cards",
    "trusted gift cards",
    "gaming gift cards",
    "streaming gift cards",
    "retail gift cards",
    "KarryCards"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "KarryCards | Trusted Digital Gift Cards",
    description:
      "Buy trusted digital gift cards online with secure checkout, fast payment confirmation, and email delivery.",
    url: "/",
    siteName: "KarryCards",
    images: [
      {
        url: "/logos/logo4.svg",
        width: 960,
        height: 240,
        alt: "KarryCards"
      }
    ],
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  },
  twitter: {
    card: "summary_large_image",
    title: "KarryCards | Discount Digital Gift Cards",
    description: "Buy trusted digital gift cards online with secure checkout and email delivery."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "KarryCards",
    url: "https://karrycards.vercel.app",
    logo: "https://karrycards.vercel.app/logos/logo4.svg",
    foundingDate: "2013",
    description: "Digital gift card store serving online shoppers worldwide since 2013.",
    areaServed: ["US", "CA", "GB", "EU", "AU", "NG", "KE", "ZA", "AE", "Worldwide"],
    paymentAccepted: "Cryptocurrency",
    priceRange: "$$",
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Digital gift cards",
      itemListElement: [
        "Gaming gift cards",
        "Retail gift cards",
        "Streaming gift cards",
        "Food delivery gift cards",
        "Travel gift cards",
        "Prepaid gift cards"
      ].map((name) => ({
        "@type": "OfferCatalog",
        name
      }))
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://karrycards.vercel.app/our-digital-gift-cards?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <VisitorTracker />
        <PromoStrip />
        {children}
        <TawkToChat />
      </body>
    </html>
  );
}
