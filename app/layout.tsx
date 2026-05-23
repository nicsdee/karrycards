import type { Metadata } from "next";
import PromoStrip from "./components/PromoStrip";
import TawkToChat from "./components/TawkToChat";
import VisitorTracker from "./components/VisitorTracker";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karrycards.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KarryCards | Digital Gift Cards for US Shoppers",
    template: "%s | KarryCards"
  },
  description:
    "Buy digital gift cards online in the USA for gaming, retail, streaming, food delivery, coffee, beauty, and travel with secure checkout and email delivery.",
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
    title: "KarryCards | Digital Gift Cards for US Shoppers",
    description:
      "Buy digital gift cards online for gaming, retail, streaming, food delivery, coffee, beauty, and travel with secure checkout and email delivery.",
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
    title: "KarryCards | Digital Gift Cards for US Shoppers",
    description: "Buy digital gift cards online with secure checkout, order tracking, and email delivery."
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
    url: siteUrl,
    logo: `${siteUrl}/logos/logo4.svg`,
    foundingDate: "2013",
    description: "Digital gift card store serving online shoppers in the United States.",
    areaServed: ["US"],
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
      target: `${siteUrl}/our-digital-gift-cards?search={search_term_string}`,
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
