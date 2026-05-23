import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Digital Gift Cards",
  description:
    "Browse digital gift cards for US shoppers across gaming, retail, streaming, food delivery, coffee, beauty, and travel with secure checkout and email delivery.",
  alternates: {
    canonical: "/our-digital-gift-cards"
  },
  openGraph: {
    title: "Our Digital Gift Cards | KarryCards",
    description:
      "Shop digital gift cards across gaming, retail, streaming, food delivery, coffee, beauty, and travel with secure checkout and email delivery.",
    url: "/our-digital-gift-cards",
    siteName: "KarryCards",
    type: "website"
  }
};

export default function DigitalGiftCardsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
