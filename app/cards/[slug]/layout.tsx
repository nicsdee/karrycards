import type { Metadata } from "next";
import { giftCards } from "../../data";
import { discountedPriceForCard } from "../../lib/pricing";

type CardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }> | { slug: string };
};

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}

export async function generateMetadata({ params }: Omit<CardLayoutProps, "children">): Promise<Metadata> {
  const { slug } = await params;
  const card = giftCards.find((item) => item.slug === slug);

  if (!card) {
    return {
      title: "Gift Card",
      robots: {
        index: false,
        follow: true
      }
    };
  }

  const salePrice = discountedPriceForCard(card);
  const title = `${card.productName} Online`;
  const description = `Buy a ${card.productName} online from KarryCards. ${card.category} gift card, USD pricing from ${money(salePrice)}, secure checkout, order tracking, and automatic email delivery after blockchain confirmation.`;

  return {
    title,
    description,
    keywords: [
      `${card.brand} gift card`,
      `${card.productName} online`,
      `buy ${card.brand} gift card`,
      `${card.category} gift cards`,
      "digital gift cards USA",
      "KarryCards"
    ],
    alternates: {
      canonical: `/cards/${card.slug}`
    },
    openGraph: {
      title: `${title} | KarryCards`,
      description,
      url: `/cards/${card.slug}`,
      siteName: "KarryCards",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | KarryCards`,
      description
    }
  };
}

export default function CardLayout({ children }: CardLayoutProps) {
  return children;
}
