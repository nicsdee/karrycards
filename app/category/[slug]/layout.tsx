import type { Metadata } from "next";
import { categories } from "../../data";

type CategoryLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata({ params }: Omit<CategoryLayoutProps, "children">): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: "Gift Card Category",
      robots: {
        index: false,
        follow: true
      }
    };
  }

  return {
    title: `${category.navLabel} Gift Cards`,
    description: `Shop ${category.navLabel.toLowerCase()} gift cards online with secure checkout, USD pricing, order tracking, and email delivery from KarryCards.`,
    alternates: {
      canonical: `/category/${category.slug}`
    },
    openGraph: {
      title: `${category.navLabel} Gift Cards | KarryCards`,
      description: `Browse ${category.navLabel.toLowerCase()} digital gift cards with secure checkout and email delivery.`,
      url: `/category/${category.slug}`,
      siteName: "KarryCards",
      type: "website"
    }
  };
}

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return children;
}
