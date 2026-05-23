import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karrycards.com";

export const metadata: Metadata = {
  title: "Buy Digital Gift Cards Online in the USA",
  description:
    "Buy digital gift cards online in the USA for gaming, retail, streaming, food delivery, coffee, beauty, and travel. Secure crypto checkout, order tracking, and email delivery.",
  keywords: [
    "buy gift cards online USA",
    "digital gift cards",
    "online gift cards",
    "gaming gift cards",
    "retail gift cards",
    "streaming gift cards",
    "food delivery gift cards",
    "gift cards with crypto",
    "KarryCards"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Buy Digital Gift Cards Online in the USA | KarryCards",
    description:
      "Find popular digital gift cards across gaming, retail, streaming, food delivery, coffee, travel, and beauty with secure checkout and order tracking.",
    url: "/",
    siteName: "KarryCards",
    images: [
      {
        url: "/logos/logo4.svg",
        width: 960,
        height: 240,
        alt: "KarryCards digital gift card marketplace"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Digital Gift Cards Online in the USA | KarryCards",
    description: "Shop trusted digital gift cards with secure checkout, email delivery, and order tracking."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function Home() {
  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Buy Digital Gift Cards Online in the USA",
    url: `${siteUrl}/`,
    description:
      "Shop digital gift cards for gaming, retail, streaming, food delivery, coffee, travel, beauty, and everyday gifting.",
    isPartOf: {
      "@type": "WebSite",
      name: "KarryCards",
      url: `${siteUrl}/`
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Popular digital gift card categories",
      itemListElement: [
        "Gaming gift cards",
        "Retail gift cards",
        "Streaming gift cards",
        "Food delivery gift cards",
        "Beauty gift cards",
        "Travel gift cards"
      ].map((name, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name
      }))
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }} />
      <HomeClient />
    </>
  );
}
